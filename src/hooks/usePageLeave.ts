'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function usePageLeave(callback: () => void) {
  const pathname = usePathname()
  const previousPathnameRef = useRef(pathname)
  const callbackRef = useRef(callback)

  // callbackを最新に保つ
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    // パスが変わった場合のクリーンアップ
    if (previousPathnameRef.current !== pathname) {
      console.log('Path changed from', previousPathnameRef.current, 'to', pathname)
      callbackRef.current()
      previousPathnameRef.current = pathname
    }
  }, [pathname])

  useEffect(() => {
    // ブラウザイベントでのクリーンアップ
    const handleBeforeUnload = () => {
      console.log('beforeunload triggered')
      callbackRef.current()
    }

    const handlePageHide = () => {
      console.log('pagehide triggered')
      callbackRef.current()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('page hidden')
        callbackRef.current()
      }
    }

    // フォーカス離脱時もクリーンアップ
    const handleBlur = () => {
      console.log('window blur')
      callbackRef.current()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  // コンポーネントのアンマウント時もクリーンアップ
  useEffect(() => {
    return () => {
      console.log('Component unmounting')
      callbackRef.current()
    }
  }, [])
}