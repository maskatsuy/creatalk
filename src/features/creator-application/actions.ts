'use server'

import { createServerClient } from '@/lib/supabase/server'
import { CreatorApplicationFormData } from './types'

export async function submitCreatorApplication(formData: CreatorApplicationFormData) {
  const supabase = await createServerClient()
  
  // 認証状態を確認
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return {
      success: false,
      error: 'ログインが必要です'
    }
  }

  try {
    // 既存の申請をチェック
    const { data: existingApplication } = await supabase
      .from('creator_applications')
      .select('status')
      .eq('user_id', user.id)
      .in('status', ['pending', 'approved'])
      .limit(1)
      .single()

    if (existingApplication) {
      return {
        success: false,
        error: '既に申請が提出されています'
      }
    }

    // 申請を挿入
    const insertData = {
      user_id: user.id,
      ...formData
    }

    const { error } = await supabase
      .from('creator_applications')
      .insert([insertData])

    if (error) {
      console.error('Insert error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      message: '申請を受け付けました'
    }
  } catch (error) {
    console.error('Submission error:', error)
    return {
      success: false,
      error: 'エラーが発生しました'
    }
  }
}