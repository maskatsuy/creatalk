import { cookies } from 'next/headers'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { MyBookingsFeature } from '@/features/my-bookings'

export default async function MyBookingsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClientWithCookies(cookieStore)
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  return <MyBookingsFeature userId={user.id} />
}

export const metadata = {
  title: '予約一覧 - Creatalk',
  description: 'あなたの予約した通話の一覧を確認できます。'
}