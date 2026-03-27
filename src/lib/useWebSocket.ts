import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useChatStore } from '@/store/chat-store'

const WS_URL = 'https://pulse-thinclient.onrender.com/'
// const WS_URL = 'ws://localhost:4001'
const RECONNECT_DELAY = 2000

export interface WsOutgoingChat {
    type: 'chat'
    to: string          // recipient userId as string
    message: string
    conversationId: number
    messageType?: string
}

type WsOutgoing =
    | { type: 'register'; userId: string }
    | WsOutgoingChat

export function useWebSocket() {
    const wsRef = useRef<WebSocket | null>(null)
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const user = useAuthStore((s) => s.user)
    const addMessage = useChatStore((s) => s.addMessage)

    const connect = useCallback(() => {
        if (!user) return

        const ws = new WebSocket(WS_URL)
        wsRef.current = ws

        ws.onopen = () => {
            console.log('[ws] connected')
            ws.send(JSON.stringify({ type: 'register', userId: String(user.id) }))
        }

        ws.onmessage = (event: MessageEvent) => {
            try {
                const msg = JSON.parse(event.data as string)
                if (msg.type === 'chat' && msg.conversationId && msg.from && msg.message) {
                    addMessage({
                        id: `ws-${Date.now()}`,
                        conversationId: String(msg.conversationId),
                        senderId: String(msg.from),
                        content: msg.message,
                        timestamp: new Date().toISOString(),
                        isOwn: false,
                    })
                }
            } catch {
                // ignore malformed messages
            }
        }

        ws.onclose = () => {
            console.log('[ws] disconnected, reconnecting in', RECONNECT_DELAY, 'ms')
            reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY)
        }

        ws.onerror = (err) => {
            console.error('[ws] error:', err)
            ws.close()
        }
    }, [user, addMessage])

    useEffect(() => {
        connect()
        return () => {
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
            wsRef.current?.close()
        }
    }, [connect])

    const sendMessage = useCallback((payload: WsOutgoing) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(payload))
        } else {
            console.warn('[ws] not connected, message dropped')
        }
    }, [])

    return { sendMessage }
}
