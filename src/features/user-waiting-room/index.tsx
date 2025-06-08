'use client'

import { UserWaitingRoomLayout } from './components/UserWaitingRoomLayout'

interface UserWaitingRoomFeatureProps {
  planId: string
  userId: string
}

export function UserWaitingRoomFeature({ planId, userId }: UserWaitingRoomFeatureProps) {
  return <UserWaitingRoomLayout planId={planId} userId={userId} />
}