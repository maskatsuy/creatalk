'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { searchCreators } from '../actions'
import type { CreatorSearchResult } from '../types'

interface UseCreatorSearchOptions {
  initialQuery?: string
}

export function useCreatorSearch({ initialQuery }: UseCreatorSearchOptions = {}) {
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
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const performSearch = useCallback(async (
    searchQuery: string, 
    category: string, 
    sort: typeof sortBy, 
    order: typeof sortOrder, 
    page: number
  ) => {
    if (!searchQuery.trim() && !category) {
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
        query: searchQuery.trim() || undefined,
        category: category || undefined,
        sortBy: sort,
        sortOrder: order,
        page: page,
        limit: 12
      })

      setSearchResult(result)
      setCurrentPage(page)

      // URLを更新
      const params = new URLSearchParams()
      if (searchQuery.trim()) {
        params.set('q', searchQuery.trim())
      }
      if (category) {
        params.set('category', category)
      }
      if (sort !== 'created_at') {
        params.set('sort', sort)
      }
      if (order !== 'desc') {
        params.set('order', order)
      }
      if (page > 1) {
        params.set('page', page.toString())
      }
      
      const newUrl = params.toString() ? `/search?${params.toString()}` : '/search'
      router.replace(newUrl)

    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleSearch = useCallback(async (searchQuery?: string) => {
    const queryToUse = searchQuery !== undefined ? searchQuery : query
    await performSearch(queryToUse, selectedCategory, sortBy, sortOrder, 1)
  }, [query, selectedCategory, sortBy, sortOrder, performSearch])

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
    performSearch(query, category, sortBy, sortOrder, 1)
  }, [query, sortBy, sortOrder, performSearch])

  const handleSortChange = useCallback((newSortBy: typeof sortBy) => {
    setSortBy(newSortBy)
    setCurrentPage(1)
    performSearch(query, selectedCategory, newSortBy, sortOrder, 1)
  }, [query, selectedCategory, sortOrder, performSearch])

  const handleOrderChange = useCallback(() => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc'
    setSortOrder(newOrder)
    setCurrentPage(1)
    performSearch(query, selectedCategory, sortBy, newOrder, 1)
  }, [query, selectedCategory, sortBy, sortOrder, performSearch])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    if (hasSearched) {
      performSearch(query, selectedCategory, sortBy, sortOrder, page)
    }
  }, [query, selectedCategory, sortBy, sortOrder, hasSearched, performSearch])

  return {
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
  }
}