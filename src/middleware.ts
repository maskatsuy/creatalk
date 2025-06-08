import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 認証が不要なパス
const publicPaths = ['/', '/login', '/signup', '/auth/callback']
// APIパス
const apiPaths = ['/api']

export async function middleware(request: NextRequest) {
  console.log('[Middleware] Path:', request.nextUrl.pathname)
  // APIパスはスキップ
  if (apiPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    console.log('[Middleware] Skipping API path')
    return NextResponse.next()
  }

  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete({ name, ...options })
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname === path)
  
  console.log('[Middleware] User:', user ? user.id : null)
  console.log('[Middleware] Is Public Path:', isPublicPath)
  
  // 認証セッションがない場合のエラーは通常の動作なのでログを出さない
  if (error && error.message !== 'Auth session missing!') {
    console.log('[Middleware] Error:', error)
  }

  // 認証が必要なパスで未ログインの場合
  if (!isPublicPath && (!user || error)) {
    console.log('[Middleware] Redirecting to login (auth required, not logged in)')
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 認証ページ（login/signup）でログイン済みの場合のみリダイレクト
  const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup'
  if (isAuthPage && user) {
    console.log('[Middleware] Redirecting to / (auth page, logged in)')
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  console.log('[Middleware] Continuing to next response')
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
} 