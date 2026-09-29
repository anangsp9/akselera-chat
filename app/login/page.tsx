'use client'

import { LoginForm } from '@/components/auth/LoginForm'
import Image from 'next/image'
import Link from 'next/link'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-background">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl shadow-2xl p-8 sm:p-10 transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="inline-flex items-center gap-2">
              <Image
                src="/logo-dark.png"
                alt="Akselera Chat Logo"
                width={32}
                height={32}
                className="block dark:hidden"
              />
              <Image
                src="/logo-light.png"
                alt="Akselera Chat Logo"
                width={32}
                height={32}
                className="hidden dark:block"
              />
              <span className="text-xl font-bold text-slate-900 dark:text-foreground">Akselera Chat</span>
            </div>
            <ThemeToggle />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground text-center mb-2">Selamat Datang Kembali</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-muted-foreground text-center mb-8">
            Masuk ke akun Anda untuk melanjutkan percakapan
          </p>

          <LoginForm switchToRegister={() => {}} />

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-muted-foreground">
              Belum punya akun?{' '}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline cursor-pointer transition-colors"
              >
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
