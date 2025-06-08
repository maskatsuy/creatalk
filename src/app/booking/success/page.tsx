import { Suspense } from 'react'
import { BookingSuccessContent } from './BookingSuccessContent'

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-muted-foreground">決済を確認しています...</p>
      </div>
    </div>}>
      <BookingSuccessContent />
    </Suspense>
  )
}

export const metadata = {
  title: '予約完了 - Creatalk',
  description: '通話予約が完了しました。'
}