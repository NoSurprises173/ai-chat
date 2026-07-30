import type { ChatMessage } from "../types/chat";
import { Avatar } from "antd";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import MarkdownRenderer from "./MarkdownRenderer";

interface Props {
    message: ChatMessage
}

/**
 * ChatMessageComponent 消息气泡组件
 * 负责渲染单条消息，包括头像、内容、时间
 * 用户消息靠右蓝色，助手消息靠左白色
 */
const ChatMessageComponet: React.FC<Props> = ({ message }) => {
    // 判断是否为用户消息
    const isUser = message.role === 'user'

    // 格式化时间戳为 HH:mm 格式
    const time = new Date(message.timestamp).toLocaleString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    })

    return (
        // 消息行容器，根据角色添加对应 className
        <div className={`message-row ${message.role}`}>
            {/* 头像：用户蓝色，助手绿色 */}
            <Avatar
                icon={isUser ? <UserOutlined /> : <RobotOutlined />}
                style={{ backgroundColor: isUser ? '#1677ff' : '#87d068' }}
            />

            <div>
                {/* 消息气泡：loading 时显示提示，否则渲染 Markdown 内容 */}
                <div className="bubble">
                    {message.loading ? '正在输入...' : <MarkdownRenderer content={message.content} />}
                </div>
                {/* 时间戳 */}
                <div className="time">{time}</div>
            </div>
        </div>
    )
}

export default ChatMessageComponet
