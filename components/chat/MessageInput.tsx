'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

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

  const hasMessage = message.trim().length > 0

  return (
    <div className="p-3 md:p-4 bg-background/80 backdrop-blur-md border-t border-border/50">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 p-1.5 pl-4 flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik pesan..."
          disabled={loading || disabled}
          className="bg-transparent border-0 focus:outline-none focus:ring-0 focus-visible:ring-0 text-sm text-foreground placeholder:text-muted-foreground resize-none w-full py-1.5 min-h-[44px] max-h-[120px]"
          rows={1}
          aria-label="Ketik pesan"
        />
        <Button
          onClick={handleSend}
          disabled={loading || disabled || !message.trim()}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
            message.trim()
              ? 'bg-primary text-primary-foreground hover:opacity-90 hover:scale-105 active:scale-95 shadow-sm cursor-pointer'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
          }`}
          aria-label="Kirim pesan"
        >
          <Send className="h-5 w-5 rotate-45" />
        </Button>
      </div>
    </div>
  )
}
