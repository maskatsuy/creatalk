import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, User } from 'lucide-react'
import { QueueParticipant } from '../types'
import { AdminControls } from './AdminControls'
import { UserProfileDialog } from './UserProfileDialog'

interface QueueListProps {
  queue: QueueParticipant[]
  nextParticipant?: QueueParticipant
  isAdmin: boolean
  actionLoading: boolean
  onAddTestParticipant: () => void
}

export function QueueList({ 
  queue, 
  nextParticipant,
  isAdmin, 
  actionLoading,
  onAddTestParticipant
}: QueueListProps) {
  const [selectedParticipant, setSelectedParticipant] = useState<QueueParticipant | null>(null)
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            通話予約 ({queue.length}人)
          </CardTitle>
          <div className="flex gap-2">
            {isAdmin && (
              <AdminControls
                actionLoading={actionLoading}
                onAddTestParticipant={onAddTestParticipant}
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {queue.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            予約中の参加者はいません
          </p>
        ) : (
          <div className="space-y-2">
            {queue.map((participant, index) => {
              const isNext = participant.id === nextParticipant?.id
              return (
                <div 
                  key={participant.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isNext ? 'bg-blue-100 dark:bg-blue-800/40 border-2 border-blue-300 dark:border-blue-600' :
                    participant.status === 'waiting' ? 'bg-gray-50 dark:bg-gray-800' :
                    participant.status === 'in_call' ? 'bg-red-50 dark:bg-red-900/20' :
                    'bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={participant.user_profile?.avatar_url || undefined} />
                        <AvatarFallback className={
                          isNext ? 'bg-blue-200 dark:bg-blue-700 text-blue-700 dark:text-blue-300' :
                          'bg-gray-200 dark:bg-gray-700'
                        }>
                          {participant.user_profile?.display_name 
                            ? participant.user_profile.display_name.charAt(0).toUpperCase()
                            : <User className="h-4 w-4" />
                          }
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium ${
                        isNext ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedParticipant(participant)}
                          className={`font-medium hover:underline cursor-pointer text-left ${isNext ? 'text-blue-900 dark:text-blue-100' : ''}`}
                        >
                          {participant.user_profile?.display_name || participant.user_profile?.email || `ユーザー${index + 1}`}
                        </button>
                        {isNext && <span className="text-xs bg-blue-200 dark:bg-blue-700 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">次</span>}
                      </div>
                      <p className={`text-xs ${isNext ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
                        {new Date(participant.joined_at).toLocaleTimeString('ja-JP')}
                      </p>
                    </div>
                  </div>
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
              )
            })}
          </div>
        )}
      </CardContent>
      
      <UserProfileDialog
        participant={selectedParticipant}
        open={!!selectedParticipant}
        onOpenChange={(open) => !open && setSelectedParticipant(null)}
      />
    </Card>
  )
}