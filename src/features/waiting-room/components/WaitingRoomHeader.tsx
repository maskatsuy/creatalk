import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WaitingRoomStatus } from '../types'

interface WaitingRoomHeaderProps {
  status: WaitingRoomStatus
  onBackToCallManagement: () => void
  formattedRemainingTime?: string | null
}

export function WaitingRoomHeader({ 
  status, 
  onBackToCallManagement, 
  formattedRemainingTime 
}: WaitingRoomHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{status.plan.title} - 待機室</h1>
          <p className="text-muted-foreground">
            1回{status.plan.duration_minutes}分 • 残り{status.plan.remaining_slots}枠
          </p>
        </div>
        <div className="flex items-center gap-4">
          {status.creator_status === 'in_call' && (
            <Badge variant="destructive">通話中</Badge>
          )}
          {formattedRemainingTime && (
            <Badge variant="outline">{formattedRemainingTime}</Badge>
          )}
          <Button 
            variant="outline"
            onClick={onBackToCallManagement}
          >
            通話管理に戻る
          </Button>
        </div>
      </div>
    </div>
  )
}