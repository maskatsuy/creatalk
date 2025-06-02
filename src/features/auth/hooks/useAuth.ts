'use client'

import { useCallback, useEffect, useState } from 'react'
import { User, AuthChangeEvent, Session, AuthError } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

export const useAuth = (initialUser: User | null = null) => {
  const [user, setUser] = useState<User | null>(initialUser)
  const [loading, setLoading] = useState(!initialUser)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role_id')
            .eq('user_id', user.id)
            .eq('role_id', 'admin')
            .single()
          
          if (!error && data) {
            setIsAdmin(true)
          } else {
            setIsAdmin(false)
          }
        } catch (error) {
          console.error('Error checking admin status:', error)
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
    }
    
    checkAdminStatus()
  }, [user, supabase])

  useEffect(() => {
    if (!initialUser) {
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
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
      // if (session?.user) {
      //   router.refresh()
      // }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, router, initialUser])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      toast.success('ログインしました')
      router.refresh() // ここはログイン成功時なので残しても良いかもしれない
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        console.error('Error signing in:', error.message)
        toast.error('ログインに失敗しました')
        throw error
      }
    }
  }, [supabase.auth, router])

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
  }, [supabase.auth])

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('ログアウトしました')
      router.push('/login')
      // router.refresh() // ログアウト後はページ遷移するので不要かもしれない
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        console.error('Error signing out:', error.message)
        toast.error('ログアウトに失敗しました')
      }
    }
  }, [supabase.auth, router])

  return {
    user,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
  }
} 