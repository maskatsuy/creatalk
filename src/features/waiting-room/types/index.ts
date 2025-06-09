export interface QueueParticipant {
  id: string
  user_id: string
  position: number
  status: 'waiting' | 'in_call' | 'completed'
  joined_at: string
  call_ended_at?: string | null
  profiles?: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  } | null
  user_profile?: {
    display_name: string | null
    avatar_url: string | null
    email?: string
    bio?: string | null
    total_calls?: number
  }
}

export interface WaitingRoomPlan {
  id: string
  title: string
  duration_minutes: number
  remaining_slots: number
  max_participants: number
}

export interface CurrentCall {
  id: string
  participant: QueueParticipant
  started_at: string
  ends_at: string
}

export interface WaitingRoomStatus {
  plan: WaitingRoomPlan
  queue: QueueParticipant[]
  creator_status: 'offline' | 'waiting' | 'in_call' | 'break'
  current_call?: CurrentCall | null
}

export interface DeviceSettings {
  videoEnabled: boolean
  audioEnabled: boolean
  selectedVideoDevice: string
  selectedAudioDevice: string
}

export type WaitingRoomActions = {
  startCall: (participantId: string) => Promise<string | undefined>
  endCall: () => Promise<void>
  rejoinCall: () => Promise<string | undefined>
  addTestParticipant: () => Promise<void>
  refreshStatus: () => Promise<void>
}