'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Settings } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { VideoPreview } from './VideoPreview'
import { MediaControls } from './MediaControls'
import { AudioLevelIndicator } from './AudioLevelIndicator'
import { AudioRecorder } from './AudioRecorder'
import { DeviceSelector } from './DeviceSelector'
import { useMediaDevices } from '../hooks/useMediaDevices'
import { useMediaStream } from '../hooks/useMediaStream'
import { useAudioLevel } from '../hooks/useAudioLevel'
import { useAudioRecorder } from '../hooks/useAudioRecorder'

interface DevicePreviewProps {
  onSettingsChange?: (settings: {
    videoEnabled: boolean
    audioEnabled: boolean
    selectedVideoDevice: string
    selectedAudioDevice: string
  }) => void
}

export function DevicePreview({ onSettingsChange }: DevicePreviewProps = {}) {
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const isInitialized = useRef(false)
  const prevDevicesRef = useRef({ video: '', audio: '' })

  // カスタムフック
  const {
    videoDevices,
    audioDevices,
    selectedVideoDevice,
    selectedAudioDevice,
    setSelectedVideoDevice,
    setSelectedAudioDevice,
    refreshDevices
  } = useMediaDevices()

  const {
    stream,
    permissionDenied,
    startStream
  } = useMediaStream()

  const {
    audioLevel,
    startAudioLevelMonitoring,
    stopAudioLevelMonitoring
  } = useAudioLevel()

  const {
    isRecording,
    isPlaying,
    recordedAudio,
    startRecording,
    stopRecording,
    playRecording,
    stopPlaying
  } = useAudioRecorder()

  // ビデオのオン/オフ切り替え
  const toggleVideo = useCallback(async () => {
    const newVideoEnabled = !videoEnabled
    setVideoEnabled(newVideoEnabled)
    
    stopAudioLevelMonitoring()
    await startStream({
      videoEnabled: newVideoEnabled,
      audioEnabled,
      selectedVideoDevice,
      selectedAudioDevice
    }, (stream) => {
      if (audioEnabled) {
        startAudioLevelMonitoring(stream)
      }
    })
  }, [videoEnabled, audioEnabled, selectedVideoDevice, selectedAudioDevice, stopAudioLevelMonitoring, startStream, startAudioLevelMonitoring])

  // オーディオのオン/オフ切り替え
  const toggleAudio = useCallback(async () => {
    const newAudioEnabled = !audioEnabled
    setAudioEnabled(newAudioEnabled)
    
    stopAudioLevelMonitoring()
    await startStream({
      videoEnabled,
      audioEnabled: newAudioEnabled,
      selectedVideoDevice,
      selectedAudioDevice
    }, (stream) => {
      if (newAudioEnabled) {
        startAudioLevelMonitoring(stream)
      }
    })
  }, [videoEnabled, audioEnabled, selectedVideoDevice, selectedAudioDevice, stopAudioLevelMonitoring, startStream, startAudioLevelMonitoring])

  // デバイス変更時の処理
  const handleVideoDeviceChange = useCallback((deviceId: string) => {
    if (deviceId !== selectedVideoDevice) {
      setSelectedVideoDevice(deviceId)
    }
  }, [selectedVideoDevice, setSelectedVideoDevice])

  const handleAudioDeviceChange = useCallback((deviceId: string) => {
    if (deviceId !== selectedAudioDevice) {
      setSelectedAudioDevice(deviceId)
    }
  }, [selectedAudioDevice, setSelectedAudioDevice])

  // 録音機能のハンドラー
  const handleStartRecording = useCallback(() => {
    if (stream) {
      startRecording(stream)
    }
  }, [stream, startRecording])

  // 設定が変更されたときに親コンポーネントに通知
  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange({
        videoEnabled,
        audioEnabled,
        selectedVideoDevice,
        selectedAudioDevice
      })
    }
  }, [videoEnabled, audioEnabled, selectedVideoDevice, selectedAudioDevice, onSettingsChange])

  // 初回マウント時のみ実行
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true
      // 初回のみデバイスへのアクセスを開始
      const init = async () => {
        await startStream({
          videoEnabled: true,
          audioEnabled: true,
          selectedVideoDevice: '',
          selectedAudioDevice: ''
        }, (stream) => {
          startAudioLevelMonitoring(stream)
        })
        await refreshDevices()
      }
      init()
    }
  }, [startStream, startAudioLevelMonitoring, refreshDevices])

  // デバイス変更時に再接続（初回は除く）
  useEffect(() => {
    // 前回の値と比較して、実際に変更があった場合のみ実行
    const hasVideoChanged = prevDevicesRef.current.video && prevDevicesRef.current.video !== selectedVideoDevice
    const hasAudioChanged = prevDevicesRef.current.audio && prevDevicesRef.current.audio !== selectedAudioDevice
    
    if ((hasVideoChanged || hasAudioChanged) && isInitialized.current) {
      const reconnectStream = async () => {
        stopAudioLevelMonitoring()
        await startStream({
          videoEnabled,
          audioEnabled,
          selectedVideoDevice,
          selectedAudioDevice
        }, (stream) => {
          if (audioEnabled) {
            startAudioLevelMonitoring(stream)
          }
        })
      }
      reconnectStream()
    }
    
    // 現在の値を保存
    prevDevicesRef.current = {
      video: selectedVideoDevice,
      audio: selectedAudioDevice
    }
  }, [selectedVideoDevice, selectedAudioDevice, videoEnabled, audioEnabled, stopAudioLevelMonitoring, startStream, startAudioLevelMonitoring])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          カメラ・マイク設定
        </CardTitle>
        <CardDescription>
          通話開始前にカメラとマイクの動作を確認してください
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ビデオプレビュー */}
        <VideoPreview
          stream={stream}
          videoEnabled={videoEnabled}
          permissionDenied={permissionDenied}
        />

        {/* コントロールボタンとオーディオ機能 */}
        <div className="flex gap-2">
          {/* ビデオコントロール */}
          <MediaControls
            videoEnabled={videoEnabled}
            audioEnabled={audioEnabled}
            onToggleVideo={toggleVideo}
            onToggleAudio={toggleAudio}
          />
          
          {/* オーディオ関連機能 */}
          <div className="flex-1 space-y-2">
            {/* 音量インジケーター */}
            <AudioLevelIndicator
              audioLevel={audioLevel}
              audioEnabled={audioEnabled}
            />
            
            {/* マイクテスト機能 */}
            <AudioRecorder
              audioEnabled={audioEnabled}
              recorderState={{
                isRecording,
                isPlaying,
                recordedAudio
              }}
              onStartRecording={handleStartRecording}
              onStopRecording={stopRecording}
              onPlayRecording={playRecording}
              onStopPlaying={stopPlaying}
            />
          </div>
        </div>

        {/* デバイス選択 */}
        <DeviceSelector
          videoDevices={videoDevices}
          audioDevices={audioDevices}
          selectedVideoDevice={selectedVideoDevice}
          selectedAudioDevice={selectedAudioDevice}
          onVideoDeviceChange={handleVideoDeviceChange}
          onAudioDeviceChange={handleAudioDeviceChange}
        />
      </CardContent>
    </Card>
  )
}