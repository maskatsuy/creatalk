import { useState, useEffect } from 'react'
import { getUserBookings } from '../actions'
import type { UserBooking, BookingFilter } from '../types'

export function useMyBookings(userId: string) {
  const [bookings, setBookings] = useState<UserBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<BookingFilter>('active')

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
    
    if (filter === 'active') {
      // Check if the booking should still be considered active based on time
      const now = new Date()
      
      // For queue type bookings
      if (booking.type === 'queue' && booking.product.slot_date && booking.product.start_time) {
        const endTime = new Date(`${booking.product.slot_date}T${booking.product.start_time}`)
        endTime.setMinutes(endTime.getMinutes() + booking.product.duration_minutes)
        
        // If the end time has passed and status is still 'waiting', it should not be shown as active
        if (endTime < now && booking.status === 'waiting') {
          return false
        }
      }
      
      // For fixed type bookings
      if (booking.type === 'fixed' && booking.bookingDate && booking.startTime) {
        const endTime = new Date(`${booking.bookingDate}T${booking.startTime}`)
        endTime.setMinutes(endTime.getMinutes() + booking.product.duration_minutes)
        
        // If the end time has passed and status is still 'confirmed', it should not be shown as active
        if (endTime < now && booking.status === 'confirmed') {
          return false
        }
      }
      
      return ['waiting', 'confirmed', 'in_progress', 'in_call'].includes(booking.status)
    }
    
    if (filter === 'completed') {
      // Include time-expired bookings in completed
      const now = new Date()
      
      if (booking.status === 'completed') return true
      
      // Check if booking should be considered completed based on time
      if (booking.type === 'queue' && booking.product.slot_date && booking.product.start_time) {
        const endTime = new Date(`${booking.product.slot_date}T${booking.product.start_time}`)
        endTime.setMinutes(endTime.getMinutes() + booking.product.duration_minutes)
        
        if (endTime < now && booking.status === 'waiting') {
          return true
        }
      }
      
      if (booking.type === 'fixed' && booking.bookingDate && booking.startTime) {
        const endTime = new Date(`${booking.bookingDate}T${booking.startTime}`)
        endTime.setMinutes(endTime.getMinutes() + booking.product.duration_minutes)
        
        if (endTime < now && booking.status === 'confirmed') {
          return true
        }
      }
      
      return false
    }
    
    if (filter === 'cancelled') {
      return booking.status === 'cancelled'
    }
    
    return true
  })

  return {
    bookings: filteredBookings,
    allBookings: bookings, // Return unfiltered bookings for stats
    loading,
    error,
    filter,
    setFilter
  }
}