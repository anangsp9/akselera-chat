'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

const supabase = createClient()

interface LoginFormProps {
  switchToRegister: () => void
}

export function LoginForm({ switchToRegister }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loginWithEmail(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/chat')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={loginWithEmail} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="nama@akselera.tech"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="pl-10 h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="pl-10 pr-10 h-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="remember" 
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
          />
          <label htmlFor="remember" className="text-sm text-muted-foreground">Ingat Saya</label>
        </div>
        <button type="button" className="text-sm text-primary hover:underline font-medium">
          Lupa Password?
        </button>
      </div>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Masuk
      </Button>
    </form>
  )
}
