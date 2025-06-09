'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PhoneOff, Users, Clock } from 'lucide-react'

interface CallHeaderProps {
  initializing: boolean
  participantCount: number
  timeRemaining: number | null
  formatTime: (seconds: number) => string
  onEndCall: () => void
  onReturnToWaitingRoom?: () => void
  isCreator: boolean
  isEndingCall: boolean
}

export function CallHeader({
  initializing,
  participantCount,
  timeRemaining,
  formatTime,
  onEndCall,
  onReturnToWaitingRoom,
  isCreator,
  isEndingCall
}: CallHeaderProps) {
  return (
    <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-white">
          {initializing ? '通話を準備中...' : '通話中'}
        </h1>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-300">{participantCount}人</span>
        </div>
      </div>

      {timeRemaining !== null && (
        <div className="flex items-center gap-2">
          {timeRemaining > 10 && <Clock className="h-4 w-4 text-gray-400" />}
          {timeRemaining > 60 ? (
            <Badge variant="secondary" className="font-mono">
              残り {formatTime(timeRemaining)}
            </Badge>
          ) : timeRemaining > 30 ? (
            <Badge variant="default" className="font-mono bg-yellow-600">
              あと {timeRemaining}秒
            </Badge>
          ) : timeRemaining > 10 ? (
            <Badge variant="destructive" className="font-mono animate-pulse">
              まもなく終了 {timeRemaining}秒
            </Badge>
          ) : (
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-400 animate-pulse">
                {timeRemaining}
              </div>
              <div className="text-sm text-green-400">
                ボーナス
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        {onReturnToWaitingRoom && (
          <Button
            variant="outline"
            onClick={onReturnToWaitingRoom}
            className="gap-2"
          >
            待機室に戻る
          </Button>
        )}
        
        <Button
          variant="destructive"
          onClick={onEndCall}
          className="gap-2"
          disabled={isEndingCall}
        >
          <PhoneOff className="h-4 w-4" />
          {isCreator ? '通話を終了' : '退出'}
        </Button>
      </div>
    </div>
  )
}