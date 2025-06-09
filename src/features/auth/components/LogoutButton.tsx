'use client'

import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // セッションを確認
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // セッションがない場合は、すでにログアウトしているとみなす
        console.log('No session found, treating as already logged out')
        router.push('/')
        router.refresh()
        return
      }

      // ログアウト実行
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error signing out:', error)
        // エラーがあってもホームに遷移（セッションクリーンアップのため）
        if (error.message.includes('session missing')) {
          // セッションがない場合のエラーは無視してホームに遷移
          router.push('/')
          router.refresh()
          return
        }
        toast.error('ログアウトに失敗しました')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('Unexpected error during logout:', error)
      // エラーが発生してもホームに遷移
      router.push('/')
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
    >
      ログアウト
    </button>
  )
} 