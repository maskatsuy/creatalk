import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Play, User } from 'lucide-react'
import { QueueParticipant } from '../types'
import { UserProfileDialog } from './UserProfileDialog'

interface NextParticipantCardProps {
  participant: QueueParticipant
  actionLoading: boolean
  onStartCall: (participantId: string) => void
  onAutoStart: () => void
}

export function NextParticipantCard({ 
  participant, 
  actionLoading, 
  onStartCall, 
  onAutoStart 
}: NextParticipantCardProps) {
  const [showProfile, setShowProfile] = useState(false)
  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Play className="h-5 w-5" />
            次の通話予約
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onStartCall(participant.id)}
              disabled={actionLoading}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              通話開始
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onAutoStart}
              disabled={actionLoading}
            >
              5秒後に開始
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={participant.user_profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-blue-200 dark:bg-blue-700 text-blue-700 dark:text-blue-300">
              {participant.user_profile?.display_name 
                ? participant.user_profile.display_name.charAt(0).toUpperCase()
                : <User className="h-5 w-5" />
              }
            </AvatarFallback>
          </Avatar>
          <div>
            <button
              onClick={() => setShowProfile(true)}
              className="font-medium text-blue-900 dark:text-blue-100 hover:underline cursor-pointer text-left"
            >
              {participant.user_profile?.display_name || participant.user_profile?.email || 'ユーザー1'}
            </button>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {new Date(participant.joined_at).toLocaleTimeString('ja-JP')}
            </p>
          </div>
        </div>
      </CardContent>
      
      <UserProfileDialog
        participant={participant}
        open={showProfile}
        onOpenChange={setShowProfile}
      />
    </Card>
  )
}