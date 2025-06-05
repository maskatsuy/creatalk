'use client'

import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { 
  useWaitingRoom, 
  useCallTimer, 
  useAutoStart, 
  useDeviceSettings,
  WaitingRoomHeader,
  AutoStartCountdown,
  CurrentCallCard,
  QueueList,
  NextParticipantCard,
  DeviceSettingsPanel,
  LoadingState,
  ErrorState
} from '@/features/waiting-room'

export default function WaitingRoomPage() {
  const params = useParams()
  const router = useRouter()
  const planId = params.planId as string
  const { isAdmin } = useAuth()
  
  // カスタムフックを使用
  const { status, loading, actionLoading, actions } = useWaitingRoom(planId)
  const { timeRemaining } = useCallTimer(status?.current_call, actions.endCall)
  const { autoStartCountdown, startCountdown, cancelCountdown } = useAutoStart(status?.queue || [], async (participant) => {
    const url = await actions.startCall(participant.id)
    if (url) {
      window.location.href = devices.buildCallUrl(url)
    }
  })
  const devices = useDeviceSettings()

  // 次の参加者を取得
  const nextParticipant = status?.queue.find(p => p.status === 'waiting')

  // ヘルパー関数
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getRemainingTime = () => {
    if (!status?.plan) return null
    
    const plan = status.plan as unknown as { end_time?: string }
    if (!plan.end_time) return null
    
    const now = new Date()
    const [hours, minutes] = plan.end_time.split(':').map(Number)
    const endTime = new Date()
    endTime.setHours(hours, minutes, 0, 0)
    
    if (endTime < now) {
      endTime.setDate(endTime.getDate() + 1)
    }
    
    const remaining = endTime.getTime() - now.getTime()
    if (remaining <= 0) return '終了時刻を過ぎています'
    
    const remainingHours = Math.floor(remaining / (1000 * 60 * 60))
    const remainingMinutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    
    if (remainingHours > 0) {
      return `終了まで${remainingHours}時間${remainingMinutes}分`
    } else if (remainingMinutes > 0) {
      return `終了まで${remainingMinutes}分`
    } else {
      return 'まもなく終了'
    }
  }

  // イベントハンドラー
  const handleStartCall = async (participantId: string) => {
    const url = await actions.startCall(participantId)
    if (url) {
      window.location.href = devices.buildCallUrl(url)
    }
  }

  const handleRejoinCall = async () => {
    const url = await actions.rejoinCall()
    if (url) {
      window.location.href = devices.buildCallUrl(url)
    }
  }

  const handleAutoStart = () => {
    startCountdown(5) // 5秒カウントダウン
  }

  // ローディングとエラー状態
  if (loading) {
    return <LoadingState />
  }

  if (!status) {
    return <ErrorState onBackToCallManagement={() => router.push('/creator/calls')} />
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <WaitingRoomHeader 
          status={status}
          onBackToCallManagement={() => router.push('/creator/calls')}
          formattedRemainingTime={getRemainingTime()}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6 flex flex-col">
            {/* Next participant - Order: Mobile=1, Desktop=3 */}
            {nextParticipant && (
              <div className="order-1 lg:order-3">
                <NextParticipantCard
                  participant={nextParticipant}
                  actionLoading={actionLoading}
                  onStartCall={handleStartCall}
                  onAutoStart={handleAutoStart}
                />
              </div>
            )}
            
            {/* Device Settings - Order: Mobile=2, Desktop=hidden (shown in right column) */}
            <div className="order-2 lg:hidden">
              <DeviceSettingsPanel 
                deviceSettings={devices.deviceSettings}
                onUpdateSetting={devices.updateSetting}
              />
            </div>
            
            {/* AutoStart - Order: Mobile=3, Desktop=1 */}
            <div className="order-3 lg:order-1">
              <AutoStartCountdown 
                countdown={autoStartCountdown}
                onCancel={cancelCountdown}
              />
            </div>
            
            {/* Current Call - Order: Mobile=4, Desktop=2 */}
            <div className="order-4 lg:order-2">
              <CurrentCallCard 
                currentCall={status.current_call}
                timeRemaining={timeRemaining}
                actionLoading={actionLoading}
                onEndCall={actions.endCall}
                onRejoinCall={handleRejoinCall}
                formatTime={formatTime}
              />
            </div>
            
            {/* Queue List - Order: Mobile=5, Desktop=4 */}
            <div className="order-5 lg:order-4">
              <QueueList 
                queue={status.queue}
                nextParticipant={nextParticipant}
                isAdmin={isAdmin}
                actionLoading={actionLoading}
                onAddTestParticipant={actions.addTestParticipant}
              />
            </div>
          </div>

          {/* Desktop: Device settings on the right */}
          <div className="hidden lg:block space-y-6">
            <DeviceSettingsPanel 
              deviceSettings={devices.deviceSettings}
              onUpdateSetting={devices.updateSetting}
            />
          </div>
        </div>
      </div>
    </div>
  )
}