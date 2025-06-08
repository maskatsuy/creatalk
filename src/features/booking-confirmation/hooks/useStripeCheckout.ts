import { useState } from 'react'
import { toast } from 'sonner'
import { loadStripe } from '@stripe/stripe-js'
import { createCheckoutSession } from '@/actions/stripe'
import type { CheckoutParams } from '../types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async (params: CheckoutParams) => {
    setLoading(true)
    try {
      const result = await createCheckoutSession(params)

      if (result.error) {
        toast.error(result.error)
        return false
      }

      if (result.sessionId) {
        const stripe = await stripePromise
        if (!stripe) {
          toast.error('決済システムの初期化に失敗しました')
          return false
        }

        const { error } = await stripe.redirectToCheckout({
          sessionId: result.sessionId
        })

        if (error) {
          toast.error(error.message || '決済画面への遷移に失敗しました')
          return false
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('エラーが発生しました')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { handleCheckout, loading }
}