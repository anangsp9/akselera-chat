'use client'

import { ChatListItem } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface ChatItemProps {
  chat: ChatListItem
  isActive: boolean
  onClick: () => void
  isOnline: boolean
}

export function ChatItem({ chat, isActive, onClick, isOnline }: ChatItemProps) {
  const initials = chat.other_user.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || chat.other_user.email.slice(0, 2).toUpperCase()

  const timeAgo = chat.last_message_at
    ? formatDistanceToNow(new Date(chat.last_message_at), {
        addSuffix: false,
        locale: id,
      })
    : ''

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors ${
        isActive ? 'bg-accent' : ''
      }`}
    >
      <div className="relative">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        {isOnline && (
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex justify-between items-baseline gap-2">
          <h3 className="font-semibold text-sm truncate">
            {chat.other_user.full_name || chat.other_user.email}
            {chat.unread_count > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                {chat.unread_count > 9 ? '9+' : chat.unread_count}
              </span>
            )}
          </h3>
          {timeAgo && <span className="text-xs text-muted-foreground flex-shrink-0">{timeAgo}</span>}
        </div>
        <p className="text-sm text-muted-foreground truncate mt-1">
          {chat.last_message || 'Belum ada pesan'}
        </p>
      </div>
    </button>
  )
}
