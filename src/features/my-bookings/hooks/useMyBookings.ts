import { useState, useEffect } from 'react'
import { getUserBookings } from '../actions'
import type { UserBooking, BookingFilter } from '../types'

export function useMyBookings(userId: string) {
  const [bookings, setBookings] = useState<UserBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<BookingFilter>('all')

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true)
      console.log('[useMyBookings] Fetching bookings for user:', userId)
      
      try {
        const result = await getUserBookings(userId)
        console.log('[useMyBookings] Result:', result)
        
        if (!result) {
          console.error('[useMyBookings] No result returned from getUserBookings')
          setError('データの取得に失敗しました')
          setLoading(false)
          return
        }
        
        if (result.error) {
          setError(result.error)
        } else {
          setBookings(result.bookings || [])
        }
      } catch (err) {
        console.error('[useMyBookings] Error:', err)
        setError('予約の取得中にエラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [userId])

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true
    
    if (filter === 'upcoming') {
      return ['waiting', 'confirmed'].includes(booking.status)
    }
    
    if (filter === 'completed') {
      return ['completed', 'cancelled'].includes(booking.status)
    }
    
    return true
  })

  return {
    bookings: filteredBookings,
    loading,
    error,
    filter,
    setFilter
  }
}