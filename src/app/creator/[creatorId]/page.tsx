import { notFound } from 'next/navigation'
import { CreatorProfileLayout } from '@/features/creator-profile'
import { getCreatorProfile } from '@/features/creator-profile/actions'

interface CreatorProfilePageProps {
  params: Promise<{
    creatorId: string
  }>
}

export default async function CreatorProfilePage({ params }: CreatorProfilePageProps) {
  const { creatorId } = await params
  const result = await getCreatorProfile(creatorId)
  
  if (result.error || !result.creator) {
    notFound()
  }

  return <CreatorProfileLayout creator={result.creator} />
}

export async function generateMetadata({ params }: CreatorProfilePageProps) {
  const { creatorId } = await params
  const result = await getCreatorProfile(creatorId)
  
  if (result.error || !result.creator) {
    return {
      title: 'クリエイターが見つかりません'
    }
  }

  const { creator } = result
  
  return {
    title: `${creator.display_name} - クリエイタープロフィール`,
    description: creator.bio || `${creator.display_name}のプロフィールページ。${creator.category}の専門家として活動中。`,
    openGraph: {
      title: creator.display_name,
      description: creator.bio,
      type: 'profile',
    }
  }
}