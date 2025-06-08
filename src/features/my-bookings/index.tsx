'use client'

import { MyBookingsLayout } from './components/MyBookingsLayout'

interface MyBookingsFeatureProps {
  userId: string
}

export function MyBookingsFeature({ userId }: MyBookingsFeatureProps) {
  return <MyBookingsLayout userId={userId} />
}