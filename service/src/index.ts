/**
 * 后端服务入口
 * 提供 SSE 流式聊天接口，转发请求到 OpenAI API
 */

import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'
import dotenv from 'dotenv'
import multer from 'multer'
import pdfParse from 'pdf-parse'
import { processDocument, retrieveContext } from './rag/ragService'

// 加载 .env 环境变量
dotenv.config()

const app = express()

// 中间件配置
app.use(cors())                    // 允许跨域请求（前端 5174 访问后端 3001）
app.use(express.json())           // 解析 JSON 请求体

// 创建 OpenAI 客户端实例
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,    // API Key 从环境变量读取
    baseURL: process.env.OPENAI_BASE_URL   // 支持自定义 API 地址（中转站等）
})

/**
 * POST /api/chat - 聊天接口（流式）
 * 接收用户消息，调用 OpenAI API，以 SSE 格式流式返回
 */
app.post('/api/chat', async (req, res) => {
    const startTime = Date.now()
    console.log(`\n📨 [${new Date().toLocaleTimeString()}] 收到请求`)
    console.log(`   用户消息: ${req.body.message}`)

    try {
        const { message } = req.body
        const context = await retrieveContext(message)

        // 设置 SSE 响应头
        res.setHeader('Content-Type', 'text/event-stream')   // 事件流格式
        res.setHeader('Cache-Control', 'no-cache')            // 禁用缓存
        res.setHeader('Connection', 'keep-alive')             // 保持连接
        const systemContent = context
            ? `你是AI助手。以下是参考资料：\n\n${context}\n\n请根据以上资料回答用户问题。`
            : '你是一个有帮助的AI助手。'
        // 调用 OpenAI API，开启流式模式
        const stream = await client.chat.completions.create({
            model: process.env.MODEL as string,
            messages: [
                { role: 'system', content: systemContent },
                { role: 'user', content: message }
            ],
            stream: true   // 开启流式输出
        })

        // 逐块读取流式响应
        let fullContent = ''
        for await (const chunk of stream) {
            // 提取本次 chunk 的内容（可能为空）
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
                fullContent += content
                // 以 SSE 格式发送数据：data:{json}\n\n
                res.write(`data:${JSON.stringify({ content })}\n\n`)
            }
        }

        // 发送结束标记
        res.write('data:[DONE]\n\n')
        res.end()

        // 日志：记录完成信息
        const duration = Date.now() - startTime
        console.log(`✅ 流式完成 | 耗时: ${duration}ms | ${fullContent.length} 字符`)
    } catch (error: any) {
        // 日志：记录错误信息
        const duration = Date.now() - startTime
        console.error(`❌ 请求失败 | 耗时: ${duration}ms | 错误: ${error.message}`)

        // 发送错误信息给前端
        res.write(`data:${JSON.stringify({ error: error.message })}\n\n`)
        res.end()
    }
})

const upload = multer({ storage: multer.memoryStorage() })

/**
 * POST /api/upload-PDF上传接口
 * 接收pdf文件，提取文本内容返回
 * 
 */

app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '没有上传文件。' })
        }
        const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8')

        if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ error: '只支持PDF文件' })
        }

        const pdfData = await pdfParse(req.file.buffer)
        console.log(`📄 PDF 上传成功: ${req.file.originalname}`)
        console.log(`   页数: ${pdfData.numpages}, 字符数: ${pdfData.text.length}`)
        await processDocument(pdfData.text, originalName)

        res.json({
            filename: originalName,
            pages: pdfData.numpages,
            text: pdfData.text
        })

    } catch (error: any) {
        console.error(`❌ PDF 处理失败: ${error.message}`)
        res.status(500).json({ error: error.message })
    }

})


// 启动服务器
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`✅ 后端服务已启动: http://localhost:${PORT}`)
    console.log(`📝 接口地址: POST http://localhost:${PORT}/api/chat`)
    console.log(`---`)
})
