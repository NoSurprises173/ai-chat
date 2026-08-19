/**
 * API 服务层
 * 封装与后端的通信逻辑
 * 通过 Vite 代理转发请求到 localhost:3001
 */

// API 基础路径（空字符串表示使用 Vite 代理）
const API_BASE = ''

/**
 * 发送消息（非流式，保留备用）
 * @param content 消息内容
 * @returns AI 回复文本
 */
export async function sendMessage(content: string): Promise<string> {
    const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content })
    })

    if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`)
    }
    const data = await response.json()
    return data.reply
}

/**
 * 发送消息（流式版本）
 * 使用 SSE (Server-Sent Events) 接收流式数据
 * @param content 消息内容
 * @param onChunk 每收到一块内容时的回调函数
 */
export async function sendMessageStream(
    content: string,
    onChunk: (text: string) => void,
    onSources: (sources: { fileName: string; text: string }[]) => void,
    onUsage: (usage: number) => void,
    signal?: AbortSignal
): Promise<void> {
    const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
        signal
    })

    if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`)
    }

    // 获取响应流的读取器
    const reader = response.body!.getReader()
    // 文本解码器，将二进制数据转为字符串
    const decoder = new TextDecoder()
    // 缓冲区，处理不完整的数据块
    let buffer = ''

    while (true) {
        const { done, value } = await reader.read()
        if (done) break   // 流结束

        // 将二进制数据解码为文本，追加到缓冲区
        buffer += decoder.decode(value, { stream: true })

        // 按换行符分割，解析 SSE 事件
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''   // 最后一行可能不完整，留到下次处理

        for (const line of lines) {
            // SSE 数据以 "data:" 开头
            if (line.startsWith('data:')) {
                const data = line.slice(5)   // 去掉 "data:" 前缀

                // 结束标记
                if (data === '[DONE]') return

                try {
                    const parsed = JSON.parse(data)
                    // 收到内容块，调用回调
                    if (parsed.content) {
                        onChunk(parsed.content)
                    }
                    if (parsed.sources) {
                        onSources(parsed.sources)
                    }
                    if (parsed.usage) {
                        console.log(parsed.usage.total_tokens, 'api')
                        onUsage(parsed.usage.total_tokens)
                    }
                    // 收到错误信息
                    if (parsed.error) {
                        throw new Error(parsed.error)
                    }
                } catch (e) {
                    console.log(e)
                }
            }
        }
    }
}

/**
 * 上传pdf文件
 * @param file pdf 文件对象
 * @returns 提取的文本内容
 */
export async function uploadPDF(file: File): Promise<{ filename: string; pages: number; text: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData
    })

    if (!response.ok) {
        throw new Error(`上传失败：${response.status}`)
    }
    return response.json()
}
