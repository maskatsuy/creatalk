import { useState, useEffect, useCallback } from 'react'
import { MediaDevice } from '../types'

export function useMediaDevices() {
  const [videoDevices, setVideoDevices] = useState<MediaDevice[]>([])
  const [audioDevices, setAudioDevices] = useState<MediaDevice[]>([])
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('')
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('')

  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoInputs = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `カメラ ${device.deviceId.slice(0, 5)}`
        }))
      const audioInputs = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `マイク ${device.deviceId.slice(0, 5)}`
        }))
      
      setVideoDevices(videoInputs)
      setAudioDevices(audioInputs)
      
      // デフォルトデバイスを設定（初回のみ）
      setSelectedVideoDevice(prev => {
        if (!prev && videoInputs.length > 0) {
          return videoInputs[0].deviceId
        }
        return prev
      })
      setSelectedAudioDevice(prev => {
        if (!prev && audioInputs.length > 0) {
          return audioInputs[0].deviceId
        }
        return prev
      })
    } catch (error) {
      console.error('Error enumerating devices:', error)
    }
  }, [])

  useEffect(() => {
    getDevices()
  }, [getDevices])

  return {
    videoDevices,
    audioDevices,
    selectedVideoDevice,
    selectedAudioDevice,
    setSelectedVideoDevice,
    setSelectedAudioDevice,
    refreshDevices: getDevices
  }
}