'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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
      // Auto-focus after sending
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
    <div className="flex gap-2 items-end p-4 border-t border-border bg-background">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ketik pesan..."
        disabled={loading || disabled}
        className="resize-none max-h-24 min-h-10"
        rows={1}
      />
      <Button
        onClick={handleSend}
        disabled={loading || disabled || !message.trim()}
        size="sm"
        className="gap-2"
      >
        <Send className="h-4 w-4" />
        <span className="hidden sm:inline">Kirim</span>
      </Button>
    </div>
  )
}
