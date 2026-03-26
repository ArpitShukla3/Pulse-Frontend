import { create } from 'zustand'

export type Conversation = {
    id: string
    name: string
    avatarUrl?: string
    lastMessage: string
    time: string
    unreadCount?: number
    isPinned?: boolean
    isGroup?: boolean
    isTyping?: boolean
    isOnline?: boolean
    recipientId?: number   // the other user's numeric id (for WS routing)
}

export type Message = {
    id: string
    conversationId: string
    senderId: string
    content: string
    timestamp: string
    isOwn: boolean
}

export type SearchUser = {
    id: string | number
    name: string
    email: string
}

type ChatStore = {
    conversations: Conversation[]
    selectedId: string | null
    messages: Record<string, Message[]>
    searchQuery: string
    searchResults: SearchUser[]
    isSearching: boolean

    setSelectedId: (id: string | null) => void
    setSearchQuery: (q: string) => void
    setSearchResults: (results: SearchUser[]) => void
    setIsSearching: (v: boolean) => void
    setConversations: (convs: Conversation[]) => void
    addMessage: (msg: Message) => void
    setMessages: (conversationId: string, msgs: Message[]) => void
}

export const useChatStore = create<ChatStore>((set) => ({
    conversations: [],
    selectedId: null,
    messages: {},
    searchQuery: '',
    searchResults: [],
    isSearching: false,

    setSelectedId: (id) => set({ selectedId: id }),
    setSearchQuery: (q) => set({ searchQuery: q }),
    setSearchResults: (results) => set({ searchResults: results }),
    setIsSearching: (v) => set({ isSearching: v }),
    setConversations: (convs) => set({ conversations: convs }),

    addMessage: (msg) =>
        set((state) => {
            const existing = state.messages[msg.conversationId] ?? []
            if (existing.some((m) => m.id === msg.id)) return state
            return {
                messages: {
                    ...state.messages,
                    [msg.conversationId]: [...existing, msg],
                },
            }
        }),

    setMessages: (conversationId, msgs) =>
        set((state) => ({
            messages: { ...state.messages, [conversationId]: msgs },
        })),
}))
