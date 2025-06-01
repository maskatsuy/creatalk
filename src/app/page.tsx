import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/auth/LogoutButton'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export default async function Home() {
  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-sans">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-heading font-bold">
          ようこそ、{user.email}さん
        </h1>
        <div className="flex flex-col gap-4">
          <p>
            このページはログイン済みユーザーのみアクセスできます。
          </p>
          <LogoutButton />
        </div>
      </main>
    </div>
  )
}
