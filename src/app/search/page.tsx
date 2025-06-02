import { Suspense } from 'react'
import { CreatorSearchContent } from '@/features/creator-search'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query } = await searchParams

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>読み込み中...</div>}>
        <CreatorSearchContent initialQuery={query} />
      </Suspense>
    </div>
  )
}