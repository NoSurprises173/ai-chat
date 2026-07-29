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
}