'use client'

import { useState } from 'react'
import { ChatListItem } from '@/lib/types'
import { ChatItem } from '@/components/chat/ChatItem'
import { Button } from '@/components/ui/button'
import { MessageSquarePlus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface ChatListProps {
  chats: ChatListItem[]
  activeConversationId: string | null
  onSelectChat: (conversationId: string) => void
  onNewChat: () => void
  loading?: boolean
  onlineUsers: Set<string>
}

export function ChatList({
  chats,
  activeConversationId,
  onSelectChat,
  onNewChat,
  loading = false,
  onlineUsers,
}: ChatListProps) {
  const [search, setSearch] = useState('')

  const filteredChats = chats.filter((chat) =>
    (chat.other_user.full_name || chat.other_user.email)
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-background border-r border-border overflow-hidden">
            <div className="flex-shrink-0 min-h-[72px] flex items-center gap-2 p-3 border-b border-border bg-background/50 backdrop-blur-sm z-10">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari chat..."
            className="pl-10 h-10 rounded-xl bg-muted/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          onClick={onNewChat}
          disabled={loading}
          className="flex-shrink-0 whitespace-nowrap bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 flex items-center gap-2 transition-all shadow-sm"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span className="hidden sm:inline">Chat Baru</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-3 space-y-1">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                <MessageSquarePlus className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Belum ada percakapan</p>
              <p className="text-xs text-muted-foreground mb-4 max-w-xs text-center">
                Mulai obrolan baru dengan rekan kerja Anda
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onNewChat}
                className="gap-2"
                disabled={loading}
              >
                <MessageSquarePlus className="h-4 w-4" />
                Mulai Chat Baru
              </Button>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <ChatItem
                key={chat.conversation_id}
                chat={chat}
                isActive={chat.conversation_id === activeConversationId}
                onClick={() => onSelectChat(chat.conversation_id)}
                isOnline={onlineUsers.has(chat.other_user.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
