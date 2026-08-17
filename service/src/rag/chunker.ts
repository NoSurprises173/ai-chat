export function chunkText(text: string, chunkSize: number = 500, overlap: number = 50) {
    const paragraphs = text.split('\n')
    const chunks: string[] = []
    let currentChunk = ''
    for (const paragraph of paragraphs) {
        if (currentChunk.length + paragraph.length < chunkSize)
            currentChunk += paragraph + '\n'
        else {
            if (currentChunk.length > 0)
                chunks.push(currentChunk.trim())
            currentChunk = currentChunk.slice(-overlap) + paragraph + '\n'
        }
    }

    if (currentChunk.trim().length > 0)
        chunks.push((currentChunk.trim()))
    return chunks
}