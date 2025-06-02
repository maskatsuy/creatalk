'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, ArrowUpDown } from 'lucide-react'
import { CreatorCard } from './CreatorCard'
import { Pagination } from './Pagination'
import { searchCreators, getPopularCreators } from '../actions'
import type { Creator, CreatorSearchResult } from '../types'

interface CreatorSearchContentProps {
  initialQuery?: string
}

const categories = [
  { value: '', label: 'すべて' },
  { value: 'gaming', label: 'ゲーミング' },
  { value: 'education', label: '教育' },
  { value: 'entertainment', label: 'エンターテイメント' },
  { value: 'consulting', label: 'コンサルティング' },
  { value: 'art', label: 'アート' },
  { value: 'music', label: '音楽' },
  { value: 'lifestyle', label: 'ライフスタイル' },
  { value: 'tech', label: 'テック' },
  { value: 'other', label: 'その他' }
]

export function CreatorSearchContent({ initialQuery }: CreatorSearchContentProps) {
  const router = useRouter()
  
  const [query, setQuery] = useState(initialQuery || '')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState<'followers' | 'created_at' | 'last_call'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchResult, setSearchResult] = useState<CreatorSearchResult>({
    creators: [],
    total: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [popularCreators, setPopularCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(!!initialQuery)

  // initialQueryが変更されたときにqueryを更新
  useEffect(() => {
    setQuery(initialQuery || '')
  }, [initialQuery])

  // 人気クリエイターを初期読み込み
  useEffect(() => {
    const loadPopularCreators = async () => {
      const result = await getPopularCreators()
      if (!result.error) {
        setPopularCreators(result.creators)
      }
    }

    loadPopularCreators()
  }, [])

  const performSearch = useCallback(async (
    searchQuery?: string, 
    category?: string, 
    sort?: typeof sortBy, 
    order?: typeof sortOrder, 
    page?: number
  ) => {
    const queryToSearch = searchQuery || query
    const categoryToUse = category || selectedCategory
    const sortToUse = sort || sortBy
    const orderToUse = order || sortOrder
    const pageToUse = page || currentPage

    if (!queryToSearch.trim() && !categoryToUse) {
      setHasSearched(false)
      setSearchResult({
        creators: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false
      })
      return
    }

    setLoading(true)
    setHasSearched(true)

    try {
      const result = await searchCreators({
        query: queryToSearch.trim() || undefined,
        category: categoryToUse || undefined,
        sortBy: sortToUse,
        sortOrder: orderToUse,
        page: pageToUse,
        limit: 12
      })

      setSearchResult(result)
      setCurrentPage(pageToUse)

      // URLを更新
      const params = new URLSearchParams()
      if (queryToSearch.trim()) {
        params.set('q', queryToSearch.trim())
      }
      if (categoryToUse) {
        params.set('category', categoryToUse)
      }
      if (sortToUse !== 'created_at') {
        params.set('sort', sortToUse)
      }
      if (orderToUse !== 'desc') {
        params.set('order', orderToUse)
      }
      if (pageToUse > 1) {
        params.set('page', pageToUse.toString())
      }
      
      const newUrl = params.toString() ? `/search?${params.toString()}` : '/search'
      router.replace(newUrl)

    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [router, currentPage, query, selectedCategory, sortBy, sortOrder])

  const handleSearch = async (searchQuery?: string) => {
    await performSearch(searchQuery, selectedCategory, sortBy, sortOrder, 1)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
    setTimeout(() => performSearch(query, category, sortBy, sortOrder, 1), 0)
  }

  const handleSortChange = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy)
    setCurrentPage(1)
    setTimeout(() => performSearch(query, selectedCategory, newSortBy, sortOrder, 1), 0)
  }

  const handleOrderChange = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc'
    setSortOrder(newOrder)
    setCurrentPage(1)
    setTimeout(() => performSearch(query, selectedCategory, sortBy, newOrder, 1), 0)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    performSearch(query, selectedCategory, sortBy, sortOrder, page)
  }

  // 初期クエリがある場合は検索実行
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, selectedCategory, sortBy, sortOrder, 1)
    }
  }, [initialQuery, selectedCategory, sortBy, sortOrder, performSearch])

  return (
    <div className="max-w-6xl mx-auto">
      {/* 検索ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          クリエイター検索
        </h1>
        
        {/* 検索バー */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="クリエイター名を入力..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={() => handleSearch()} disabled={loading}>
            {loading ? '検索中...' : '検索'}
          </Button>
        </div>

        {/* フィルターとソート */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* カテゴリーフィルター */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500 mr-2">カテゴリー:</span>
            {categories.map((category) => (
              <Badge
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleCategoryChange(category.value)}
              >
                {category.label}
              </Badge>
            ))}
          </div>

          {/* ソートオプション */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">並び順:</span>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">登録日時</SelectItem>
                <SelectItem value="followers">フォロワー数</SelectItem>
                <SelectItem value="last_call">最新通話</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOrderChange}
              className="min-w-16"
            >
              {sortOrder === 'desc' ? '降順' : '昇順'}
            </Button>
          </div>
        </div>
      </div>

      {/* 検索結果 */}
      {hasSearched && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              検索結果
            </h2>
            <div className="text-sm text-gray-500">
              {searchResult.total}件中 {((currentPage - 1) * 12 + 1).toLocaleString()}-{Math.min(currentPage * 12, searchResult.total).toLocaleString()}件を表示
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg h-48 animate-pulse" />
              ))}
            </div>
          ) : searchResult.creators.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {searchResult.creators.map((creator) => (
                  <CreatorCard key={creator.id} creator={creator} />
                ))}
              </div>
              
              {/* ページネーション */}
              <Pagination
                currentPage={searchResult.currentPage}
                totalPages={searchResult.totalPages}
                hasNextPage={searchResult.hasNextPage}
                hasPrevPage={searchResult.hasPrevPage}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                条件に一致するクリエイターが見つかりませんでした
              </p>
            </div>
          )}
        </div>
      )}

      {/* 人気クリエイター */}
      {!hasSearched && popularCreators.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            人気のクリエイター
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCreators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}