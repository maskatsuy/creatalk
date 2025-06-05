import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { mediaStreamManager } from '@/lib/media-stream-manager'
import { usePageLeave } from '@/hooks/usePageLeave'
import { DeviceSettings } from '../types'

export function useMediaStream() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [loading, setLoading] = useState(false)

  // ページ離脱時のクリーンアップ
  const cleanupStreams = useCallback(() => {
    console.log('Cleaning up streams from DevicePreview')
    if (stream) {
      mediaStreamManager.stopStream(stream)
      setStream(null)
    }
  }, [stream])

  usePageLeave(cleanupStreams)

  // メディアストリームを開始
  const startStream = async ({
    videoEnabled,
    audioEnabled,
    selectedVideoDevice,
    selectedAudioDevice
  }: DeviceSettings, onAudioStreamReady?: (stream: MediaStream) => void) => {
    try {
      setLoading(true)
      
      // 既存のストリームを停止
      if (stream) {
        mediaStreamManager.stopStream(stream)
      }

      // 少なくとも1つのデバイスが有効な場合のみストリームを取得
      if (!videoEnabled && !audioEnabled) {
        setStream(null)
        return
      }

      const constraints = {
        video: videoEnabled ? {
          deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined
        } : false,
        audio: audioEnabled ? {
          deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined
        } : false
      }

      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(newStream)
      mediaStreamManager.addStream(newStream)
      setPermissionDenied(false)
      
      if (videoRef.current && videoEnabled) {
        videoRef.current.srcObject = newStream
      }
      
      // オーディオが有効な場合、コールバックを実行
      if (audioEnabled && newStream.getAudioTracks().length > 0 && onAudioStreamReady) {
        onAudioStreamReady(newStream)
      }
    } catch (error) {
      console.error('Error accessing media devices:', error)
      setPermissionDenied(true)
      
      // より具体的なエラーメッセージ
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            toast.error('カメラまたはマイクへのアクセスが拒否されました。ブラウザの設定を確認してください。')
            break
          case 'NotFoundError':
            toast.error('カメラまたはマイクが見つかりません。デバイスが接続されているか確認してください。')
            break
          case 'NotReadableError':
            toast.error('カメラまたはマイクが他のアプリケーションで使用中です。')
            break
          default:
            toast.error('メディアデバイスへのアクセスに失敗しました。')
        }
      } else {
        toast.error('予期しないエラーが発生しました。')
      }
    } finally {
      setLoading(false)
    }
  }

  const stopStream = () => {
    if (stream) {
      mediaStreamManager.stopStream(stream)
      setStream(null)
    }
  }

  // クリーンアップ
  useEffect(() => {
    return () => {
      cleanupStreams()
    }
  }, [cleanupStreams])

  return {
    stream,
    permissionDenied,
    loading,
    videoRef,
    startStream,
    stopStream
  }
}