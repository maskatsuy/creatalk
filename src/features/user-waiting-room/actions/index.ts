'use server'

import { cookies } from 'next/headers'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import type { QueueStatus } from '../types'

export async function getUserQueueStatus(planId: string, userId: string): Promise<{ status?: QueueStatus, error?: string }> {
  console.log('[getUserQueueStatus] Called with:', { planId, userId })
  
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('[getUserQueueStatus] Auth check:', { 
      hasUser: !!user, 
      authError,
      userIdMatch: user?.id === userId 
    })
    
    if (authError || !user || user.id !== userId) {
      console.log('[getUserQueueStatus] Unauthorized access')
      return { error: 'Unauthorized' }
    }

    // Get my position (複数ある場合は最も早い位置のものを取得)
    // waiting または in_call ステータスの参加者を取得
    const { data: myParticipants, error: myError } = await supabase
      .from('queue_participants')
      .select('*')
      .eq('plan_id', planId)
      .eq('user_id', userId)
      .in('status', ['waiting', 'in_call'])
      .order('position', { ascending: true })
      .limit(1)

    const myParticipant = myParticipants?.[0] || null

    console.log('[getUserQueueStatus] Query result:', {
      planId,
      userId,
      myParticipant,
      myError,
      participantCount: myParticipants?.length || 0
    })

    if (myError || !myParticipant) {
      console.error('[getUserQueueStatus] Participant not found:', myError)
      return { error: '予約が見つかりません' }
    }

    // Get plan details with creator info
    const { data: plan, error: planError } = await supabase
      .from('call_products')
      .select('id, title, duration_minutes, creator_id')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      return { error: 'プランが見つかりません' }
    }

    // Get creator info
    const { data: creator } = await supabase
      .from('creator_applications')
      .select('display_name')
      .eq('user_id', plan.creator_id)
      .eq('status', 'approved')
      .single()

    // Get all active participants (waiting or in_call)
    const { data: allActive } = await supabase
      .from('queue_participants')
      .select('position, status')
      .eq('plan_id', planId)
      .in('status', ['waiting', 'in_call'])
      .order('position', { ascending: true })

    // 自分より前にいる待機中の人数を計算
    const peopleAhead = allActive?.filter(p => 
      p.status === 'waiting' && p.position < myParticipant.position
    ).length || 0
    
    // 実際にアクティブな参加者の総数（待機中 + 通話中）
    const totalActive = allActive?.length || 0
    
    // 自分の実際の順番（アクティブな参加者の中での順位）
    const myActualPosition = allActive ? allActive.findIndex(p => p.position === myParticipant.position) + 1 : myParticipant.position

    // Check if there's a current call
    const { data: currentCall } = await supabase
      .from('current_queue_calls')
      .select(`
        *,
        participant_id,
        queue_participants!inner(position)
      `)
      .eq('plan_id', planId)
      .eq('status', 'active')
      .single()

    // Check if it's my turn
    // 自分の番 = 前に誰もいない、かつ（現在通話がないか、自分が通話中でステータスがactive）
    const isMyTurn = peopleAhead === 0 && (!currentCall || (currentCall.participant_id === myParticipant.id && currentCall.status === 'active'))

    // Estimate wait time
    const estimatedWaitTime = currentCall 
      ? (peopleAhead + 1) * plan.duration_minutes
      : peopleAhead * plan.duration_minutes

    // 自分の番の場合、通話ルームがあるか確認
    let callRoom: { url: string; token: string; startedAt?: string; endsAt?: string } | undefined
    if (isMyTurn) {
      // 自分の通話ルームを検索
      const { data: myCall } = await supabase
        .from('current_queue_calls')
        .select('daily_room_url, daily_room_name, status, started_at, ends_at')
        .eq('plan_id', planId)
        .eq('participant_id', myParticipant.id)
        .eq('status', 'active')
        .single()
      
      if (myCall && myCall.daily_room_url && myCall.daily_room_name) {
        // 通話がまだアクティブか確認
        if (myCall.status !== 'active') {
          console.log('[getUserQueueStatus] Call is no longer active:', myCall.status)
          // baseStatusが定義されていないので、基本的な情報を返す
          return {
            status: {
              planId: plan.id,
              planTitle: plan.title,
              planDuration: plan.duration_minutes,
              creatorName: creator?.display_name || 'クリエイター',
              myPosition: myActualPosition,
              totalWaiting: totalActive,
              estimatedWaitTime: estimatedWaitTime > 0 ? estimatedWaitTime : null,
              isMyTurn: false, // 通話が終了しているので、自分の番ではない
              callRoom: undefined
            }
          }
        }
        
        // Daily.coのトークンを生成（Server Action内ではfetchを使用できないため、直接API呼び出し）
        try {
          // Daily.co APIを直接呼び出す
          const DAILY_API_KEY = process.env.DAILY_API_KEY
          const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${DAILY_API_KEY}`
            },
            body: JSON.stringify({
              properties: {
                room_name: myCall.daily_room_name,
                user_name: user.email?.split('@')[0] || 'ユーザー',
                is_owner: false,
                enable_screenshare: true,
                enable_recording: false,
                start_video_off: false,
                start_audio_off: false
              }
            })
          })
          
          if (response.ok) {
            const { token } = await response.json()
            callRoom = {
              url: myCall.daily_room_url,
              token,
              startedAt: myCall.started_at,
              endsAt: myCall.ends_at
            }
            console.log('[getUserQueueStatus] Token generated successfully')
          } else {
            console.error('[getUserQueueStatus] Failed to generate token:', await response.text())
          }
        } catch (error) {
          console.error('[getUserQueueStatus] Error generating token:', error)
        }
      }
    }

    return {
      status: {
        planId: plan.id,
        planTitle: plan.title,
        planDuration: plan.duration_minutes, // 通話時間を追加
        creatorName: creator?.display_name || 'クリエイター',
        myPosition: myActualPosition,
        totalWaiting: totalActive,
        estimatedWaitTime: estimatedWaitTime > 0 ? estimatedWaitTime : null,
        isMyTurn,
        currentCall: currentCall ? {
          participantPosition: currentCall.queue_participants.position,
          endsAt: currentCall.ends_at
        } : undefined,
        callRoom
      }
    }
  } catch (error) {
    console.error('Error in getUserQueueStatus:', error)
    return { error: 'Internal server error' }
  }
}

export async function leaveQueue(planId: string, userId: string): Promise<{ success: boolean, error?: string }> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Verify user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Update participant status
    const { error } = await supabase
      .from('queue_participants')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('plan_id', planId)
      .eq('user_id', userId)
      .eq('status', 'waiting')

    if (error) {
      console.error('Error leaving queue:', error)
      return { success: false, error: '退出処理に失敗しました' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in leaveQueue:', error)
    return { success: false, error: 'Internal server error' }
  }
}