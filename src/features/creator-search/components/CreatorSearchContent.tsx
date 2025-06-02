'use client'

import { useState, useEffect } from 'react'
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
import { getPopularCreators } from '../actions'
import { useCreatorSearch } from '../hooks'
import type { Creator } from '../types'

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
  const {
    // States
    query,
    setQuery,
    selectedCategory,
    sortBy,
    sortOrder,
    currentPage,
    searchResult,
    loading,
    hasSearched,
    
    // Handlers
    handleSearch,
    handleCategoryChange,
    handleSortChange,
    handleOrderChange,
    handlePageChange,
    performSearch
  } = useCreatorSearch({ initialQuery })

  const [popularCreators, setPopularCreators] = useState<Creator[]>([])

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 初期クエリがある場合は検索実行
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, '', 'created_at', 'desc', 1)
    }
  }, [initialQuery, performSearch])

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
              onKeyDown={handleKeyDown}
              className="pl-10"
            />
          </div>
          <Button onClick={() => handleSearch()} disabled={loading}>
            {loading ? '検索中...' : '検索'}
          </Button>
        </div>

        {/* フィルターとソート */}
        <div className="flex flex-col lg:flex-row gap-4">
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
          <div className="flex items-center gap-2 lg:ml-auto">
            <ArrowUpDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-500 whitespace-nowrap">並び順:</span>
            <Select 
              value={sortBy} 
              onValueChange={(value) => handleSortChange(value as typeof sortBy)}
            >
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
              className="whitespace-nowrap"
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