export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
    id: string,
    role: ChatRole,
    content: string,
    timestamp: number,
    loading?: boolean
}

export interface ChatState {
    messages: ChatMessage[]
    loading: boolean
}