'use client'

import { RegisterForm } from '@/components/auth/RegisterForm'
import Image from 'next/image'
import Link from 'next/link'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

export default function RegisterPage() {
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground text-center mb-2">Buat Akun Baru</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-muted-foreground text-center mb-8">
            Daftar untuk mulai menggunakan Akselera Chat
          </p>

          <RegisterForm switchToLogin={() => {}} />

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-muted-foreground">
              Sudah punya akun?{' '}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline cursor-pointer transition-colors"
              >
                Masuk di Sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}