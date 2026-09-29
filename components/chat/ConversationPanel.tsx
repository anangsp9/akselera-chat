'use client'

import { useEffect, useRef, useMemo, useState } from 'react'
import { Message } from '@/lib/types'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { MessageInput } from '@/components/chat/MessageInput'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/lib/supabase/client'
import { Search, Phone, MoreVertical, MessageSquarePlus, ChevronLeft, Check, CheckCheck, X, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const supabase = createClient()

interface ConversationPanelProps {
  conversationId: string | null
  messages: Message[]
  currentUserId: string
  otherUserName: string
  otherUserId: string
  onlineUsers: Set<string>
  onSendMessage: (message: string) => Promise<void>
  loading?: boolean
  onBack?: () => void
}

import { format, isToday, isYesterday } from 'date-fns'
import { id } from 'date-fns/locale'

// Helper untuk format tanggal
function formatDateSeparator(date: Date) {
  if (isToday(date)) return 'Hari Ini'
  if (isYesterday(date)) return 'Kemarin'
  return format(date, 'd MMMM yyyy', { locale: id })
}

export function ConversationPanel({
  conversationId,
  messages,
  currentUserId,
  otherUserName,
  otherUserId,
  onlineUsers,
  onSendMessage,
  loading = false,
  onBack,
}: ConversationPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Mark as read
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

  // Filter messages based on search query
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages
    const query = searchQuery.toLowerCase().trim()
    return messages.filter(msg => 
      msg.content.toLowerCase().includes(query)
    )
  }, [messages, searchQuery])

  // Group filtered messages
  const filteredGroupedMessages = useMemo(() => {
    const grouped: { date: string; messages: Message[] }[] = []
    let lastDate: string | null = null

    filteredMessages.forEach((msg) => {
      const date = formatDateSeparator(new Date(msg.created_at))
      if (date !== lastDate) {
        grouped.push({ date, messages: [] })
        lastDate = date
      }
      grouped[grouped.length - 1].messages.push(msg)
    })
    return grouped
  }, [filteredMessages])

  // Find last sent message index in entire conversation for read status
  const lastSentMessageIdx = useMemo(() => {
    return filteredMessages.findLastIndex(m => m.sender_id === currentUserId)
  }, [filteredMessages, currentUserId])

  const handleDeleteConversation = async () => {
    if (!conversationId || !currentUserId) return
    
    try {
      // Soft delete - hide conversation for current user only
      await supabase
        .from('conversation_participants')
        .update({ 
          is_hidden: true,
          hidden_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', currentUserId)
      
      // Close dialog
      setShowDeleteDialog(false)
      
      // Navigate back to chat list
      if (onBack) onBack()
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  if (!conversationId) {
    return (
      <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-6 bg-muted/20">
        <div className="p-4 rounded-full bg-background mb-4">
          <MessageSquarePlus className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Pilih chat untuk memulai</h2>
        <p className="text-sm text-muted-foreground mt-2">Pilih percakapan dari daftar di sebelah kiri</p>
      </div>
    )
  }

  const initials = otherUserName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const isOnline = onlineUsers.has(otherUserId)

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4 h-16">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 -ml-2 mr-2"
              onClick={onBack}
              aria-label="Kembali ke daftar chat"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-foreground leading-tight">{otherUserName}</h2>
              <p className={`text-[11px] font-medium ${isOnline ? 'text-green-500' : 'text-muted-foreground'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
<div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger className="h-9 w-9 text-muted-foreground hover:bg-accent rounded-full transition-colors">
                <MoreVertical className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  className="flex items-center gap-2"
                  onClick={() => setShowSearch(true)}
                >
                  <Search className="h-4 w-4" />
                  <span>Cari Pesan</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 focus:bg-red-50 dark:focus:bg-red-950/30"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-red-600 dark:text-red-400">Hapus Chat</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {showSearch && (
        <div className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur sticky top-16 z-10 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari dalam percakapan..."
                className="w-full pl-10 pr-10 h-10 rounded-xl bg-muted/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all text-sm"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground"
              onClick={() => { setShowSearch(false); setSearchQuery('') }}
              aria-label="Tutup pencarian"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex flex-col p-6 pt-8 space-y-4">
            {searchQuery && filteredMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <p className="text-sm text-muted-foreground">Tidak ada pesan yang cocok dengan "{searchQuery}"</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <p className="text-sm text-muted-foreground">Belum ada pesan. Mulai percakapan Anda!</p>
              </div>
            ) : (
              filteredGroupedMessages.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-3">
                  <div className="flex justify-center my-2">
                    <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-0.5 rounded-full text-xs font-medium shadow-2xs w-fit">
                      {group.date}
                    </span>
                  </div>

                  {group.messages.map((message) => {
                    const isSender = message.sender_id === currentUserId
                    const timeStr = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    const globalMsgIdx = filteredMessages.findIndex(m => m.id === message.id)
                    const isLastSentInConversation = isSender && globalMsgIdx === lastSentMessageIdx

                    return (
                      <div key={message.id} className={`flex items-end gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}>
                        {isSender && (
                          <span className="text-[10px] text-muted-foreground mb-1 flex-shrink-0">
                            {timeStr}
                          </span>
                        )}
                        <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'} max-w-[70%]`}>
                          <div className={` ${isSender ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-xs' : 'bg-muted text-foreground rounded-2xl rounded-tl-xs'} p-3 px-4 shadow-sm`}>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                          {isSender && isLastSentInConversation && (
                            <div className="flex items-center justify-end gap-1 mt-1 pr-1">
                              {message.is_read || message.read_at ? (
                                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground font-medium transition-opacity duration-300 animate-fade-in">
                                  <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                                  <span>Dibaca</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground animate-fade-in">
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Terkirim</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {!isSender && (
                          <span className="text-[10px] text-muted-foreground mb-1 flex-shrink-0">
                            {timeStr}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))
            )}
            <div ref={scrollRef} className="h-0" />
          </div>
        </ScrollArea>
      </div>

      <div className="flex-shrink-0 p-4 border-t border-border bg-background">
        <MessageInput onSendMessage={onSendMessage} disabled={loading} />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Hapus Chat
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus percakapan ini? Chat akan hilang dari daftar Anda, tetapi tetap terlihat oleh lawan bicara. Jika lawan bicara mengirim pesan baru, chat akan muncul kembali.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 p-4 border-t border-border">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConversation}
              disabled={loading}
            >
              Hapus Chat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}