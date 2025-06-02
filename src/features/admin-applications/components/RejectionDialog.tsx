import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Application } from '../types'

interface RejectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: Application | null
  rejectReason: string
  onRejectReasonChange: (reason: string) => void
  onReject: () => void
  loading: boolean
}

export function RejectionDialog({
  open,
  onOpenChange,
  application,
  rejectReason,
  onRejectReasonChange,
  onReject,
  loading
}: RejectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open)
      if (!open) onRejectReasonChange('')
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>申請を却下</DialogTitle>
          <DialogDescription>
            {application?.display_name}さんの申請を却下します。
            却下理由を入力してください。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">却下理由</Label>
            <Textarea
              id="reason"
              value={rejectReason}
              onChange={(e) => onRejectReasonChange(e.target.value)}
              placeholder="却下理由を入力..."
              className="mt-2"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={onReject}
            disabled={loading || !rejectReason.trim()}
          >
            却下
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}