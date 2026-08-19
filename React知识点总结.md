# React 知识点总结

> 基于 AI Chat 项目整理，涵盖项目中用到的所有 React 核心知识。

---

## 一、核心 Hooks

### 1. useState - 状态管理

```tsx
// 基本用法
const [loading, setLoading] = useState(false)
const [value, setValue] = useState('')

// 复杂初始值（函数式初始化，只在首次渲染执行）
const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('chat-messages')
    return saved ? JSON.parse(saved) : []
})
```

**项目应用：** `messages`（消息列表）、`loading`（加载状态）、`value`（输入框内容）

---

### 2. useEffect - 副作用处理

```tsx
// 监听依赖变化，执行副作用
useEffect(() => {
    localStorage.setItem('chat-messages', JSON.stringify(messages))
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}, [messages])  // 依赖数组：messages 变化时执行
```

**项目应用：** 自动滚动到底部、消息持久化到 localStorage

---

### 3. useRef - 引用与可变值

```tsx
// 用法1：引用 DOM 元素
const messagesEndRef = useRef<HTMLDivElement>(null)
messagesEndRef.current?.scrollIntoView()

// 用法2：引用 input 元素（antd Button + hidden input 模式）
const inputRef = useRef<HTMLInputElement>(null)
inputRef.current?.click()

// 用法3：保存可变值（不触发重新渲染）
const abortControllerRef = useRef<AbortController | null>(null)
abortControllerRef.current = controller
```

**项目应用：** 滚动锚点、文件上传、中断请求

---

## 二、状态更新模式

### 1. 函数式更新

```tsx
// 使用 prev 获取最新状态，避免闭包陷阱
setMessages(prev => [...prev, newMessage])
setLoading(prev => !prev)
```

### 2. 不可变更新

```tsx
// 修改数组中的某一项（用 map 返回新数组）
setMessages(prev =>
    prev.map(msg =>
        msg.id === assistantId
            ? { ...msg, content: msg.content + chunk }  // 展开运算符复制并修改
            : msg                                         // 不匹配的保持原样
    )
)

// 删除最后一项
setMessages(prev => prev.slice(0, -1))

// 添加一项
setMessages(prev => [...prev, newItem])
```

---

## 三、组件通信

### 父 → 子：Props 传递

```tsx
// 父组件传递
<ChatMessage message={msg} onRegenerate={handleRegenerate} />

// 子组件接收
interface Props {
    message: ChatMessage
    onRegenerate?: () => void   // 可选回调
}

const ChatMessage: React.FC<Props> = ({ message, onRegenerate }) => {
    return <div>{message.content}</div>
}
```

### 子 → 父：回调函数

```tsx
// 父组件定义回调
const handleSend = (content: string) => { ... }

// 传给子组件
<ChatInput onSend={handleSend} />

// 子组件调用
const ChatInput: React.FC<Props> = ({ onSend }) => {
    const handleClick = () => {
        onSend(value)  // 调用父组件传入的函数
    }
}
```

---

## 四、TypeScript 类型

### 1. 接口定义

```tsx
export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
    id: string                          // 必填
    role: ChatRole                      // 联合类型
    content: string
    timestamp: number
    loading?: boolean                   // 可选属性
    sources?: { fileName: string; text: string }[]  // 对象数组
    token?: number
}
```

### 2. 组件 Props 类型

```tsx
interface Props {
    onSend: (content: string) => void    // 函数类型
    loading?: boolean                     // 可选
    onStop?: () => void                   // 无参函数
}
```

### 3. 泛型使用

```tsx
useState<ChatMessage[]>([])        // 指定 state 类型
useRef<HTMLDivElement>(null)       // 指定 ref 引用的元素类型
useRef<AbortController | null>(null) // 联合类型
```

### 4. 类型导入

```tsx
import type { ChatMessage } from "./types/chat"  // type-only 导入
```

---

## 五、事件处理

### 1. 键盘事件

```tsx
const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()   // 阻止默认行为
        handleSend()
    }
}
```

### 2. 输入事件

```tsx
<Input.TextArea onChange={(e) => setValue(e.target.value)} />
```

### 3. 文件选择事件

```tsx
<input
    type="file"
    accept=".pdf"
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        // 处理文件...
        e.target.value = ''  // 清空，允许重复上传同一文件
    }}
/>
```

### 4. 点击事件

```tsx
<Button onClick={handleSend} />
<button onClick={onRegenerate}>重新生成</button>
```

---

## 六、条件渲染

```tsx
// 1. 三元表达式
{message.loading ? '正在输入...' : <MarkdownRenderer content={message.content} />}

// 2. 短路运算（条件 && 元素）
{messages.length === 0 && <div className="empty">开始对话吧</div>}

// 3. 多条件判断
{message.sources && message.sources.length > 0 && (
    <div className="sources">...</div>
)}

// 4. 按钮文字切换
{!loading ? '发送' : '暂停'}
```

---

## 七、列表渲染

```tsx
{messages.map((msg, index) => (
    <ChatMessageComponet
        key={msg.id}                    // 必须有唯一 key
        message={msg}
        isLast={index === messages.length - 1}  // 可以用 index
    />
))}
```

**注意事项：**
- `key` 必须是唯一且稳定的值（用 id，不要用 index）
- `index` 可以用于判断位置（如是否是最后一条）

---

## 八、受控组件

```tsx
// Input 的值完全由 state 控制
const [value, setValue] = useState('')

<Input.TextArea
    value={value}                                    // 绑定 state
    onChange={(e) => setValue(e.target.value)}        // 更新 state
    placeholder="输入消息..."
    autoSize={{ minRows: 1, maxRows: 4 }}            // antd 特有属性
    disabled={loading}                               // 条件禁用
/>
```

---

## 九、Hidden Input 模式（antd Button + 文件上传）

```tsx
const inputRef = useRef<HTMLInputElement>(null)

// 点击按钮时，手动触发隐藏的 input
const handleClick = () => {
    inputRef.current?.click()
}

return (
    <>
        <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}     // 隐藏 input
        />
        <Button onClick={handleClick}>上传 PDF</Button>
    </>
)
```

**为什么这么做：** antd Button 的点击事件不会冒泡到 label，所以用 `useRef` + `click()` 手动触发。

---

## 十、异步操作与流式处理

```tsx
const handleSend = async (content: string) => {
    // 创建 AbortController 用于中断请求
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
        await sendMessageStream(content, onChunk, onSources, controller.signal)
    } catch (err: any) {
        if (err.name === 'AbortError') return  // 用户主动取消，不报错
        // 其他错误处理...
    } finally {
        setLoading(false)  // 无论成功失败都关闭 loading
    }
}

// 中断请求
const handleStop = () => {
    abortControllerRef.current?.abort()
}
```

---

## 十一、SSE 流式数据处理

```tsx
// 在 api.ts 中处理 Server-Sent Events
const reader = response.body!.getReader()
const decoder = new TextDecoder()
let buffer = ''

while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
        if (line.startsWith('data:')) {
            const data = line.slice(5)
            if (data === '[DONE]') return

            const parsed = JSON.parse(data)
            if (parsed.content) onChunk(parsed.content)
            if (parsed.sources) onSources(parsed.sources)
            if (parsed.usage) onUsage(parsed.usage.total_tokens)
        }
    }
}
```

---

## 十二、CSS 样式方案

### 1. 全局 CSS 文件

```tsx
import './App.css'
// 使用 className
<div className="message-list">
```

### 2. 内联样式

```tsx
<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
```

### 3. 条件 className

```tsx
<div className={`message-row ${message.role}`}>
// 生成：message-row user 或 message-row assistant
```

---

## 十三、项目架构模式

```
src/
├── types/
│   └── chat.ts           # 类型定义
├── components/
│   ├── ChatMessage.tsx    # 消息气泡组件
│   ├── ChatInput.tsx      # 输入框组件
│   ├── PdfUpload.tsx      # PDF上传组件
│   └── MarkdownRenderer.tsx # Markdown渲染组件
├── service/
│   └── api.ts             # API 请求封装
├── App.tsx                # 主组件（状态管理）
└── App.css                # 样式
```

**设计原则：**
- **状态提升：** 共享状态放在最近的公共父组件
- **单一职责：** 每个组件只负责一件事
- **回调通信：** 子组件通过回调通知父组件
