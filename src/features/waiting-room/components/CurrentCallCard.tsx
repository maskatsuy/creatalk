import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserCheck, ExternalLink, Wifi } from 'lucide-react'
import { CurrentCall } from '../types'
import { useConnectionTimer } from '../hooks/useConnectionTimer'

interface CurrentCallCardProps {
  currentCall: CurrentCall | null | undefined
  timeRemaining: number | null
  actionLoading: boolean
  onEndCall: () => void
  onRejoinCall: () => void
  formatTime: (seconds: number) => string
}

export function CurrentCallCard({ 
  currentCall, 
  timeRemaining, 
  actionLoading,
  onEndCall, 
  onRejoinCall,
  formatTime 
}: CurrentCallCardProps) {
  const { isConnecting, connectionTimeRemaining } = useConnectionTimer(currentCall)
  
  if (!currentCall) return null

  return (
    <Card className="border-red-200 dark:border-red-800 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isConnecting ? (
            <>
              <Wifi className="h-5 w-5 text-yellow-500 animate-pulse" />
              接続中
            </>
          ) : (
            <>
              <UserCheck className="h-5 w-5 text-red-500" />
              通話中
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              {currentCall.participant.profiles?.full_name || 
               currentCall.participant.profiles?.email || 
               currentCall.participant.user_profile?.display_name || 
               'ゲスト'}
            </p>
            <p className="text-sm text-muted-foreground">
              開始: {new Date(currentCall.started_at).toLocaleTimeString('ja-JP')}
            </p>
            <div className="mt-2 space-y-1">
              {isConnecting && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  接続準備中 {formatTime(connectionTimeRemaining)}
                </Badge>
              )}
              {timeRemaining && timeRemaining > 0 && !isConnecting && (
                <Badge variant={timeRemaining > 60 ? "default" : "destructive"}>
                  残り {formatTime(timeRemaining)}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRejoinCall}
              disabled={actionLoading}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              通話に戻る
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onEndCall}
              disabled={actionLoading}
            >
              通話終了
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}