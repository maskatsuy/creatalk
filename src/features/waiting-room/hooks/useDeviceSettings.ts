import { useState, useCallback } from 'react'
import { DeviceSettings } from '../types'

export function useDeviceSettings() {
  const [deviceSettings, setDeviceSettings] = useState<DeviceSettings>({
    videoEnabled: true,
    audioEnabled: true,
    selectedVideoDevice: '',
    selectedAudioDevice: ''
  })

  const updateSetting = useCallback(<K extends keyof DeviceSettings>(
    key: K, 
    value: DeviceSettings[K]
  ) => {
    setDeviceSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const buildCallUrl = useCallback((baseUrl: string) => {
    const url = new URL(baseUrl, window.location.origin)
    url.searchParams.append('videoEnabled', deviceSettings.videoEnabled.toString())
    url.searchParams.append('audioEnabled', deviceSettings.audioEnabled.toString())
    if (deviceSettings.selectedVideoDevice) {
      url.searchParams.append('videoDevice', deviceSettings.selectedVideoDevice)
    }
    if (deviceSettings.selectedAudioDevice) {
      url.searchParams.append('audioDevice', deviceSettings.selectedAudioDevice)
    }
    return url.toString()
  }, [deviceSettings])

  return {
    deviceSettings,
    updateSetting,
    buildCallUrl,
  }
}