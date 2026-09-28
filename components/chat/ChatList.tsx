'use client'

import { useState } from 'react'
import { ChatListItem } from '@/lib/types'
import { ChatItem } from '@/components/chat/ChatItem'
import { Button } from '@/components/ui/button'
import { MessageSquarePlus, Search } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
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
    <div className="flex flex-col h-full bg-background border-r border-border">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari chat..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          onClick={onNewChat}
          disabled={loading}
          className="flex-shrink-0 whitespace-nowrap bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center gap-1"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span className="hidden sm:inline">Chat Baru</span>
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <p className="text-sm text-muted-foreground">Tidak ada percakapan ditemukan</p>
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
      </ScrollArea>
    </div>
  )
}
