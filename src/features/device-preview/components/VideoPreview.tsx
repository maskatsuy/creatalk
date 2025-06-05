'use client'

import { useRef, useEffect } from 'react'
import { VideoOff } from 'lucide-react'

interface VideoPreviewProps {
  stream: MediaStream | null
  videoEnabled: boolean
  permissionDenied: boolean
}

export function VideoPreview({ stream, videoEnabled, permissionDenied }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream && videoEnabled) {
      videoRef.current.srcObject = stream
    }
  }, [stream, videoEnabled])

  return (
    <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
      {videoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          <VideoOff className="h-12 w-12" />
        </div>
      )}
      
      {permissionDenied && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <p className="text-white text-center">
            カメラへのアクセスが拒否されました。
            <br />
            ブラウザの設定から許可してください。
          </p>
        </div>
      )}
    </div>
  )
}