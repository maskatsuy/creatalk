import { cookies } from 'next/headers'
import { getUser } from '@/lib/auth'
import CallFeedFeature from '@/features/call-feed'
import LandingPage from './LandingPage'

export default async function HomePage() {
  const cookieStore = await cookies()
  const user = await getUser(cookieStore)

  // ログイン済みユーザーにはコールフィード、未ログインユーザーにはランディングページを表示
  if (user) {
    return <CallFeedFeature />
  } else {
    return <LandingPage />
  }
}
