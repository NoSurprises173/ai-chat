import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "./types/chat";
import ChatMessageComponet from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import './App.css'
import PdfUpload from "./components/PdfUpload";
import { sendMessageStream } from "./service/api";
import {  message } from "antd";
/**
 * App 主组件
 * 负责管理聊天消息列表、处理发送逻辑、自动滚动
 */
function App() {
    // 消息列表状态
    const [messages, setMessages] = useState<ChatMessage[]>([])
    // 是否正在等待 AI 回复
    const [loading, setLoading] = useState(false)
    // 消息列表底部的 ref，用于自动滚动
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const [pdfContext,setPdfContext] = useState<string>('')
    const [pdfName,setPdfName] = useState<string>('')


    // 监听消息变化，自动滚动到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    /**
     * 发送消息处理函数
     * @param content 用户输入的消息内容
     */
    const handleSend = async (content: string) => {
        // 1. 创建用户消息并添加到列表
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: Date.now()
        }
        setMessages(prev => [...prev, userMessage])

        // 2. 生成助手消息的 ID（用于后续流式更新）
        const assistantId = (Date.now() + 1).toString()

        // 3. 添加"正在输入"的占位消息
        setLoading(true)
        const loadingMessage: ChatMessage = {
            id: assistantId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            loading: true
        }
        setMessages(prev => [...prev, loadingMessage])


        const fullContent = pdfContext?`以下是参考资料《${pdfName}》的内容：\n\n${pdfContext.slice(0, 3000)}\n\n---\n\n用户问题：${content}`:content
        // 4. 流式接收 AI 回复
        try {
            await sendMessageStream(fullContent, (chunk) => {
                // 每收到一块内容，更新对应消息的内容
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === assistantId
                            ? { ...msg, content: msg.content + chunk, loading: false }
                            : msg
                    )
                )
            })
        } catch (err: any) {
            // 请求失败时显示错误信息
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === assistantId
                        ? { ...msg, content: `请求失败：${err.message}`, loading: false }
                        : msg
                )
            )
        } finally {
            // 无论成功失败，关闭 loading 状态
            setLoading(false)
        }
    }

    /**
     * 
     * 上传处理函数
     * @param 
     */

    const handlePdfUpload=(text:string,filename:string)=>{
        setPdfContext(text)
        setPdfName(filename)
        message.success(`已加载：${filename}`)
    }



    return (
        <div className="app">
            {/* 头部标题栏 */}
            <div className="header">
                <h2>demo</h2>
            </div>

            {/* 消息列表区域 */}
            <div className="message-list">
                {/* 空状态提示 */}
                {messages.length === 0 && (
                    <div className="empty">
                        开始对话吧
                    </div>
                )}
                {/* 渲染每条消息 */}
                {messages.map(msg => (
                    <ChatMessageComponet key={msg.id} message={msg} />
                ))}

                {/* 滚动锚点 */}
                <div ref={messagesEndRef} />
            </div>

            {/* 输入框区域 */}
            <div className="input-area" style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
    <PdfUpload onUpload={handlePdfUpload} loading={loading} />
    <ChatInput onSend={handleSend} loading={loading} />
</div>
        </div>
    )
}

export default App
