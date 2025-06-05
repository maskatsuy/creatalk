import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MediaDevice } from '../types'

interface DeviceSelectorProps {
  videoDevices: MediaDevice[]
  audioDevices: MediaDevice[]
  selectedVideoDevice: string
  selectedAudioDevice: string
  onVideoDeviceChange: (deviceId: string) => void
  onAudioDeviceChange: (deviceId: string) => void
}

export function DeviceSelector({ 
  videoDevices, 
  audioDevices, 
  selectedVideoDevice, 
  selectedAudioDevice, 
  onVideoDeviceChange, 
  onAudioDeviceChange 
}: DeviceSelectorProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium mb-1 block">カメラ</label>
        <Select value={selectedVideoDevice || ''} onValueChange={onVideoDeviceChange}>
          <SelectTrigger>
            <SelectValue placeholder="カメラを選択" />
          </SelectTrigger>
          <SelectContent>
            {videoDevices.map(device => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-1 block">マイク</label>
        <Select value={selectedAudioDevice || ''} onValueChange={onAudioDeviceChange}>
          <SelectTrigger>
            <SelectValue placeholder="マイクを選択" />
          </SelectTrigger>
          <SelectContent>
            {audioDevices.map(device => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}