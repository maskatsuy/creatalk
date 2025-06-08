'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function useHeaderSearch() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/search')
    }
  }, [searchQuery, router])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e)
    }
  }, [handleSearch])

  return {
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleKeyPress
  }
}