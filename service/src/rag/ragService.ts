import { chunkText } from './chunker'
import { getEmbeddings } from './embedding'
import { addVectors, searchVectors } from './vectorStore'
import { randomUUID } from 'crypto'


export async function processDocument(text: string, fileName: string): Promise<void> {
    // 1. 调用 chunkText 把文本切成小块
    const chunks = chunkText(text)
    console.log(`📄 文档分块: ${chunks.length} 块`)
    // 2. 调用 getEmbeddings 把所有块转成向量
    const embeddings = await getEmbeddings(chunks)
    // 3. 把每个块和对应向量组装成 VectorEntry，用 addVectors 存入
    //    每个 entry 的 id 用 randomUUID() 生成

    const entries = chunks.map((chunk, index) => ({
        id: randomUUID(),
        text: chunk,
        embedding: embeddings[index],
        metadata: {
            fileName,
            chunkIndex: index
        }
    }))
    addVectors(entries)
}


// 函数2：根据用户问题检索相关文档块
export async function retrieveContext(question: string) {
    // 1. 把问题转成向量
    const questionEmbedding = await getEmbeddings([question])
    // 2. 调用 searchVectors 检索最相似的 3 个块
    const result = searchVectors(questionEmbedding[0], 3)

    console.log(`🔍 RAG 检索: "${question}"`)
    console.log(`   找到 ${result.length} 个相关块`)
    const sources = result.map((r) => ({
        fileName: r.metadata?.fileName || '未知文件',
        text: r.text.slice(0, 100)
    }))

    return { content: result.map(r => r.text).join('\n---\n'), sources }

}