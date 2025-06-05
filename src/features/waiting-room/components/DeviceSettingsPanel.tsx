import { useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DevicePreview } from '@/features/device-preview'
import { DeviceSettings } from '../types'

interface DeviceSettingsPanelProps {
  deviceSettings: DeviceSettings
  onUpdateSetting: <K extends keyof DeviceSettings>(key: K, value: DeviceSettings[K]) => void
}

export function DeviceSettingsPanel({ deviceSettings, onUpdateSetting }: DeviceSettingsPanelProps) {
  // deviceSettingsをrefに保存して、コールバックの再作成を防ぐ
  const deviceSettingsRef = useRef(deviceSettings)
  deviceSettingsRef.current = deviceSettings

  const handleSettingsChange = useCallback((settings: {
    videoEnabled: boolean
    audioEnabled: boolean
    selectedVideoDevice: string
    selectedAudioDevice: string
  }) => {
    // 値が実際に変更された場合のみ更新
    if (settings.videoEnabled !== deviceSettingsRef.current.videoEnabled) {
      onUpdateSetting('videoEnabled', settings.videoEnabled)
    }
    if (settings.audioEnabled !== deviceSettingsRef.current.audioEnabled) {
      onUpdateSetting('audioEnabled', settings.audioEnabled)
    }
    if (settings.selectedVideoDevice !== deviceSettingsRef.current.selectedVideoDevice) {
      onUpdateSetting('selectedVideoDevice', settings.selectedVideoDevice)
    }
    if (settings.selectedAudioDevice !== deviceSettingsRef.current.selectedAudioDevice) {
      onUpdateSetting('selectedAudioDevice', settings.selectedAudioDevice)
    }
  }, [onUpdateSetting])

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>デバイス設定</CardTitle>
      </CardHeader>
      <CardContent>
        <DevicePreview onSettingsChange={handleSettingsChange} />
      </CardContent>
    </Card>
  )
}