'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl border border-border bg-background">
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="h-10 w-10 rounded-xl border border-border bg-background hover:bg-accent transition-all duration-300"
      aria-label={`Ganti ke mode ${theme === 'dark' ? 'terang' : 'gelap'}`}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform duration-300 hover:rotate-12" />
      ) : (
        <Moon className="h-5 w-5 rotate-0 scale-100 transition-transform duration-300 hover:rotate-12" />
      )}
    </Button>
  )
}
