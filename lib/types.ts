export type User = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Conversation = {
  id: string;
  created_at: string;
  updated_at: string;
};

export type ConversationParticipant = {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  is_read: boolean;
};

export type ChatListItem = {
  conversation_id: string;
  other_user: User;
  last_message: string | null;
  last_message_at: string | null;
  sender_name: string | null;
  unread_count: number;
};
