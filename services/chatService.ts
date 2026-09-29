import { createClient } from '@/lib/supabase/client';
import type { ChatListItem, Message } from '@/lib/types';

const supabase = createClient();

export const chatService = {
  async fetchChats(userId: string): Promise<ChatListItem[]> {
    // Fetch conversations where user is a participant and NOT hidden
    const { data: conversations } = await supabase
      .from('conversation_participants')
      .select(
        `
        conversation_id,
        is_hidden,
        conversations!inner (
          id,
          updated_at
        )
      `
      )
      .eq('user_id', userId)
      .eq('is_hidden', false) // Only show non-hidden conversations
      .order('conversations(updated_at)', { ascending: false });

    if (!conversations) return [];

    const chatList: ChatListItem[] = [];

    for (const conv of conversations) {
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conv.conversation_id)
        .neq('user_id', userId)
        .maybeSingle();

      if (!participants) continue;

      const { data: otherUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', participants.user_id)
        .maybeSingle();

      if (!otherUser) continue;

      const { data: lastMessage } = await supabase
        .from('messages')
        .select('content, created_at, sender_id')
        .eq('conversation_id', conv.conversation_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { count: unreadCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.conversation_id)
        .eq('is_read', false)
        .neq('sender_id', userId);

      chatList.push({
        conversation_id: conv.conversation_id,
        other_user: otherUser,
        last_message: lastMessage?.content || null,
        last_message_at: lastMessage?.created_at || null,
        sender_name:
          lastMessage?.sender_id === userId
            ? 'Anda'
            : otherUser.full_name || otherUser.email,
        unread_count: unreadCount || 0,
      });
    }

    return chatList;
  },

  async fetchMessages(conversationId: string): Promise<Message[]> {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    return data || [];
  },

  async createConversation(userId: string, otherUserId: string): Promise<string | null> {
    // Check existing conversation
    const { data: existingConv } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    const existingConvIds = existingConv?.map((c) => c.conversation_id) || [];

    if (existingConvIds.length > 0) {
      const { data: otherParticipant } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', otherUserId)
        .in('conversation_id', existingConvIds)
        .maybeSingle();

      if (otherParticipant) {
        return otherParticipant.conversation_id;
      }
    }

    // Create new conversation
    const newConvId = crypto.randomUUID();
    const { error: convError } = await supabase
      .from('conversations')
      .insert([{ id: newConvId }]);

    if (convError) {
      console.error('Detail Error Supabase:', convError);
      throw new Error('Gagal membuat percakapan baru: ' + (convError?.message || 'Unknown error'));
    }

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: newConvId, user_id: userId },
        { conversation_id: newConvId, user_id: otherUserId },
      ]);

    if (participantsError) {
      throw participantsError;
    }

    return newConvId;
  },

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const { data, error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    }).select().single();

    if (error) throw error;
    return data;
  },

  async markMessagesAsRead(conversationId: string, userId: string) {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('is_read', false)
      .neq('sender_id', userId);
  },
};