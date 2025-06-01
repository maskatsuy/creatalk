import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import { CreatorApplicationForm } from '@/components/creator/CreatorApplicationForm'
import type { Database } from '@/types/database'
import { cookies } from 'next/headers'

export default async function CreatorApplyPage() {
  const cookieStore = await cookies()
  const user = await requireAuth(cookieStore)
  const supabase = createServerClientWithCookies<Database>(cookieStore)

  // Check if user already has a pending application
  const { data: existingApplication } = await supabase
    .from('creator_applications')
    .select('status, admin_feedback')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Check if user is already a creator
  const { data: creatorRole, error: creatorRoleError } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', user.id)
    .eq('role_id', 'creator')
    .maybeSingle()

  console.log('Creator Role:', creatorRole)
  console.log('Creator Role Error:', creatorRoleError)

  if (creatorRole) {
    console.log('Redirecting to /creator/dashboard')
    redirect('/creator/dashboard')
  }

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-heading font-bold">
        クリエイター申請
      </h1>
      {existingApplication?.status === 'pending' ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">申請中</h2>
          <p className="text-yellow-700">
            あなたのクリエイター申請は現在審査中です。審査結果をお待ちください。
          </p>
        </div>
      ) : existingApplication?.status === 'rejected' ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">前回の申請が却下されました</h2>
          <p className="text-red-700 mb-4">
            {existingApplication.admin_feedback || '申請内容を見直して、再度申請してください。'}
          </p>
          <CreatorApplicationForm userId={user.id} />
        </div>
      ) : (
        <CreatorApplicationForm userId={user.id} />
      )}
    </div>
  )
} 