import api from '@/lib/axios'

export interface ChatProfile {
    conversationId: number
    user: {
        id: number
        name: string
        email: string
    } | null
}

export interface ChatMessage {
    id: number
    conversationId: number
    senderId: number
    messageType: string
    content: string | null
    createdAt: string
}

export async function getChats(): Promise<ChatProfile[]> {
    const res = await api.get('/api/auth/app/chats')
    return res.data.chats ?? []
}

export async function createDirectChat(recipientId: number): Promise<number> {
    const res = await api.post('/api/auth/app/direct', { recipientId })
    return res.data.conversationId
}

export async function getMessages(conversationId: number, offset = 0): Promise<ChatMessage[]> {
    const res = await api.get(`/api/auth/app/chats/${conversationId}`, {
        params: { offset },
    })
    return res.data.messages ?? []
}
