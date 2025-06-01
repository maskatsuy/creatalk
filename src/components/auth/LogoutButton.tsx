'use client'

import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
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