import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Calendar, Clock } from 'lucide-react'
import { QueueParticipant } from '../types'

interface UserProfileDialogProps {
  participant: QueueParticipant | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserProfileDialog({ participant, open, onOpenChange }: UserProfileDialogProps) {
  if (!participant) return null

  const profile = participant.user_profile

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ユーザープロフィール</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* プロフィール画像と基本情報 */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-lg">
                {profile?.display_name 
                  ? profile.display_name.charAt(0).toUpperCase()
                  : <User className="h-8 w-8" />
                }
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {profile?.display_name || 'ユーザー名なし'}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Mail className="h-4 w-4" />
                {profile?.email || 'メールアドレス非公開'}
              </div>
            </div>
          </div>

          {/* ステータス */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">ステータス:</span>
            <Badge variant={
              participant.status === 'waiting' ? 'default' :
              participant.status === 'in_call' ? 'destructive' :
              'secondary'
            }>
              {participant.status === 'waiting' ? '予約中' :
               participant.status === 'in_call' ? '通話中' :
               '完了'}
            </Badge>
          </div>

          {/* 予約時間 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">予約日時:</span>
              <span>{new Date(participant.joined_at).toLocaleDateString('ja-JP')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className="font-medium">予約時刻:</span>
              <span>{new Date(participant.joined_at).toLocaleTimeString('ja-JP')}</span>
            </div>
          </div>

          {/* バイオ（もしプロフィールに含まれている場合） */}
          {profile?.bio && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">自己紹介</h4>
              <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                {profile.bio}
              </p>
            </div>
          )}

          {/* 参加回数（もしデータがある場合） */}
          {profile?.total_calls && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">過去の通話回数:</span>
              <Badge variant="outline">{profile.total_calls}回</Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}