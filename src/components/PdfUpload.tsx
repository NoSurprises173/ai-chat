import { useRef } from "react";
import { Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { uploadPDF } from "../service/api";

interface Props {
    loading?: boolean
}

/**
 * PdfUpload 组件
 * 负责 PDF 文件选择、上传、提取文本
 */
const PdfUpload: React.FC<Props> = ({  loading }) => {
    // 用 ref 获取 input 元素，方便手动触发点击
    const inputRef = useRef<HTMLInputElement>(null)

    // 点击按钮时，手动触发 input 的点击
    const handleClick = () => {
        inputRef.current?.click()
    }

    // 处理文件选择
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // 校验文件类型
        if (file.type !== 'application/pdf') {
            message.error('请选择 PDF 文件')
            return
        }

        try {
            message.loading('正在解析 PDF...',0)
            const result = await uploadPDF(file)
            message.destroy()
            message.success(`PDF 解析成功：${result.pages} 页`)
        } catch (err: any) {
            message.destroy()
            message.error(`上传失败：${err.message}`)
        }

        // 清空 input，允许重复上传同一文件
        e.target.value = ''
    }

    return (
        <>
            {/* 隐藏的文件输入框 */}
            <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            {/* 按钮点击时手动触发 input */}
            <Button
                icon={<UploadOutlined />}
                onClick={handleClick}
                loading={loading}
                disabled={loading}
            >
                上传 PDF
            </Button>
        </>
    )
}

export default PdfUpload
