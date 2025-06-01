'use client'

import { supabase } from '@/lib/supabase-client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { AuthError } from '@supabase/supabase-js'
import Link from 'next/link'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // ログイン成功後、リダイレクト先に遷移
      router.push(redirectPath)
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。')
      } else {
        setError('予期せぬエラーが発生しました。')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          パスワード
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>
      <div className="text-sm text-center">
        <Link href="/signup" className="text-primary hover:underline">
          新規登録はこちら
        </Link>
      </div>
    </form>
  )
} 