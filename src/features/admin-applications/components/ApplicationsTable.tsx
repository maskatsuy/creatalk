import { Button } from '@/components/ui/button'
import { StatusBadge } from './StatusBadge'
import { formatDate, getCategoryLabel } from '../utils/formatters'
import type { Application } from '../types'

interface ApplicationsTableProps {
  applications: Application[]
  loading: boolean
  onViewDetail: (app: Application) => void
  onApprove: (app: Application) => void
  onReject: (app: Application) => void
}

export function ApplicationsTable({
  applications,
  loading,
  onViewDetail,
  onApprove,
  onReject
}: ApplicationsTableProps) {
  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-4 text-left">申請日時</th>
            <th className="p-4 text-left">表示名</th>
            <th className="p-4 text-left">メールアドレス</th>
            <th className="p-4 text-left">カテゴリー</th>
            <th className="p-4 text-left">ステータス</th>
            <th className="p-4 text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id} className="border-b">
              <td className="p-4">
                {formatDate(app.created_at)}
              </td>
              <td className="p-4 font-medium">{app.display_name}</td>
              <td className="p-4 text-sm text-muted-foreground">
                {app.profiles?.email || 'N/A'}
              </td>
              <td className="p-4">{getCategoryLabel(app.category)}</td>
              <td className="p-4"><StatusBadge status={app.status} /></td>
              <td className="p-4">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetail(app)}
                  >
                    詳細
                  </Button>
                  {app.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onApprove(app)}
                        disabled={loading}
                      >
                        承認
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onReject(app)}
                        disabled={loading}
                      >
                        却下
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}