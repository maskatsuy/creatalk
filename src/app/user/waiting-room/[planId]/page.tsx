import { cookies } from 'next/headers'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { UserWaitingRoomFeature } from '@/features/user-waiting-room'

interface PageProps {
  params: Promise<{
    planId: string
  }>
}

export default async function UserWaitingRoomPage({ params }: PageProps) {
  const cookieStore = await cookies()
  const supabase = createServerClientWithCookies(cookieStore)
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Await params as required by Next.js 15
  const { planId } = await params

  // Check if user has a waiting booking for this plan
  const { data: participants, error } = await supabase
    .from('queue_participants')
    .select('*')
    .eq('plan_id', planId)
    .eq('user_id', user.id)
    .in('status', ['waiting', 'in_call']) // Include both waiting and in_call status
    .order('created_at', { ascending: true })
    .limit(1)

  console.log('[UserWaitingRoom] Participant query:', { 
    urlPlanId: planId,
    userId: user.id, 
    queryResult: {
      participants, 
      error,
      count: participants?.length
    }
  })

  if (error || !participants || participants.length === 0) {
    console.log('[UserWaitingRoom] No participant found, redirecting to /my-bookings')
    redirect('/my-bookings')
  }

  return <UserWaitingRoomFeature planId={planId} userId={user.id} />
}

export const metadata = {
  title: '待機室 - Creatalk',
  description: '通話開始までお待ちください'
}