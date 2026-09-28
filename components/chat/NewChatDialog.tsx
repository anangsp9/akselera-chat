'use client'

import { useState, useEffect } from 'react'
import { User } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'

const supabase = createClient()

interface NewChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string
  onSelectUser: (user: User) => void
}

export function NewChatDialog({
  open,
  onOpenChange,
  currentUserId,
  onSelectUser,
}: NewChatDialogProps) {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchUsers()
    }
  }, [open])

  useEffect(() => {
    if (search) {
      const filtered = users.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [search, users])

  async function fetchUsers() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUserId)
        .order('full_name')

      if (error) throw error
      setUsers(data || [])
      setFilteredUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleSelectUser(user: User) {
    onSelectUser(user)
    onOpenChange(false)
    setSearch('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat Baru</DialogTitle>
          <DialogDescription>Pilih pengguna untuk memulai percakapan</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />

          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Memuat...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Tidak ada pengguna ditemukan</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredUsers.map((user) => {
                  const initials = user.full_name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || user.email.slice(0, 2).toUpperCase()

                  return (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium text-sm truncate">
                          {user.full_name || user.email}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
