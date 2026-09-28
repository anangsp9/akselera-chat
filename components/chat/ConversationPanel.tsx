'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/lib/types'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { MessageInput } from '@/components/chat/MessageInput'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface ConversationPanelProps {
  conversationId: string | null
  messages: Message[]
  currentUserId: string
  otherUserName: string
  onSendMessage: (message: string) => Promise<void>
  loading?: boolean
}

export function ConversationPanel({
  conversationId,
  messages,
  currentUserId,
  otherUserName,
  onSendMessage,
  loading = false,
}: ConversationPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView()
    }
  }, [messages])

  // Mark messages as read when opening conversation
  useEffect(() => {
    async function markMessagesAsRead() {
      if (!conversationId || !currentUserId) return;

      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('is_read', false)
        .neq('sender_id', currentUserId);
    }

    markMessagesAsRead();
  }, [conversationId, messages, currentUserId])

  if (!conversationId) {
    return (
      <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-6">
        <h2 className="text-lg font-semibold text-muted-foreground">Pilih chat untuk memulai</h2>
        <p className="text-sm text-muted-foreground mt-2">Atau buat percakapan baru dari menu di sebelah</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b border-border px-4 py-3 sm:px-6">
        <h2 className="font-semibold text-sm sm:text-base">{otherUserName}</h2>
      </div>

      <ScrollArea className="flex-1 w-full overflow-y-auto">
        <div className="flex flex-col p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-center">
              <p className="text-sm text-muted-foreground">Belum ada pesan. Mulai percakapan Anda!</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isSender={message.sender_id === currentUserId}
              />
            ))
          )}
          <div ref={scrollRef} className="h-0" />
        </div>
      </ScrollArea>

      <MessageInput onSendMessage={onSendMessage} disabled={loading} />
    </div>
  )
}
