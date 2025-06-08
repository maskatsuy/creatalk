import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { verifyPaymentSession } from '@/actions/stripe'
import { createBookingFromPayment } from '../actions'
import type { BookingData } from '../types'

export function useBookingVerification(sessionId: string | null) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState<BookingData | null>(null)

  useEffect(() => {
    const verifyAndCreateBooking = async () => {
      if (!sessionId) {
        setError('決済セッションIDが見つかりません')
        setLoading(false)
        return
      }

      try {
        // Verify payment with Stripe
        const verificationResult = await verifyPaymentSession(sessionId)
        
        if (!verificationResult.success || !verificationResult.metadata) {
          setError(verificationResult.error || '決済の確認に失敗しました')
          setLoading(false)
          return
        }

        // Create booking in database
        const bookingResult = await createBookingFromPayment({
          productId: verificationResult.metadata.productId,
          userId: verificationResult.metadata.userId,
          stripePaymentIntentId: verificationResult.paymentIntent,
          stripeSessionId: sessionId
        })

        if (bookingResult.error || !bookingResult.booking) {
          setError(bookingResult.error || '予約の作成に失敗しました')
          setLoading(false)
          return
        }

        setBookingData(bookingResult.booking as BookingData)
        toast.success('予約が完了しました！')
      } catch (error) {
        console.error('Booking creation error:', error)
        setError('予約の処理中にエラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    verifyAndCreateBooking()
  }, [sessionId])

  return { loading, error, bookingData }
}