import { Button } from '@/components/ui/button'
import { Mic, Square, Play, Loader2 } from 'lucide-react'
import { AudioRecorderState } from '../types'

interface AudioRecorderProps {
  audioEnabled: boolean
  recorderState: AudioRecorderState
  onStartRecording: () => void
  onStopRecording: () => void
  onPlayRecording: () => void
  onStopPlaying: () => void
}

export function AudioRecorder({ 
  audioEnabled, 
  recorderState, 
  onStartRecording, 
  onStopRecording, 
  onPlayRecording, 
  onStopPlaying 
}: AudioRecorderProps) {
  if (!audioEnabled) return null

  const { isRecording, isPlaying, recordedAudio } = recorderState

  return (
    <div className="mt-3 space-y-2">
      <div className="text-xs font-medium">マイクテスト</div>
      <div className="flex gap-2">
        {!isRecording && !recordedAudio && (
          <Button
            size="sm"
            variant="outline"
            onClick={onStartRecording}
            className="flex-1"
          >
            <Mic className="h-3 w-3 mr-1" />
            録音（5秒）
          </Button>
        )}
        
        {isRecording && (
          <Button
            size="sm"
            variant="destructive"
            onClick={onStopRecording}
            className="flex-1"
          >
            <Square className="h-3 w-3 mr-1" />
            停止中...
          </Button>
        )}
        
        {recordedAudio && !isRecording && !isPlaying && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={onPlayRecording}
              className="flex-1"
            >
              <Play className="h-3 w-3 mr-1" />
              再生
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onStartRecording}
              className="flex-1"
            >
              <Mic className="h-3 w-3 mr-1" />
              録り直す
            </Button>
          </>
        )}
        
        {isPlaying && (
          <Button
            size="sm"
            variant="outline"
            onClick={onStopPlaying}
            className="flex-1"
          >
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            再生中...
          </Button>
        )}
      </div>
      <div className="text-xs text-muted-foreground text-center">
        録音してすぐに再生できます
      </div>
    </div>
  )
}