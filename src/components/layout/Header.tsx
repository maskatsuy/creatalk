'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Search, Settings, CreditCard, LogOut, Video, UserPlus, Heart, ChevronRight, Shield, Users, Star, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useAuthContext } from '@/features/auth'

export function Header() {
  const { user, signOut, isAdmin, isCreator } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  
  const isSearchPage = pathname === '/search'

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/search')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e)
    }
  }

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
            />
          </Link>
          
          {!isSearchPage && (
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
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar>
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {/* ユーザー情報ヘッダー */}
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="w-full cursor-pointer flex items-center space-x-3 px-2 py-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {(isCreator || isAdmin) && (
                        <div className="absolute -bottom-0.5 -right-0.5 flex gap-0.5">
                          {isCreator && (
                            <div className="h-3 w-3 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-600">
                              <Star className="h-2 w-2 text-yellow-500 fill-yellow-500" />
                            </div>
                          )}
                          {isAdmin && (
                            <div className="h-3 w-3 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-600">
                              <Shield className="h-2 w-2 text-red-500 fill-red-500" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-1 min-w-0 flex-1">
                      <p className="text-sm font-medium leading-none truncate">
                        {user.user_metadata?.full_name || user.user_metadata?.name || 'ユーザー名未設定'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                
                {/* 一般ユーザー機能 */}
                <DropdownMenuItem asChild>
                  <Link href="/my-bookings" className="w-full cursor-pointer">
                    <Video className="mr-2 h-4 w-4" />
                    予約済み通話
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href="/following" className="w-full cursor-pointer">
                    <Heart className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">フォロー中のクリエイター</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href="/billing" className="w-full cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    支払い履歴
                  </Link>
                </DropdownMenuItem>
                
                {/* クリエイター申請（クリエイターでない場合のみ） */}
                {!isCreator && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/creator/apply" className="w-full cursor-pointer">
                        <UserPlus className="mr-2 h-4 w-4" />
                        クリエイター申請
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                {/* クリエイター専用機能 */}
                {isCreator && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                      クリエイター機能
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/creator/dashboard" className="w-full cursor-pointer">
                        <BarChart3 className="mr-2 h-4 w-4 text-yellow-500" />
                        ダッシュボード
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/creator/calls" className="w-full cursor-pointer">
                        <Video className="mr-2 h-4 w-4 text-yellow-500" />
                        通話管理
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/creator/analytics" className="w-full cursor-pointer">
                        <BarChart3 className="mr-2 h-4 w-4 text-yellow-500" />
                        分析
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                {/* 管理者専用機能 */}
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                      管理者機能
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/applications" className="w-full cursor-pointer">
                        <Shield className="mr-2 h-4 w-4 text-red-500" />
                        クリエイター申請管理
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/users" className="w-full cursor-pointer">
                        <Users className="mr-2 h-4 w-4 text-red-500" />
                        ユーザー管理
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                {/* 設定とログアウト */}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    設定
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={signOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">ログイン</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
} 