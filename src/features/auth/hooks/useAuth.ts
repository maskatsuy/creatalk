'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import { User, AuthChangeEvent, Session, AuthError } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

export const useAuth = (initialUser: User | null = null) => {
  const [user, setUser] = useState<User | null>(initialUser)
  const [loading, setLoading] = useState(!initialUser)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCreator, setIsCreator] = useState(false)
  const router = useRouter()
  
  // Create supabase client only once using useMemo
  const supabase = useMemo(() => createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  // Check if user is admin or creator
  useEffect(() => {
    const checkUserRoles = async () => {
      if (user) {
        try {
          // Check for all user roles
          const { data, error } = await supabase
            .from('user_roles')
            .select('role_id')
            .eq('user_id', user.id)
          
          if (!error && data) {
            const roleIds = data.map(role => role.role_id)
            setIsAdmin(roleIds.includes('admin'))
            setIsCreator(roleIds.includes('creator'))
          } else {
            setIsAdmin(false)
            setIsCreator(false)
          }
        } catch (error) {
          console.error('Error checking user roles:', error)
          setIsAdmin(false)
          setIsCreator(false)
        }
      } else {
        setIsAdmin(false)
        setIsCreator(false)
      }
    }
    
    checkUserRoles()
  }, [user, supabase])

  useEffect(() => {
    if (!initialUser) {
      const getUser = async () => {
        try {
          const { data: { user }, error } = await supabase.auth.getUser()
          if (error) {
            // 認証セッションがない、またはリフレッシュトークンエラーの場合は静かに処理
            if (error.message.includes('Refresh Token') || error.message === 'Auth session missing!') {
              // 正常な未ログイン状態として扱う
              setUser(null)
            } else {
              // それ以外の本当のエラーのみログ出力
              console.error('Error loading user:', error.message)
              toast.error('ユーザー情報の取得に失敗しました')
            }
          } else {
            setUser(user)
          }
        } catch (error: unknown) {
          console.error('Unexpected error in getUser:', error)
        } finally {
          setLoading(false)
        }
      }
      getUser()
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      // リフレッシュトークンエラーの場合
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.error('Token refresh failed')
        setUser(null)
        // エラーメッセージは表示しない（ユーザーは既にログアウト状態）
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      } else {
        setUser(session?.user ?? null)
      }
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
        console.error('Error signing up:', error.message, error)
        toast.error(`アカウント作成に失敗しました: ${error.message}`)
        throw error
      } else {
        console.error('Unknown error signing up:', error)
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
      router.push('/')  // ランディングページに戻す
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
    isCreator,
    signIn,
    signUp,
    signOut,
  }
} 