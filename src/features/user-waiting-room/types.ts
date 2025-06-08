export interface QueueStatus {
  planId: string
  planTitle: string
  planDuration: number // 通話時間（分）
  creatorName: string
  myPosition: number
  totalWaiting: number
  estimatedWaitTime: number | null
  isMyTurn: boolean
  currentCall?: {
    participantPosition: number
    endsAt: string
  }
  callRoom?: { // 自分の番の時の通話ルーム情報
    url: string
    token: string
  }
}

export interface CallPlan {
  id: string
  title: string
  duration_minutes: number
  creator: {
    display_name: string
    profile_image_url?: string | null
  }
}