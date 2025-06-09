'use server'

import { cookies } from 'next/headers'
import { createServerClientWithCookies } from '@/lib/supabase-server'

export async function skipParticipant(planId: string, participantId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClientWithCookies(cookieStore)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Unauthorized' }
    }

    // Verify the plan belongs to this creator
    const { data: plan, error: planError } = await supabase
      .from('call_products')
      .select('creator_id')
      .eq('id', planId)
      .eq('creator_id', user.id)
      .single()

    if (planError || !plan) {
      return { error: 'Plan not found or unauthorized' }
    }

    // Update participant status to 'no_show' (不参加)
    const { error: updateError } = await supabase
      .from('queue_participants')
      .update({
        status: 'no_show',
        call_ended_at: new Date().toISOString()
      })
      .eq('id', participantId)
      .eq('plan_id', planId)

    if (updateError) {
      console.error('Error updating participant status:', updateError)
      return { error: 'Failed to skip participant' }
    }

    // Update positions of remaining participants
    const { error: positionError } = await supabase.rpc('update_queue_positions', {
      p_plan_id: planId,
      p_skipped_position: participantId
    })

    if (positionError) {
      console.error('Error updating queue positions:', positionError)
    }

    return { success: true }
  } catch (error) {
    console.error('Error in skipParticipant:', error)
    return { error: 'Internal server error' }
  }
}