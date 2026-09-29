'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/Header'
import { ChatList } from '@/components/chat/ChatList'
import { ConversationPanel } from '@/components/chat/ConversationPanel'
import { NewChatDialog } from '@/components/chat/NewChatDialog'
import { ChatListItem, Message, User } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useChat } from '@/hooks/useChat'
import { chatService } from '@/services/chatService'

const supabase = createClient()

function ChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(searchParams.get('convId'))
  const [otherUserName, setOtherUserName] = useState('')
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const activeConversationIdRef = useRef<string | null>(null)

  const { chats, messages, setMessages, fetchChats, fetchMessages, sendMessage } = useChat(currentUser)

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId
  }, [activeConversationId])

  useEffect(() => {
    initUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchChats()
      const cleanup = subscribeToMessages()
      return () => {
        cleanup()
      }
    }
  }, [currentUser, fetchChats])

  useEffect(() => {
    const convId = searchParams.get('convId')
    setActiveConversationId(convId)
    setShowMobileChat(!!convId)
  }, [searchParams])

  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase.channel('online-status', {
      config: { presence: { key: currentUser.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const ids = new Set<string>();
        Object.keys(state).forEach((key) => {
          ids.add(key);
        });
        setOnlineUsers(ids);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUsers((prev) => new Set(prev).add(key));
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId)
      updateActiveChatHeader(activeConversationId)
    }
  }, [activeConversationId, fetchMessages])

  async function initUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setCurrentUser(profile)
    }
    setLoading(false)
  }

  function updateActiveChatHeader(convId: string) {
    const chat = chats.find((c) => c.conversation_id === convId)
    if (chat) {
      setOtherUserName(chat.other_user.full_name || chat.other_user.email)
    }
  }

  function subscribeToMessages() {
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message

          setMessages((prev: Message[]) => {
            if (prev.some((m: Message) => m.id === newMessage.id)) return prev
            
            if (newMessage.conversation_id === activeConversationIdRef.current) {
              return [...prev, newMessage]
            }
            return prev
          })

          fetchChats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function handleSelectChat(conversationId: string) {
    setActiveConversationId(conversationId)
    setShowMobileChat(true)
    router.push(`/chat?convId=${conversationId}`)
  }

  async function handleNewChat(user: User) {
    if (!currentUser) return
    setOtherUserName(user.full_name || user.email)
    try {
      const targetConversationId = await chatService.createConversation(currentUser.id, user.id)
      if (targetConversationId) {
        await fetchChats()
        setActiveConversationId(targetConversationId)
        setShowMobileChat(true)
        router.push(`/chat?convId=${targetConversationId}`)
      }
    } catch (error) {
      console.error('Error in handleNewChat:', error)
    }
  }

  async function handleSendMessage(content: string) {
    if (!activeConversationId || !currentUser) return
    await sendMessage(activeConversationId, content)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    )
  }

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-background">
      <Header userName={currentUser?.full_name || currentUser?.email} />
      <div className="flex-1 flex overflow-hidden relative">
        <aside className={`w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r bg-background ${
          activeConversationId ? 'hidden md:flex' : 'flex'
        }`}>
          <ChatList
            chats={chats}
            activeConversationId={activeConversationId}
            onSelectChat={handleSelectChat}
            onNewChat={() => setShowNewChatDialog(true)}
            onlineUsers={onlineUsers}
          />
        </aside>
        <main className={`w-full flex-1 h-full flex flex-col overflow-hidden bg-background ${
          !activeConversationId ? 'hidden md:flex' : 'flex'
        }`}>
          <ConversationPanel
            conversationId={activeConversationId}
            messages={messages}
            currentUserId={currentUser?.id || ''}
            otherUserName={otherUserName}
            otherUserId={chats.find(c => c.conversation_id === activeConversationId)?.other_user.id || ''}
            onlineUsers={onlineUsers}
            onSendMessage={handleSendMessage}
            onBack={() => {
              setActiveConversationId(null)
              router.push('/chat')
            }}
          />
        </main>
      </div>
      <NewChatDialog
        open={showNewChatDialog}
        onOpenChange={setShowNewChatDialog}
        currentUserId={currentUser?.id || ''}
        onSelectUser={handleNewChat}
      />
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Memuat...</div>}>
      <ChatContent />
    </Suspense>
  )
}