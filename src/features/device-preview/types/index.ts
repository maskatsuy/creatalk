export interface MediaDevice {
  deviceId: string
  label: string
}

export interface DeviceSettings {
  videoEnabled: boolean
  audioEnabled: boolean
  selectedVideoDevice: string
  selectedAudioDevice: string
}

export interface MediaStreamState {
  stream: MediaStream | null
  permissionDenied: boolean
  loading: boolean
}

export interface AudioRecorderState {
  isRecording: boolean
  isPlaying: boolean
  recordedAudio: Blob | null
}

export interface DevicePreviewProps {
  onSettingsChange?: (settings: DeviceSettings) => void
}