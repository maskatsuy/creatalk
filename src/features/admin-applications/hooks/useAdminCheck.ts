import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import type { Database } from '@/types/database'

export async function checkIsAdmin() {
  const cookieStore = await cookies()
  
  const supabase = createServerClientWithCookies<Database>(cookieStore)

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', user.id)
    .eq('role_id', 'admin')
    .single()

  if (roleError || !roleData) {
    redirect('/')
  }

  return { user, supabase }
}