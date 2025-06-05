import { useState, useRef } from 'react'
import { toast } from 'sonner'

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  // 録音開始
  const startRecording = (stream: MediaStream) => {
    if (!stream || stream.getAudioTracks().length === 0) {
      toast.error('マイクが有効になっていません')
      return
    }

    try {
      audioChunksRef.current = []
      
      // オーディオトラックのみを含む新しいストリームを作成
      const audioStream = new MediaStream(stream.getAudioTracks())
      
      // サポートされているMIMEタイプを確認
      const options: MediaRecorderOptions = {}
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg',
        'audio/wav'
      ]
      
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          options.mimeType = type
          break
        }
      }
      
      console.log('Using MIME type:', options.mimeType || 'default')
      
      const mediaRecorder = new MediaRecorder(audioStream, options)
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType || 'audio/webm' })
        setRecordedAudio(audioBlob)
        audioChunksRef.current = []
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      
      // 5秒後に自動停止
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording()
        }
      }, 5000)
    } catch (error) {
      console.error('Error starting recording:', error)
      if (error instanceof Error) {
        toast.error(`録音エラー: ${error.message}`)
      } else {
        toast.error('録音の開始に失敗しました')
      }
    }
  }

  // 録音停止
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // 録音再生
  const playRecording = () => {
    if (!recordedAudio) {
      toast.error('録音データがありません')
      return
    }

    const audio = new Audio()
    audio.src = URL.createObjectURL(recordedAudio)
    audioElementRef.current = audio
    
    audio.onplay = () => setIsPlaying(true)
    audio.onended = () => {
      setIsPlaying(false)
      URL.revokeObjectURL(audio.src)
    }
    
    audio.play().catch(error => {
      console.error('Error playing audio:', error)
      toast.error('再生に失敗しました')
      setIsPlaying(false)
    })
  }

  // 再生停止
  const stopPlaying = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      audioElementRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  return {
    isRecording,
    isPlaying,
    recordedAudio,
    startRecording,
    stopRecording,
    playRecording,
    stopPlaying
  }
}