'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useHeaderSearch } from '@/hooks/useHeaderSearch'

export function SearchBar() {
  const { searchQuery, setSearchQuery, handleSearch, handleKeyPress } = useHeaderSearch()

  return (
    <div className="hidden md:block">
      <form onSubmit={handleSearch} className="relative">
        <Input
          type="search"
          placeholder="クリエイターを探す"
          className="w-80 pr-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}