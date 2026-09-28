'use client'

import { Message } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

interface MessageBubbleProps {
  message: Message
  isSender: boolean
}

export function MessageBubble({ message, isSender }: MessageBubbleProps) {
  const timeAgo = formatDistanceToNow(new Date(message.created_at), {
    addSuffix: true,
    locale: id,
  })

  return (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isSender
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted text-foreground rounded-bl-none'
        }`}
      >
        <p className="text-sm break-words">{message.content}</p>
        <p className={`text-xs mt-1 ${isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {timeAgo}
        </p>
      </div>
    </div>
  )
}
