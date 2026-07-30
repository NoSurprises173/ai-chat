import { useState } from "react";
import { Input, Button } from "antd";
import { SendOutlined } from "@ant-design/icons";

interface Props {
    onSend: (content: string => void   // 发送消息的回调函数
    loading?: boolean                    // 是否正在等待回复
}

/**
 * ChatInput 输入框组件
 * 负责消息输入、键盘事件处理、发送逻辑
 * 支持 Enter 发送、Shift+Enter 换行
 */
const ChatInput: React.FC<Props> = ({ onSend, loading }) => {
    // 输入框内容状态
    const [value, setValue] = useState('')

    /**
     * 发送消息
     * 校验非空、调用父组件回调、清空输入框
     */
    const handleSend = () => {
        const trimmed = value.trim()
        if (!trimmed || loading) return   // 空消息或加载中不发送
        onSend(trimmed)                   // 调用父组件传入的回调
        setValue('')                      // 清空输入框
    }

    /**
     * 键盘事件处理
     * Enter: 发送消息
     * Shift+Enter: 换行
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()   // 阻止默认换行行为
            handleSend()
        }
    }

    return (
        <div className="input-area" style={{ display: 'flex', gap: 8 }}>
            {/* 输入框：自动撑高，最多 4 行 */}
            <Input.TextArea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
                autoSize={{ minRows: 1, maxRows: 4 }}
                disabled={loading}
                style={{ flex: 1 }}
            />
            {/* 发送按钮：带图标，加载中显示转圈 */}
            <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={loading}
                disabled={!value.trim()}
            >
                发送
            </Button>
        </div>
    )
}

export default ChatInput
