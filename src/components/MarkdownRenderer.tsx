import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

// 引入代码高亮样式（GitHub Dark 主题）
import 'highlight.js/styles/github-dark.css'

interface Props {
    content: string   // Markdown 文本内容
}

/**
 * MarkdownRenderer 组件
 * 将 Markdown 文本渲染为 HTML
 * 支持：标题、列表、表格、代码块高亮、引用等
 */
const MarkdownRenderer: React.FC<Props> = ({ content }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}        // 启用 GFM（GitHub Flavored Markdown）
            rehypePlugins={[rehypeHighlight]}   // 启用代码语法高亮
        >
            {content}
        </ReactMarkdown>
    )
}

export default MarkdownRenderer
