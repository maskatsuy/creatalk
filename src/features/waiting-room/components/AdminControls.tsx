import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'

interface AdminControlsProps {
  actionLoading: boolean
  onAddTestParticipant: () => void
}

export function AdminControls({ actionLoading, onAddTestParticipant }: AdminControlsProps) {
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={onAddTestParticipant}
        disabled={actionLoading}
        className="gap-2 pr-4"
      >
        テストユーザー追加
      </Button>
      <div className="absolute -top-2 -right-2">
        <Shield className="h-4 w-4 text-red-500 fill-red-500" />
      </div>
    </div>
  )
}