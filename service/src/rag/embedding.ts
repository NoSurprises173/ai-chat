export async function getEmbeddings(texts: string[]): Promise<number[][]> {
    const apiKey = process.env.EMBEDDING_API_KEY
    const baseURL = process.env.EMBEDDING_BASE_URL || 'https://api.siliconflow.cn/v1'

    const response = await fetch(`${baseURL}/embeddings`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'BAAI/bge-m3',
            input: texts
        })
    })
    const result = await response.json()
    return result.data.map((item: any) => item.embedding)

}