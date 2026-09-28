import { z } from 'zod';

export const MessageSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  sender_id: z.string(),
  content: z.string(),
  created_at: z.string(),
  read_at: z.string().nullable().optional(),
  is_read: z.boolean().default(false),
});

export const ProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  full_name: z.string().nullable(),
  avatar_url: z.string().nullable().optional(),
});
