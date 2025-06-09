'use client'

import { Button } from '@/components/ui/button'
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff } from 'lucide-react'

interface CallControlsProps {
  isMuted: boolean
  isVideoOff: boolean
  isScreenSharing: boolean
  onToggleMute: () => void
  onToggleVideo: () => void
  onToggleScreenShare: () => void
}

export function CallControls({
  isMuted,
  isVideoOff,
  isScreenSharing,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare
}: CallControlsProps) {
  return (
    <div className="bg-gray-800 px-6 py-4">
      <div className="flex items-center justify-center gap-4">
        <Button
          variant={isMuted ? 'destructive' : 'secondary'}
          size="icon"
          onClick={onToggleMute}
          className="h-12 w-12"
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>

        <Button
          variant={isVideoOff ? 'destructive' : 'secondary'}
          size="icon"
          onClick={onToggleVideo}
          className="h-12 w-12"
        >
          {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>

        <Button
          variant={isScreenSharing ? 'default' : 'secondary'}
          size="icon"
          onClick={onToggleScreenShare}
          className="h-12 w-12"
        >
          {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  )
}