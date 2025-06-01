import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import type { Database } from '@/types/database'

export default async function HomePage() {
  const cookieStore = await cookies()
  const supabase = createServerClientWithCookies<Database>(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  // クリエイターロールを持っているか確認
  let isCreator = false
  if (user) {
    const { data: creatorRole } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', user.id)
      .eq('role_id', 'creator')
      .single()
    isCreator = !!creatorRole
  }

  // 申請中かどうかを確認
  let hasPendingApplication = false
  if (user) {
    const { data: pendingApplication } = await supabase
      .from('creator_applications')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()
    hasPendingApplication = !!pendingApplication
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Creatalk</h1>
      <div className="space-y-6">
        {!user ? (
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">クリエイターとファンをつなぐプラットフォーム</h2>
            <p className="text-zinc-600 mb-6">
              Creatalkは、クリエイターとファンを1対1のビデオ通話でつなぐプラットフォームです。
              より直接的で価値のある交流を実現します。
            </p>
            <Button asChild>
              <Link href="/login">ログインして始める</Link>
            </Button>
          </div>
        ) : isCreator ? (
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">クリエイターダッシュボード</h2>
            <Button asChild>
              <Link href="/creator/dashboard">ダッシュボードへ</Link>
            </Button>
          </div>
        ) : hasPendingApplication ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">クリエイター申請中</h2>
            <p className="text-yellow-700">
              あなたのクリエイター申請は現在審査中です。審査結果をお待ちください。
            </p>
          </div>
        ) : (
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">クリエイターになる</h2>
            <p className="text-zinc-600 mb-6">
              あなたのクリエイティブな活動をファンと直接共有しませんか？
              クリエイターとして登録して、ファンとの1対1のビデオ通話を始めましょう。
            </p>
            <Button asChild>
              <Link href="/creator/apply">クリエイターとして申請する</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
