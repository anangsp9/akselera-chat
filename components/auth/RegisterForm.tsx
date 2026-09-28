'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'

const supabase = createClient()

interface RegisterFormProps {
  switchToLogin: () => void
}

export function RegisterForm({ switchToLogin }: RegisterFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function signUpWithEmail(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok!')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/chat')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={signUpWithEmail} className="space-y-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Nama Lengkap
        </Label>
        <Input
          id="fullName"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={loading}
          className="h-11"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="nama@akselera.tech"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="h-11"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="h-11 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Ulangi Password
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Masukkan kembali password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            className="h-11 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
        {loading ? 'Mendaftarkan...' : 'Daftar'}
      </Button>
    </form>
  )
}
