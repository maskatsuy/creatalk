import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'pending':
      return <Badge variant="outline">審査待ち</Badge>
    case 'approved':
      return <Badge variant="default" className="bg-green-600">承認済み</Badge>
    case 'rejected':
      return <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50">却下</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}