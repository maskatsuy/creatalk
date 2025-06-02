import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getCategoryLabel } from '../utils/formatters'
import type { Application } from '../types'

interface ApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: Application | null
  onApprove: () => void
  loading: boolean
}

export function ApprovalDialog({
  open,
  onOpenChange,
  application,
  onApprove,
  loading
}: ApprovalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>申請を承認</DialogTitle>
          <DialogDescription>
            {application?.display_name}さんの申請を承認しますか？
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              承認すると、このユーザーにクリエイターロールが付与され、
              クリエイター向けの機能が利用可能になります。
            </p>
          </div>
          {application && (
            <div className="space-y-2">
              <p className="text-sm"><span className="font-medium">表示名:</span> {application.display_name}</p>
              <p className="text-sm"><span className="font-medium">カテゴリー:</span> {getCategoryLabel(application.category)}</p>
              <p className="text-sm"><span className="font-medium">メール:</span> {application.profiles?.email}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button
            variant="default"
            onClick={onApprove}
            disabled={loading}
          >
            承認する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}