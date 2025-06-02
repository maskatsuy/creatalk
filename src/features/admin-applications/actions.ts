'use server'

import { checkIsAdmin } from './hooks/useAdminCheck'
import { revalidatePath } from 'next/cache'

export async function getCreatorApplications() {
  const { supabase } = await checkIsAdmin()
  
  const { data, error } = await supabase
    .from('creator_applications')
    .select(`
      id,
      user_id,
      display_name,
      bio,
      category,
      specialty,
      experience,
      portfolio_url,
      social_twitter,
      social_instagram,
      social_youtube,
      social_other,
      content_plan,
      availability,
      pricing_plan,
      status,
      created_at,
      updated_at,
      reviewed_by,
      admin_feedback,
      profiles!creator_applications_user_id_fkey (
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
    throw new Error('申請情報の取得に失敗しました')
  }

  return data
}

export async function approveApplication(applicationId: string) {
  const { user, supabase } = await checkIsAdmin()

  // Get application details
  const { data: application, error: fetchError } = await supabase
    .from('creator_applications')
    .select('user_id, status')
    .eq('id', applicationId)
    .single()

  if (fetchError || !application) {
    throw new Error('申請情報が見つかりません')
  }

  if (application.status !== 'pending') {
    throw new Error('この申請は既に処理されています')
  }

  // Update application status
  // The database trigger 'on_creator_approval' will automatically:
  // 1. Add the creator role to user_roles (with ON CONFLICT DO NOTHING)
  // 2. Create a record in the creators table (with ON CONFLICT DO NOTHING)
  const { error: updateError } = await supabase
    .from('creator_applications')
    .update({
      status: 'approved',
      reviewed_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', applicationId)

  if (updateError) {
    console.error('Update error:', updateError)
    throw new Error(`申請の承認に失敗しました: ${updateError.message}`)
  }

  revalidatePath('/admin/applications')
  return { success: true }
}

export async function rejectApplication(applicationId: string, adminFeedback: string) {
  const { user, supabase } = await checkIsAdmin()

  const { error } = await supabase
    .from('creator_applications')
    .update({
      status: 'rejected',
      reviewed_by: user.id,
      admin_feedback: adminFeedback,
      updated_at: new Date().toISOString()
    })
    .eq('id', applicationId)
    .eq('status', 'pending')

  if (error) {
    throw new Error('申請の却下に失敗しました')
  }

  revalidatePath('/admin/applications')
  return { success: true }
}