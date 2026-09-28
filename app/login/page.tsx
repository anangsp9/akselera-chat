'use client'

import { LoginForm } from '@/components/auth/LoginForm'
import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-indigo-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      <div className="w-full max-w-md">
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-8 sm:p-10 transition-all duration-300 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
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
              <span className="text-xl font-bold text-slate-900 dark:text-white">Akselera Chat</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Selamat Datang Kembali</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Masuk ke akun Anda untuk melanjutkan percakapan
            </p>
          </div>

          <LoginForm switchToRegister={() => {}} />

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Belum punya akun?{' '}
              <Link
                href="/register"
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline cursor-pointer transition-colors"
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
