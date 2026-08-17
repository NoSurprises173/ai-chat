interface VectorEntry {
    id: string,
    text: string,
    embedding: number[],
    metadata?: {
        fileName?: string
        chunkIndex?: number
    }
}

const vectorMap = new Map<string, VectorEntry>()

//添加向量的函数：遍历数组，逐个存入Map
export function addVectors(entries: VectorEntry[]) {
    for (const entrie of entries) {
        vectorMap.set(entrie.id, entrie)
    }
}


//余弦相似度计算 计算两个向量有多相似
function cosineSimilarity(a: number[], b: number[]): number {
    // 第1步：计算点积（对应位置相乘再求和）
    let dot = 0
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i]
    }

    // 第2步：计算 a 的模长（每个元素平方求和再开根号）
    let normA = 0
    for (let i = 0; i < a.length; i++) {
        normA += a[i] * a[i]
    }
    normA = Math.sqrt(normA)

    // 第3步：计算 b 的模长（同上）
    let normB = 0
    for (let i = 0; i < b.length; i++) {
        normB += b[i] * b[i]
    }
    normB = Math.sqrt(normB)

    // 第4步：返回点积除以两个模长的乘积
    return dot / (normA * normB)
}
//搜索相似向量
export function searchVectors(queryEmbedding: number[], topK: number = 3): VectorEntry[] {
    // 第1步：遍历 Map 里所有条目，计算和 query 的相似度
    const results: { entry: VectorEntry; score: number }[] = []

    vectorMap.forEach(entry => {
        const score = cosineSimilarity(queryEmbedding, entry.embedding)
        results.push({ entry, score })
    })

    // 第2步：按相似度从高到低排序
    results.sort((a, b) => b.score - a.score)

    // 第3步：取前 topK 个，只返回 entry 部分
    return results.slice(0, topK).map(r => r.entry)
}


