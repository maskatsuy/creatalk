'use server'

import { cookies } from 'next/headers'
import { createServerClientWithCookies } from '@/lib/supabase-server'

export async function leaveUserCall(planId: string, participantId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Verify participant belongs to user
    const { data: participant, error: participantError } = await supabase
      .from('queue_participants')
      .select('*')
      .eq('id', participantId)
      .eq('user_id', user.id)
      .single()

    if (participantError || !participant) {
      return { error: 'Participant not found' }
    }

    // Update participant status
    await supabase
      .from('queue_participants')
      .update({
        status: 'completed',
        call_ended_at: new Date().toISOString()
      })
      .eq('id', participantId)

    return { success: true }
  } catch (error) {
    console.error('Error in leaveUserCall:', error)
    return { error: 'Internal server error' }
  }
}