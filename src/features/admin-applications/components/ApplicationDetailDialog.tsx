import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StatusBadge } from './StatusBadge'
import { formatDate, getCategoryLabel } from '../utils/formatters'
import type { Application } from '../types'

interface ApplicationDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: Application | null
}

export function ApplicationDetailDialog({
  open,
  onOpenChange,
  application
}: ApplicationDetailDialogProps) {
  if (!application) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>申請詳細</DialogTitle>
          <DialogDescription>
            クリエイター申請の詳細情報
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">申請日時</p>
              <p className="mt-1">{formatDate(application.created_at)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">ステータス</p>
              <div className="mt-1">
                <StatusBadge status={application.status} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">表示名</p>
              <p className="mt-1">{application.display_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">メールアドレス</p>
              <p className="mt-1">{application.profiles?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">カテゴリー</p>
              <p className="mt-1">{getCategoryLabel(application.category)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">自己紹介</p>
            <p className="mt-1 whitespace-pre-wrap">{application.bio}</p>
          </div>

          {application.content_plan && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">コンテンツ計画</p>
              <p className="mt-1 whitespace-pre-wrap">{application.content_plan}</p>
            </div>
          )}

          {application.pricing_plan && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">料金プラン</p>
              <p className="mt-1">{application.pricing_plan}</p>
            </div>
          )}

          {application.social_twitter && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">X (Twitter)</p>
              <p className="mt-1">@{application.social_twitter}</p>
            </div>
          )}

          {application.social_instagram && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Instagram</p>
              <p className="mt-1">@{application.social_instagram}</p>
            </div>
          )}

          {application.social_youtube && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">YouTube</p>
              <p className="mt-1">@{application.social_youtube}</p>
            </div>
          )}

          {application.portfolio_url && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">ポートフォリオ</p>
              <a 
                href={application.portfolio_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-1 text-blue-600 hover:underline"
              >
                {application.portfolio_url}
              </a>
            </div>
          )}

          {application.status === 'rejected' && application.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800">却下理由</p>
              <p className="mt-1 text-sm text-red-700">{application.rejection_reason}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}