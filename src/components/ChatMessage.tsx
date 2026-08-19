import type { ChatMessage } from "../types/chat";
import { Avatar } from "antd";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import MarkdownRenderer from "./MarkdownRenderer";

interface Props {
    message: ChatMessage,
    onRegenerate?:()=>void,
    isLast:boolean
}

/**
 * ChatMessageComponent 消息气泡组件
 * 负责渲染单条消息，包括头像、内容、时间
 * 用户消息靠右蓝色，助手消息靠左白色
 */
const ChatMessageComponet: React.FC<Props> = ({ message,onRegenerate,isLast }) => {
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

            <div className="message-content">
                {/* 消息气泡：loading 时显示提示，否则渲染 Markdown 内容 */}
                <div className="bubble">
                    {message.loading ? '正在输入...' : <MarkdownRenderer content={message.content} />}
                </div>
                {/* 时间戳 */}
                <div className="time">{time}</div>
                {/* 引用来源 */}
                {message.sources && message.sources.length > 0 && (
                    <div className="sources">
                        <div className="sources-title">📚 引用来源：</div>
                        {message.sources.map((s, i) => (
                            <div key={i} className="source-item">
                                <span className="source-name">{s.fileName}</span>
                                <span className="source-text">{s.text}...</span>
                            </div>
                        ))}
                    </div>
                )}
                {message.token&&<div className="usageClass">共消耗{message.token}token</div>}
                
                {!isUser&&!message.loading&&onRegenerate&&isLast&&(
                    <button onClick={onRegenerate} className="regenerate-btn">
                                🔄 重新生成
                    </button>
                )}

            </div>
        </div>
    )
}

export default ChatMessageComponet
