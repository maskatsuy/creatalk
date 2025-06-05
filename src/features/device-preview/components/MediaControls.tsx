import { Button } from '@/components/ui/button'
import { Video, VideoOff, Mic, MicOff } from 'lucide-react'

interface MediaControlsProps {
  videoEnabled: boolean
  audioEnabled: boolean
  onToggleVideo: () => void
  onToggleAudio: () => void
}

export function MediaControls({ videoEnabled, audioEnabled, onToggleVideo, onToggleAudio }: MediaControlsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={videoEnabled ? 'secondary' : 'destructive'}
        size="sm"
        onClick={onToggleVideo}
        className="flex-1"
      >
        {videoEnabled ? (
          <>
            <Video className="h-4 w-4 mr-2" />
            カメラON
          </>
        ) : (
          <>
            <VideoOff className="h-4 w-4 mr-2" />
            カメラOFF
          </>
        )}
      </Button>
      
      <Button
        variant={audioEnabled ? 'secondary' : 'destructive'}
        size="sm"
        onClick={onToggleAudio}
        className="flex-1"
      >
        {audioEnabled ? (
          <>
            <Mic className="h-4 w-4 mr-2" />
            マイクON
          </>
        ) : (
          <>
            <MicOff className="h-4 w-4 mr-2" />
            マイクOFF
          </>
        )}
      </Button>
    </div>
  )
}