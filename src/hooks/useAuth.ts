import { useCallback, useEffect, useState } from 'react'
import { User, AuthChangeEvent, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error: unknown) {
        if (error instanceof AuthError) {
          console.error('Error loading user:', error.message)
          toast.error('ユーザー情報の取得に失敗しました')
        }
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      toast.success('ログインしました')
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        console.error('Error signing in:', error.message)
        toast.error('ログインに失敗しました')
        throw error
      }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      toast.success('確認メールを送信しました')
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        console.error('Error signing up:', error.message)
        toast.error('アカウント作成に失敗しました')
        throw error
      }
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('ログアウトしました')
      router.push('/login')
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        console.error('Error signing out:', error.message)
        toast.error('ログアウトに失敗しました')
      }
    }
  }, [router])

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }
} 