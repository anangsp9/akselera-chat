import { useState, useEffect, useCallback } from 'react';
import { chatService } from '@/services/chatService';
import { ChatListItem, Message, User } from '@/lib/types';
import { toast } from 'sonner';

export function useChat(currentUser: User | null) {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await chatService.fetchChats(currentUser.id);
      setChats(data);
    } catch (error) {
      toast.error('Gagal memuat daftar chat');
    }
  }, [currentUser]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const data = await chatService.fetchMessages(conversationId);
      setMessages(data);
      await chatService.markMessagesAsRead(conversationId, currentUser?.id || '');
    } catch (error) {
      toast.error('Gagal memuat pesan');
    }
  }, [currentUser]);

  const sendMessage = async (conversationId: string, content: string) => {
    if (!currentUser) return;
    try {
      const newMessage = await chatService.sendMessage(conversationId, currentUser.id, content);
      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      toast.error('Gagal mengirim pesan');
    }
  };

  return { chats, messages, setMessages, fetchChats, fetchMessages, sendMessage, loading, setLoading };
}
