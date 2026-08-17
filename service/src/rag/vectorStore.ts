interface VectorEntry {
    id: string,
    text: string,
    embedding: number[],
    metadata?: {
        fileName?: string
        chunkIndex?: number
    }
}

const vectorMap1 = new Map<string, VectorEntry>()


export function addVectors(entries: VectorEntry[]) {
    entries
}

