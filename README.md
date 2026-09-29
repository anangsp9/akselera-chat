# Akselera Chat

Real-time chat application built with Next.js 16, Supabase, and Tailwind CSS. Features real-time messaging, online presence, message search, read receipts, and soft-delete conversations.

## 🛠 Tech Stack & Infrastructure

| Category | Technology | Version | Alasan Pemilihan |
|----------|------------|---------|------------------|
| **Framework** | Next.js | 16.3.6 (App Router) | Server Components, Server Actions, Streaming, Turbopack untuk dev cepat |
| **Language** | TypeScript | 5.x | Type safety end-to-end, better DX, self-documenting code |
| **Styling** | Tailwind CSS v4 | Latest | Utility-first, JIT compilation, dark mode native, performa optimal |
| **UI Components** | @base-ui/react + shadcn/ui | Latest | Headless, accessible, unstyled primitives + komponen siap pakai |
| **Database & Auth** | Supabase (PostgreSQL) | Latest | Auth built-in, Realtime subscriptions, Row Level Security (RLS), Storage |
| **Real-time** | Supabase Realtime | Built-in | WebSocket subscriptions untuk messages, presence, online status |
| **Forms/Validation** | Zod v4 | Latest | Schema validation type-safe, performa lebih cepat dari v3 |
| **Date Handling** | date-fns v4 | Latest | Immutable, modular, tree-shakable, locale Indonesia support |
| **Icons** | Lucide React | Latest | Consistent, tree-shakable, aksesibel |
| **Notifications** | Sonner | Latest | Toast modern, accessible, promise-based API |
| **Theme** | next-themes | Latest | SSR-safe, next-themes support, system/light/dark mode |
| **State Management** | React Hooks + useChat hook | Custom | Colocated state, no external store needed (React 19) |
| **Package Manager** | npm | Latest | Default, lockfile v2, workspaces support |

### Infrastructure & Deployment
| Komponen | Detail |
|----------|--------|
| **Hosting Target** | Vercel (recommended) / Docker-ready |
| **Database** | Supabase PostgreSQL (Free tier: 500MB DB, 1GB Storage, 2GB bandwidth/bulan) |
| **Auth** | Supabase Auth (Email/Password, OAuth ready) |
| **Realtime** | Supabase Realtime (WebSocket) via `supabase-js` |
| **Storage** | Supabase Storage (1GB free) untuk attachments (planned) |
| **Edge Ready** | Next.js 16 App Router + Middleware untuk auth |

---

## 🗄 Database Schema (PostgreSQL)

### Tabel Utama

```sql
-- Profiles (extends auth.users)
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Conversations
conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Conversation Participants (junction table + soft delete)
conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_hidden BOOLEAN DEFAULT FALSE,      -- Soft delete for user
  hidden_at TIMESTAMPTZ,                 -- When hidden
  UNIQUE(conversation_id, user_id)
)

-- Messages
messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,                   -- Null = unread, timestamp = read
  is_read BOOLEAN DEFAULT FALSE          -- Denormalized for quick queries
)
```

### Indexes
```sql
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation ON conversation_participants(conversation_id);
```

### Row Level Security (RLS) - Database-Level Enforcement
| Tabel | Policy | Deskripsi |
|-------|--------|-----------|
| `conversations` | SELECT | User hanya bisa lihat conversation yg dia participant |
| `conversation_participants` | SELECT | User hanya lihat participant di conversation yg dia ikuti |
| `messages` | SELECT | User hanya baca message di conversation yg dia ikuti |
| `messages` | INSERT | User hanya kirim ke conversation yg dia ikuti, `sender_id = auth.uid()` |
| `messages` | UPDATE | User hanya update message di conversation yg dia ikuti (untuk `read_at`) |
| `conversation_participants` | INSERT | User bisa join conversation (create new chat) |
| `conversation_participants` | UPDATE | Soft delete via `is_hidden = true` |

> **Key Point**: RLS di-enforce di **level database (PostgreSQL)**. Bahkan akses langsung via API, Dashboard, atau SQL mentah akan diblokir RLS.

---

## 🚀 Cara Menjalankan Secara Lokal

### Prasyarat
- Node.js 18+ (disarankan 20+)
- npm 9+ (atau pnpm/yarn/bun)
- Akun Supabase (gratis di supabase.com)

### 1. Clone & Install
```bash
git clone <repository-url>
cd akselera-chat
npm install
```

### 2. Setup Environment Variables
Copy `.env.local.example` ke `.env.local` dan isi:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **Dapatkan kredensial di**: Supabase Dashboard → Project Settings → API

### 3. Setup Database di Supabase
1. Buka Supabase Dashboard → SQL Editor
2. Jalankan isi file `supabase/schema.sql` (copy-paste & run)
3. Pastikan RLS enabled (sudah ada di schema)

### 4. Jalankan Development Server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

### Scripts Tersedia
```bash
npm run dev      # Development server (Turbopack)
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint check
```

---

## 🤖 AI Tools yang Digunakan

| Tool | Peran |
|------|-------|
| **opencode** | Primary AI coding agent - refactoring, debugging, feature implementation, code review |
| **9router** | Model routing / LLM provider untuk opencode |

> **Workflow**: `opencode` digunakan sebagai agent coding utama di terminal dengan model dari `9router` untuk reasoning, code generation, debugging, dan refactoring. Semua implementasi fitur, bug fixes, dan refactoring dilakukan via opencode.

---

## ⚠️ Hal yang Belum Selesai / Known Issues

- [ ] **Upload Gambar/Attachment** - Belum diimplementasikan (butuh Supabase Storage + client-side compression + Cloudinary/CDN)
- [ ] **Moderasi Konten** - Tidak ada filter NSFW/spam (perlu Cloudinary AI moderation atau custom)
- [ ] **Push Notifications** - Belum ada notifikasi real-time di browser/background
- [ ] **Message Reactions/Emoji Reactions** - React ke pesan (seperti Discord/Slack)
- [ ] **Message Edit/Delete** - Edit/delete own message (soft delete dengan `edited_at`)
- [ ] **Typing Indicator** - "User is typing..." real-time
- [ ] **Message Forward/Reply** - Reply to specific message, forward ke chat lain
- [ ] **Group Chat Support** - Saat ini hanya 1-on-1 (DM)

---

## 📁 Struktur Proyek

```
akselera-chat/
├── app/                    # Next.js App Router
│   ├── chat/               # Halaman chat utama (page.tsx)
│   ├── login/              # Halaman login
│   ├── register/           # Halaman register
│   ├── layout.tsx          # Root layout + providers
│   ├── globals.css         # Global styles + Tailwind v4
│   └── providers.tsx       # ThemeProvider, TooltipProvider
├── components/
│   ├── auth/               # LoginForm, RegisterForm
│   ├── chat/               # ChatList, ChatItem, ConversationPanel, MessageInput, MessageBubble
│   ├── layout/             # Header, ThemeToggle
│   └── ui/                 # shadcn/ui components (Button, Input, Avatar, etc.)
├── hooks/
│   └── useChat.ts          # Custom hook untuk chat state & logic
├── services/
│   └── chatService.ts      # Supabase service layer (fetchChats, fetchMessages, sendMessage, dll)
├── lib/
│   ├── supabase/           # Supabase clients (client.ts, server.ts, middleware.ts)
│   ├── types.ts            # TypeScript types
│   ├── utils.ts            # cn() utility (clsx + tailwind-merge)
│   └── validations/        # Zod schemas (chat.ts)
├── supabase/
│   └── schema.sql          # Database schema + RLS policies
├── public/                 # Static assets (logo, favicon)
├── hooks/                  # Custom React hooks
├── .env.local              # Environment variables (local only)
├── middleware.ts           # Next.js middleware (auth protection)
├── next.config.ts          # Next.js config
├── tailwind.config.ts      # Tailwind v4 config (via CSS)
└── tsconfig.json           # TypeScript config
```

---

## 📝 Catatan Pengembangan

### Conventions
- **Path Alias**: `@/*` mapped ke root (`tsconfig.json`)
- **Component Structure**: Feature-based di `components/`
- **State**: Custom hook `useChat` untuk logika chat, React state untuk UI lokal
- **Styling**: Tailwind v4 via CSS-first (`@import "tailwindcss"`)
- **Type Safety**: Strict TypeScript, Zod untuk validasi runtime
- **RLS First**: Semua query aman karena RLS di database

### Debugging Tips
```bash
# Cek TypeScript errors
npx tsc --noEmit

# Lint
npm run lint

# Build check
npm run build
```

---

## 📄 Lisensi
Proyek ini untuk keperluan internal/test magang Akselera Tech.

---