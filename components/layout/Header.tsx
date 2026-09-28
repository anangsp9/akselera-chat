'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { LogOut, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'

const supabase = createClient()

interface HeaderProps {
  userName?: string
}

export function Header({ userName = 'User' }: HeaderProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!mounted) {
    return null
  }

  const logoSrc = theme === 'dark' ? '/logo-light.png' : '/logo-dark.png'

  return (
    <header className="border-b border-border bg-background">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Image src={logoSrc} alt="Akselera Tech" width={40} height={40} className="h-10 w-auto" />
          <h1 className="text-lg font-semibold hidden sm:inline">Akselera Chat</h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "sm:hidden")}>
              <Menu className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled className="text-xs">
                {userName}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{userName}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
