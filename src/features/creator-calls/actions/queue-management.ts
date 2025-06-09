'use server'

import { createServerClientWithCookies } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { dailyService } from '@/lib/daily'
import { revalidatePath } from 'next/cache'

export async function getWaitingRoomStatus(planId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('call_products')
      .select('*')
      .eq('id', planId)
      .eq('creator_id', user.id)
      .single()

    if (planError || !plan) {
      return { error: 'Plan not found' }
    }

    // 現在のキューの参加者を取得
    const { data: participants, error: participantsError } = await supabase
      .from('queue_participants')
      .select(`
        *
      `)
      .eq('plan_id', planId)
      .in('status', ['waiting', 'in_call'])
      .order('position', { ascending: true })

    if (participantsError) {
      console.error('[getWaitingRoomStatus] Participants error:', participantsError)
      return { error: 'Failed to fetch participants' }
    }

    // Get profiles for all participants
    let participantsWithProfiles = participants || []
    if (participants && participants.length > 0) {
      const userIds = [...new Set(participants.map(p => p.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .in('id', userIds)

      // Map profiles to participants
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
      participantsWithProfiles = participants.map(p => ({
        ...p,
        profiles: profileMap.get(p.user_id) || null
      }))
    }

    // 現在の通話を取得
    const { data: currentCall } = await supabase
      .from('current_queue_calls')
      .select('*')
      .eq('plan_id', planId)
      .eq('creator_id', user.id)
      .eq('status', 'active')
      .single()

    // 現在通話中の参加者を特定
    const currentParticipant = participantsWithProfiles?.find(p => p.status === 'in_call')
    const waitingParticipants = participantsWithProfiles?.filter(p => p.status === 'waiting') || []

    // クリエイターの状態を取得
    const { data: creatorStatus } = await supabase
      .from('creator_queue_status')
      .select('status')
      .eq('creator_id', user.id)
      .eq('plan_id', planId)
      .single()

    return {
      plan,
      participants: participantsWithProfiles || [],
      currentParticipant,
      waitingCount: waitingParticipants.length,
      currentCall,
      creatorStatus: creatorStatus?.status || 'waiting',
      totalParticipants: participantsWithProfiles?.length || 0
    }
  } catch (error) {
    console.error('[getWaitingRoomStatus] Error:', error)
    return { error: 'Internal server error' }
  }
}

export async function updateCreatorStatus(planId: string, status: 'waiting' | 'break') {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    const { error } = await supabase
      .from('creator_queue_status')
      .upsert({
        creator_id: user.id,
        plan_id: planId,
        status,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('[updateCreatorStatus] Error:', error)
      return { error: 'Failed to update status' }
    }

    revalidatePath(`/creator/waiting-room/${planId}`)
    return { success: true }
  } catch (error) {
    console.error('[updateCreatorStatus] Error:', error)
    return { error: 'Internal server error' }
  }
}

export async function startQueueCall(planId: string, participantId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('call_products')
      .select('*')
      .eq('id', planId)
      .eq('creator_id', user.id)
      .single()

    if (planError || !plan) {
      return { error: 'Plan not found' }
    }

    // Get participant details
    const { data: participant, error: participantError } = await supabase
      .from('queue_participants')
      .select('*')
      .eq('id', participantId)
      .eq('plan_id', planId)
      .eq('status', 'waiting')
      .single()

    if (participantError || !participant) {
      console.error('[startQueueCall] Participant error:', participantError)
      return { error: 'Participant not found or not waiting' }
    }

    // Get participant profile separately
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', participant.user_id)
      .single()

    // Add profile to participant
    const participantWithProfile = {
      ...participant,
      profiles: profile
    }

    // Check for existing active call
    const { data: existingCall } = await supabase
      .from('current_queue_calls')
      .select('*')
      .eq('plan_id', planId)
      .eq('creator_id', user.id)
      .eq('status', 'active')
      .single()

    if (existingCall) {
      console.log('[startQueueCall] Active call already exists:', existingCall)
      return { error: 'Active call already exists for this plan' }
    }

    // Create a Daily.co room for this call
    const roomName = `queue-${planId}-${participantId}-${Date.now()}`
    
    try {
      const dailyRoom = await dailyService.createRoom({
        name: roomName,
        properties: {
          exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiry
          enable_prejoin_ui: false,
          enable_chat: true,
          enable_screenshare: true,
          enable_recording: false,
          max_participants: 2,
          eject_at_room_exp: false // 時間が来ても自動的に退出させない
        }
      })

      if (!dailyRoom) {
        console.error('[startQueueCall] Daily room creation failed')
        return { error: 'Failed to create video room' }
      }

      // 通話終了時刻を計算
      const startTime = new Date()
      const endTime = new Date(startTime.getTime() + plan.duration_minutes * 60 * 1000)

      // Create current_queue_calls record
      const { data: currentCall, error: currentCallError } = await supabase
        .from('current_queue_calls')
        .insert({
          plan_id: planId,
          creator_id: user.id,
          participant_id: participantWithProfile.id, // Use participant ID, not user ID
          daily_room_name: roomName,
          daily_room_url: dailyRoom.url,
          status: 'active',
          started_at: startTime.toISOString(),
          ends_at: endTime.toISOString()
        })
        .select()
        .single()

      if (currentCallError || !currentCall) {
        console.error('[startQueueCall] Current call insert error:', currentCallError)
        // Try to delete the Daily room if DB insert fails
        await dailyService.deleteRoom(roomName)
        return { error: 'Failed to save call record' }
      }

      // Update participant status to in_call
      const { error: updateParticipantError } = await supabase
        .from('queue_participants')
        .update({ 
          status: 'in_call',
          updated_at: new Date().toISOString()
        })
        .eq('id', participantId)

      if (updateParticipantError) {
        console.error('[startQueueCall] Participant update error:', updateParticipantError)
      }

      // Create meeting tokens for both participants
      const creatorToken = await dailyService.createMeetingToken(roomName, {
        user_id: user.id,
        user_name: 'クリエイター',
        is_owner: true
      })

      const participantToken = await dailyService.createMeetingToken(roomName, {
        user_id: participantWithProfile.user_id,
        user_name: participantWithProfile.profiles?.full_name || participantWithProfile.profiles?.email || 'ゲスト',
        is_owner: false
      })

      revalidatePath(`/creator/waiting-room/${planId}`)
      
      // Create embed URL for creator
      const embedUrl = `/call/${currentCall.id}?url=${encodeURIComponent(dailyRoom.url)}&t=${creatorToken}&duration=${plan.duration_minutes}&booking=queue-${participantId}&queue=true&planId=${planId}&startedAt=${encodeURIComponent(currentCall.started_at)}&endsAt=${encodeURIComponent(currentCall.ends_at)}`
      
      return { 
        success: true,
        roomUrl: dailyRoom.url,
        creatorToken: creatorToken,
        participantToken: participantToken,
        duration: plan.duration_minutes,
        currentCall,
        embedUrl
      }
    } catch (dailyError) {
      console.error('[startQueueCall] Daily API error:', dailyError)
      return { error: 'Failed to setup video call' }
    }
  } catch (error) {
    console.error('[startQueueCall] Error:', error)
    return { error: 'Internal server error' }
  }
}

export async function endQueueCall(planId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Get current active call
    const { data: currentCall, error: currentCallError } = await supabase
      .from('current_queue_calls')
      .select('*')
      .eq('plan_id', planId)
      .eq('creator_id', user.id)
      .eq('status', 'active')
      .single()

    if (currentCallError || !currentCall) {
      console.error('[endQueueCall] No active call found:', currentCallError)
      return { error: 'No active call found' }
    }

    // Delete the Daily.co room
    if (currentCall.daily_room_url) {
      const roomName = currentCall.daily_room_name || currentCall.daily_room_url.split('/').pop()
      if (roomName) {
        await dailyService.deleteRoom(roomName)
      }
    }

    // Update current_queue_calls status
    const { error: updateCallError } = await supabase
      .from('current_queue_calls')
      .update({ 
        status: 'ended',
        ended_at: new Date().toISOString()
      })
      .eq('id', currentCall.id)

    if (updateCallError) {
      console.error('[endQueueCall] Update call error:', updateCallError)
    }

    // Update participant status to completed
    if (currentCall.participant_id) {
      const { error: updateParticipantError } = await supabase
        .from('queue_participants')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', currentCall.participant_id) // Use participant ID directly
        .eq('status', 'in_call')

      if (updateParticipantError) {
        console.error('[endQueueCall] Update participant error:', updateParticipantError)
      }
    }

    // Check if there are more participants waiting
    const { data: waitingParticipants } = await supabase
      .from('queue_participants')
      .select('id')
      .eq('plan_id', planId)
      .eq('status', 'waiting')
      .order('position', { ascending: true })
      .limit(1)

    revalidatePath(`/creator/waiting-room/${planId}`)
    
    return { 
      success: true,
      hasMoreParticipants: (waitingParticipants?.length || 0) > 0
    }
  } catch (error) {
    console.error('[endQueueCall] Error:', error)
    return { error: 'Internal server error' }
  }
}

export async function addTestParticipant(planId: string, displayName: string = 'テストユーザー') {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Verify plan ownership
    const { data: plan } = await supabase
      .from('call_products')
      .select('id')
      .eq('id', planId)
      .eq('creator_id', user.id)
      .single()

    if (!plan) {
      return { error: 'Plan not found' }
    }

    // Get current max position
    const { data: lastParticipant } = await supabase
      .from('queue_participants')
      .select('position')
      .eq('plan_id', planId)
      .order('position', { ascending: false })
      .limit(1)
      .single()

    const nextPosition = (lastParticipant?.position || 0) + 1

    // Create test participant
    const { error: insertError } = await supabase
      .from('queue_participants')
      .insert({
        plan_id: planId,
        user_id: user.id, // Use creator's ID for test
        status: 'waiting',
        position: nextPosition,
        display_name: displayName,
        is_test: true
      })

    if (insertError) {
      console.error('[addTestParticipant] Insert error:', insertError)
      return { error: 'Failed to add test participant' }
    }

    revalidatePath(`/creator/waiting-room/${planId}`)
    return { success: true }
  } catch (error) {
    console.error('[addTestParticipant] Error:', error)
    return { error: 'Internal server error' }
  }
}

export async function rejoinQueueCall(planId: string, currentCallId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Get current call details
    const { data: currentCall, error: callError } = await supabase
      .from('current_queue_calls')
      .select('*')
      .eq('id', currentCallId)
      .eq('creator_id', user.id)
      .eq('status', 'active')
      .single()

    if (callError || !currentCall) {
      return { error: 'Active call not found' }
    }

    if (!currentCall.daily_room_url) {
      return { error: 'Call room not found' }
    }

    // Get plan details for duration
    const { data: plan } = await supabase
      .from('call_products')
      .select('duration_minutes')
      .eq('id', planId)
      .single()

    // Create a new meeting token
    const roomName = currentCall.daily_room_name || currentCall.daily_room_url.split('/').pop() || ''
    const creatorToken = await dailyService.createMeetingToken(roomName, {
      user_id: user.id,
      user_name: 'クリエイター',
      is_owner: true
    })

    // Create embed URL for creator
    const embedUrl = `/call/${currentCallId}?url=${encodeURIComponent(currentCall.daily_room_url)}&t=${creatorToken}&duration=${plan?.duration_minutes || 30}&queue=true&planId=${planId}&startedAt=${encodeURIComponent(currentCall.started_at)}&endsAt=${encodeURIComponent(currentCall.ends_at)}`
    
    return { 
      success: true,
      roomUrl: currentCall.daily_room_url,
      creatorToken: creatorToken,
      duration: plan?.duration_minutes || 30,
      currentCall,
      embedUrl
    }
  } catch (error) {
    console.error('[rejoinQueueCall] Error:', error)
    return { error: 'Internal server error' }
  }
}