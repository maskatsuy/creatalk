import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import { CreatorDashboardLayout } from '@/features/creator-dashboard'

async function CreatorDashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClientWithCookies(cookieStore)
  
  // Check authentication
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/login')
  }

  // Check if user is a creator
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', user.id)

  const isCreator = userRoles?.some(role => role.role_id === 'creator')
  if (!isCreator) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      }>
        <CreatorDashboardLayout />
      </Suspense>
    </div>
  )
}

export default CreatorDashboardPage