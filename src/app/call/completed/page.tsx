import { cookies } from 'next/headers'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { CallCompletedContent } from '@/features/call-completed'

interface CallCompletedPageProps {
  searchParams: Promise<{
    bookingId?: string
    creatorId?: string
    duration?: string
  }>
}

export default async function CallCompletedPage({ searchParams }: CallCompletedPageProps) {
  const params = await searchParams
  const cookieStore = await cookies()
  const supabase = createServerClientWithCookies(cookieStore)
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // 通話情報を取得
  let bookingData = null
  let creatorData = null

  if (params.bookingId) {
    // 予約情報を取得
    const { data: booking } = await supabase
      .from('call_bookings')
      .select(`
        *,
        call_products(
          title,
          duration_minutes
        )
      `)
      .eq('id', params.bookingId)
      .eq('user_id', user.id)
      .single()

    bookingData = booking
  }

  if (params.creatorId || bookingData?.creator_id) {
    // クリエイター情報を取得
    const creatorId = params.creatorId || bookingData?.creator_id
    const { data: creator } = await supabase
      .from('creator_applications')
      .select('user_id, display_name, bio, social_twitter, social_instagram')
      .eq('user_id', creatorId)
      .eq('status', 'approved')
      .single()

    creatorData = creator
  }

  // フォロー状態を確認
  let isFollowing = false
  if (creatorData) {
    const { data: followData } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', creatorData.user_id)
      .single()

    isFollowing = !!followData
  }

  return (
    <CallCompletedContent
      booking={bookingData}
      creator={creatorData}
      isFollowing={isFollowing}
      duration={params.duration ? parseInt(params.duration) : undefined}
    />
  )
}

export const metadata = {
  title: '通話完了 - Creatalk',
  description: '通話のご利用ありがとうございました'
}