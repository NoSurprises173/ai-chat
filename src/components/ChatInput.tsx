import { useState } from "react";
import { Input,Button } from "antd";
import { SendOutlined } from "@ant-design/icons";
interface Props{
    onSend:(content:string)=>void
    loading?:boolean
}

const ChatInput:React.FC<Props>=({onSend,loading})=>{
    const [value,setValue] = useState('')

    const handleSend=()=>{
        const trimmed = value.trim()
        if(!trimmed ||loading)return
        onSend(trimmed)
        setValue('')
    }
    4
    const handleKeyDown = (e:React.KeyboardEvent<HTMLTextAreaElement>)=>{
        if(e.key==='Enter'&&!e.shiftKey){
            e.preventDefault()
            handleSend()
        }
    }
    return(
        <div className="input-area" style={{display:'flex',gap:8}}>
            <Input.TextArea
            value={value}
            onChange={(e)=>setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="111"
            autoSize={{minRows:1,maxRows:4}}
            disabled={loading}
            style={{flex:1}}
/>
<Button
type="primary"
icon=""



        </div>
    )
}