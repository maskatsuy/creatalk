import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClientWithCookies } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'
import { BookingConfirmationLayout } from '@/features/booking-confirmation'

interface BookingPageProps {
  params: Promise<{
    productId: string
  }>
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { productId } = await params
  const cookieStore = await cookies()
  const supabase = createServerClientWithCookies(cookieStore)
  const user = await getUser(cookieStore)

  if (!user) {
    return notFound()
  }

  // Get product details
  const { data: product, error } = await supabase
    .from('call_products')
    .select('*')
    .eq('id', productId)
    .eq('status', 'active')
    .single()

  if (error || !product) {
    console.error('Product fetch error:', error)
    notFound()
  }

  // Get creator info separately
  const { data: creatorInfo } = await supabase
    .from('creator_applications')
    .select('display_name, bio, profile_image_url')
    .eq('user_id', product.creator_id)
    .eq('status', 'approved')
    .single()

  // Transform data to match expected types
  const productWithCreator = {
    ...product,
    creator_profile: creatorInfo || null
  }

  return <BookingConfirmationLayout product={productWithCreator} user={user} />
}

export async function generateMetadata({ params }: BookingPageProps) {
  const { productId } = await params
  const cookieStore = await cookies()
  const supabase = createServerClientWithCookies(cookieStore)
  
  const { data: product } = await supabase
    .from('call_products')
    .select('title, description')
    .eq('id', productId)
    .single()

  if (!product) {
    return {
      title: '予約内容の確認'
    }
  }

  return {
    title: `${product.title} - 予約確認`,
    description: product.description || `${product.title}の予約内容を確認します。`
  }
}