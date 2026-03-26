import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Plus,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  Star,
  Users,
  X,
  Loader2,
  Send,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/auth-store'
import { useChatStore } from '@/store/chat-store'
import type { SearchUser } from '@/store/chat-store'
import { findUsers } from '@/lib/auth-api'
import { getChats, createDirectChat, getMessages } from '@/lib/chat-api'
import { useWebSocket } from '@/lib/useWebSocket'

// ── helpers ──────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function avatarColor(name: string) {
  const colors = [
    'bg-blue-400',
    'bg-green-400',
    'bg-purple-400',
    'bg-pink-400',
    'bg-orange-400',
    'bg-teal-400',
    'bg-indigo-400',
  ]
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return colors[Math.abs(h) % colors.length]
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 1) return 'Yesterday'
    return d.toLocaleDateString([], { weekday: 'short' })
  } catch {
    return ''
  }
}

// ── ConversationItem ──────────────────────────────────────────────────────────
function ConversationItem({
  conv,
  isSelected,
  onClick,
}: {
  conv: ReturnType<typeof useChatStore.getState>['conversations'][0]
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-150 group',
        isSelected
          ? 'bg-sidebar-primary'
          : 'hover:bg-secondary/60',
      ].join(' ')}
    >
      <div className="relative shrink-0">
        <Avatar className="w-10 h-10">
          <AvatarFallback
            className={`text-sm font-semibold text-white ${avatarColor(conv.name)}`}
          >
            {initials(conv.name)}
          </AvatarFallback>
        </Avatar>
        {conv.isOnline && !conv.isGroup && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-sidebar" />
        )}
        {conv.isGroup && (
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-sidebar flex items-center justify-center">
            <Users className="w-2.5 h-2.5 text-muted-foreground" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">
              {conv.name}
            </span>
            {conv.isPinned && (
              <Star className="w-3 h-3 text-muted-foreground shrink-0" />
            )}
          </div>
          <span className="text-xs text-muted-foreground shrink-0 ml-2">{conv.time}</span>
        </div>
        <div className="flex items-center justify-between">
          {conv.isTyping ? (
            <span className="text-xs text-primary font-medium flex items-center gap-1">
              typing
              <span className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
              </span>
            </span>
          ) : (
            <span className="text-xs text-muted-foreground truncate">
              {conv.lastMessage}
            </span>
          )}
          {conv.unreadCount ? (
            <Badge className="ml-2 h-5 min-w-5 text-[10px] font-bold px-1.5 rounded-full bg-primary text-primary-foreground shrink-0">
              {conv.unreadCount}
            </Badge>
          ) : null}
        </div>
      </div>
    </button>
  )
}

// ── SearchResultItem ──────────────────────────────────────────────────────────
function SearchResultItem({
  user,
  onClick,
}: {
  user: SearchUser
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/60 transition-all duration-150 text-left"
    >
      <Avatar className="w-10 h-10 shrink-0">
        <AvatarFallback
          className={`text-sm font-semibold text-white ${avatarColor(user.name)}`}
        >
          {initials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </div>
    </button>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-2">
        <MessageSquare className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h2 className="text-lg font-semibold text-foreground">Welcome to Pulse</h2>
      <p className="text-sm text-muted-foreground max-w-[220px]">
        Select a conversation to start messaging or search for someone to chat with.
      </p>
    </div>
  )
}

// ── ThemeToggle ───────────────────────────────────────────────────────────────
function ThemeToggleBtn() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
      title="Toggle theme"
    >
      {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const conversations = useChatStore((state) => state.conversations)
  const selectedId = useChatStore((state) => state.selectedId)
  const messages = useChatStore((state) => state.messages)
  const searchQuery = useChatStore((state) => state.searchQuery)
  const searchResults = useChatStore((state) => state.searchResults)
  const isSearching = useChatStore((state) => state.isSearching)
  const setSelectedId = useChatStore((state) => state.setSelectedId)
  const setSearchQuery = useChatStore((state) => state.setSearchQuery)
  const setSearchResults = useChatStore((state) => state.setSearchResults)
  const setIsSearching = useChatStore((state) => state.setIsSearching)
  const setConversations = useChatStore((state) => state.setConversations)
  const addMessage = useChatStore((state) => state.addMessage)
  const setMessages = useChatStore((state) => state.setMessages)

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // WebSocket
  const { sendMessage: wsSend } = useWebSocket()

  // ── Load conversations on mount ──
  const loadConversations = useCallback(async () => {
    try {
      const chats = await getChats()
      const convs = chats
        .filter((c) => c.user !== null)
        .map((c) => ({
          id: String(c.conversationId),
          name: c.user!.name,
          lastMessage: '',
          time: '',
          recipientId: c.user!.id,
        }))
      setConversations(convs)
    } catch (err) {
      console.error('Failed to load conversations:', err)
    }
  }, [setConversations])

  useEffect(() => {
    if (user) loadConversations()
  }, [user, loadConversations])

  // ── Load messages when conversation selected ──
  useEffect(() => {
    if (!selectedId) return
    getMessages(Number(selectedId))
      .then((msgs) => {
        const mapped = msgs.map((m) => ({
          id: String(m.id),
          conversationId: String(m.conversationId),
          senderId: String(m.senderId),
          content: m.content ?? '',
          timestamp: m.createdAt,
          isOwn: String(m.senderId) === String(user?.id),
        }))
        setMessages(selectedId, mapped)
      })
      .catch(console.error)
  }, [selectedId, user, setMessages])

  // ── Scroll to bottom on new messages ──
  const currentMessages = selectedId ? (messages[selectedId] ?? []) : []
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages.length])

  // ── Debounced user search ──
  const handleSearch = useCallback(
    (value: string) => {
      setInputValue(value)
      setSearchQuery(value)

      if (debounceTimer.current) clearTimeout(debounceTimer.current)

      if (!value.trim()) {
        setSearchResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      debounceTimer.current = setTimeout(async () => {
        try {
          const data = await findUsers(value.trim())
          const results: SearchUser[] = Array.isArray(data) ? data : (data.users ?? [])
          setSearchResults(results)
        } catch {
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      }, 300)
    },
    [setSearchQuery, setSearchResults, setIsSearching],
  )

  function clearSearch() {
    setInputValue('')
    setSearchQuery('')
    setSearchResults([])
    setIsSearching(false)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
  }

  // ── Open / create DM when clicking a search result ──
  async function handleOpenDm(searchUser: SearchUser) {
    try {
      const convId = await createDirectChat(Number(searchUser.id))
      clearSearch()
      await loadConversations()
      setSelectedId(String(convId))
    } catch (err) {
      console.error('Failed to create DM:', err)
    }
  }

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  // ── Send message ──
  async function handleSendMessage() {
    if (!messageInput.trim() || !selectedId || isSending) return

    const selectedConv = conversations.find((c) => c.id === selectedId)
    if (!selectedConv?.recipientId) return

    const content = messageInput.trim()
    setMessageInput('')
    setIsSending(true)

    // Optimistic add
    const optimisticId = `opt-${Date.now()}`
    addMessage({
      id: optimisticId,
      conversationId: selectedId,
      senderId: String(user?.id),
      content,
      timestamp: new Date().toISOString(),
      isOwn: true,
    })

    // Send via WebSocket (thinClient → Kafka → persist)
    wsSend({
      type: 'chat',
      to: String(selectedConv.recipientId),
      message: content,
      conversationId: Number(selectedId),
      messageType: 'text',
    })

    setIsSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSendMessage()
    }
  }

  useEffect(
    () => () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) },
    [],
  )

  const selectedConv = conversations.find((c) => c.id === selectedId)

  return (
    <div className="flex h-dvh bg-background overflow-hidden">
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className="flex flex-col w-[320px] shrink-0 bg-sidebar border-r border-border/50 h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border/30">
          <h1 className="text-lg font-bold text-foreground tracking-tight">Messages</h1>
          <button className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-3 border-b border-border/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search people..."
              value={inputValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-8 text-sm bg-secondary rounded-lg outline-none placeholder:text-muted-foreground text-foreground transition-all focus:ring-1 focus:ring-primary/40"
            />
            {inputValue && (
              <button
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <ScrollArea className="flex-1 px-2 py-2">
          {searchQuery ? (
            /* Search Results */
            <div>
              <p className="text-xs font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wider">
                People
              </p>
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No users found
                </p>
              ) : (
                searchResults.map((u) => (
                  <SearchResultItem
                    key={u.id}
                    user={u}
                    onClick={() => void handleOpenDm(u)}
                  />
                ))
              )}
            </div>
          ) : (
            /* Conversation List */
            <div className="space-y-0.5">
              {conversations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No conversations yet. Search for someone to start chatting!
                </p>
              ) : (
                conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    isSelected={selectedId === conv.id}
                    onClick={() => setSelectedId(conv.id)}
                  />
                ))
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-3 border-t border-border/30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary transition-colors group">
                <Avatar className="w-7 h-7">
                  <AvatarFallback
                    className={`text-xs font-semibold text-white ${avatarColor(user?.name ?? 'U')}`}
                  >
                    {initials(user?.name ?? 'U')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-sidebar-foreground group-hover:text-foreground transition-colors max-w-[100px] truncate">
                  {user?.name ?? 'Profile'}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-48">
              <DropdownMenuItem className="gap-2 text-sm">
                <User className="w-4 h-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-sm">
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="gap-2 text-sm text-destructive-foreground hover:!text-destructive-foreground"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
              <Settings className="w-4 h-4" />
            </button>
            <ThemeToggleBtn />
          </div>
        </div>
      </aside>

      {/* ── Chat Panel ───────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col bg-background overflow-hidden">
        {selectedConv ? (
          /* Chat View */
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/30 bg-card/60">
              <div className="relative">
                <Avatar className="w-9 h-9">
                  <AvatarFallback
                    className={`text-sm font-semibold text-white ${avatarColor(selectedConv.name)}`}
                  >
                    {initials(selectedConv.name)}
                  </AvatarFallback>
                </Avatar>
                {selectedConv.isOnline && !selectedConv.isGroup && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-card" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {selectedConv.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedConv.isTyping ? 'typing...' : 'Active'}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 px-5 py-4">
              {currentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-2 text-center">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/40" strokeWidth={1.2} />
                  <p className="text-sm text-muted-foreground">
                    No messages yet. Say hi! 👋
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pb-2">
                  {currentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      {!msg.isOwn && (
                        <Avatar className="w-7 h-7 shrink-0 mr-2 self-end">
                          <AvatarFallback
                            className={`text-xs font-semibold text-white ${avatarColor(selectedConv.name)}`}
                          >
                            {initials(selectedConv.name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={[
                          'max-w-[65%] px-3.5 py-2 rounded-2xl text-sm',
                          msg.isOwn
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-secondary text-foreground rounded-bl-sm',
                        ].join(' ')}
                      >
                        <p className="leading-relaxed">{msg.content}</p>
                        <p
                          className={[
                            'text-[10px] mt-0.5',
                            msg.isOwn ? 'text-primary-foreground/60 text-right' : 'text-muted-foreground',
                          ].join(' ')}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="px-4 py-4 border-t border-border/30 bg-card/40">
              <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-2.5">
                <input
                  type="text"
                  placeholder={`Message ${selectedConv.name}...`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
                />
                <button
                  onClick={() => void handleSendMessage()}
                  disabled={!messageInput.trim() || isSending}
                  className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  )
}
