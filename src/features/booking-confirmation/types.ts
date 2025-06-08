export interface BookingData {
  id: string
  type: 'queue' | 'fixed'
  product: {
    id: string
    title: string
    duration_minutes: number
    type: string
  }
  creator: {
    display_name: string
  }
  amount: number
  status: string
}

export interface CheckoutParams {
  productId: string
  userId: string
  successUrl: string
  cancelUrl: string
}