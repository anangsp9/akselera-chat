'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Paperclip, Smile } from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>
  disabled?: boolean
}

export function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSend() {
    if (!message.trim()) return

    setLoading(true)
    try {
      await onSendMessage(message)
      setMessage('')
      textareaRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-center gap-2 p-3 border-t border-border bg-background/50 backdrop-blur">
      <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground" disabled={disabled}>
        <Paperclip className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground" disabled={disabled}>
        <Smile className="h-5 w-5" />
      </Button>
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik pesan..."
          disabled={loading || disabled}
          className="h-10 pr-12 rounded-xl bg-muted/50 border-border/50 focus:border-primary focus:ring-primary/20 resize-none max-h-24 transition-all"
          rows={1}
        />
      </div>
      <Button
        onClick={handleSend}
        disabled={loading || disabled || !message.trim()}
        className="h-10 w-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary shadow-sm"
        aria-label="Kirim pesan"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  )
}
