import { ChatMessage } from "../types/chat";
import { Avatar } from "antd";
import { UserOutlined,RobotOutlined } from "@ant-design/icons";

interface Props {
    message:ChatMessage
}

const ChatMessageComponet:React.FC<Props>=({message})=>{
    const isUser = message.role ==='user'
    const time = new Date(message.timestamp).toLocaleString('zh-CN',{
        hour:'2-digit',
        minute:'2-digit'
    })

    return (
        <div className={`message-row ${message.role}`}>
            <Avatar
            icon={isUser?<UserOutlined/>:<RobotOutlined/>}
            style={{ backgroundColor: isUser ? '#1677ff' : '#87d068' }}
        />

        <div>
<div className="bubble">
    {message.loading?'正在输入。。。':message.content}
</div>
<div className="time"{time}></div>
        </div>
        </div>
        )
}

export default ChatMessageComponet