'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuthContext } from '@/features/auth'
import { SearchBar } from './SearchBar'
import { UserMenu } from './UserMenu'

export function Header() {
  const { user, signOut, isAdmin, isCreator } = useAuthContext()
  const pathname = usePathname()
  
  const isSearchPage = pathname === '/search'
  const isAuthPage = pathname === '/login' || pathname === '/signup'

  return (
    <header className="border-b">
      <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Creatalk"
              width={240}
              height={60}
              className="h-14"
              unoptimized
            />
          </Link>
          
          {!isSearchPage && !isAuthPage && user && <SearchBar />}
        </div>

        <div className="flex items-center gap-4">
          <UserMenu 
            user={user} 
            isAdmin={isAdmin} 
            isCreator={isCreator} 
            signOut={signOut}
            isAuthPage={isAuthPage}
          />
        </div>
      </div>
    </header>
  )
} 