import { redirect } from 'next/navigation'
import { createServerClientWithCookies, type CookieStore } from './supabase-server'
import type { Database } from '@/types/database'

export async function requireAuth(cookieStore: CookieStore) {
  const supabase = createServerClientWithCookies<Database>(cookieStore)
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }
  
  return user
}

export async function getUser(cookieStore: CookieStore) {
  const supabase = createServerClientWithCookies<Database>(cookieStore)
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error.message)
    return null
  }
  
  return user
}

export async function getUserRole(cookieStore: CookieStore) {
  const user = await getUser(cookieStore)
  if (!user) return null
  
  const supabase = createServerClientWithCookies<Database>(cookieStore)
  const { data: role, error } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', user.id)
    .single()
    
  if (error) {
    console.error('Error getting user role:', error.message)
    return null
  }
  
  return role?.role_id
}

export async function requireCreatorAuth(cookieStore: CookieStore) {
  const user = await requireAuth(cookieStore)
  const role = await getUserRole(cookieStore)
  
  if (role !== 'creator') {
    redirect('/creator/apply')
  }
  
  return user
} 