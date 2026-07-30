/**
 * 聊天相关类型定义
 */

// 消息角色类型
export type ChatRole = 'user' | 'assistant' | 'system'

// 单条消息接口
export interface ChatMessage {
    id: string              // 消息唯一标识
    role: ChatRole          // 消息角色：用户/助手/系统
    content: string         // 消息内容
    timestamp: number       // 时间戳（毫秒）
    loading?: boolean       // 是否正在加载中（可选）
}

// 聊天状态接口
export interface ChatState {
    messages: ChatMessage[]   // 消息列表
    loading: boolean          // 是否正在等待回复
}
