'use client'

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import Daily, { 
  DailyCall, 
  DailyEventObjectParticipant, 
  DailyEventObjectParticipants, 
  DailyEventObjectParticipantLeft, 
  DailyParticipant,
  DailyEventObjectFatalError
} from '@daily-co/daily-js'

interface UseVideoCallProps {
  onJoinedMeeting?: (participants: Record<string, DailyParticipant>) => void
  onParticipantJoined?: (participant: DailyParticipant) => void
  onParticipantLeft?: (participant: DailyParticipant) => void
  onError?: (error: DailyEventObjectFatalError) => void
  onLeftMeeting?: () => void
}

export function useVideoCall({
  onJoinedMeeting,
  onParticipantJoined,
  onParticipantLeft,
  onError,
  onLeftMeeting
}: UseVideoCallProps = {}) {
  const [callFrame, setCallFrame] = useState<DailyCall | null>(null)
  const [participants, setParticipants] = useState<Record<string, DailyParticipant>>({})
  const [initializing, setInitializing] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  const handleJoinedMeeting = useCallback(async (event: DailyEventObjectParticipants) => {
    // Convert DailyParticipantsObject to Record<string, DailyParticipant>
    const participantsRecord: Record<string, DailyParticipant> = {}
    Object.entries(event.participants).forEach(([id, participant]) => {
      participantsRecord[id] = participant
    })
    setParticipants(participantsRecord)
    
    if (onJoinedMeeting) {
      onJoinedMeeting(participantsRecord)
    }
    
    setInitializing(false)
  }, [onJoinedMeeting])

  const handleParticipantJoined = useCallback((event: DailyEventObjectParticipant) => {
    setParticipants(prev => ({
      ...prev,
      [event.participant.user_id]: event.participant
    }))
    
    if (onParticipantJoined) {
      onParticipantJoined(event.participant)
    }
    
    toast.success('参加者が入室しました')
  }, [onParticipantJoined])

  const handleParticipantLeft = useCallback((event: DailyEventObjectParticipantLeft) => {
    setParticipants(prev => {
      const updated = { ...prev }
      delete updated[event.participant.user_id]
      return updated
    })
    
    if (onParticipantLeft) {
      onParticipantLeft(event.participant)
    }
    
    // Check if the participant who left is the creator
    if (event.participant.owner) {
      toast.info('クリエイターが退室しました')
    } else {
      toast.info('参加者が退室しました')
    }
  }, [onParticipantLeft])

  const handleError = useCallback((event: DailyEventObjectFatalError) => {
    if (onError) {
      onError(event)
    }
  }, [onError])

  const initializeCall = useCallback(async (
    roomUrl: string, 
    token: string, 
    containerElement: HTMLDivElement,
    deviceSettings?: {
      videoEnabled: boolean
      audioEnabled: boolean
      videoDevice?: string | null
      audioDevice?: string | null
    }
  ) => {
    try {
      setInitializing(true)
      
      const frame = Daily.createFrame(containerElement, {
        url: roomUrl,
        token: token,
        iframeStyle: {
          width: '100%',
          height: '100%',
          minHeight: '80vh',
          border: 'none',
          position: 'absolute',
          top: '0',
          left: '0'
        }
      })

      // イベントリスナーの設定
      frame.on('joined-meeting', handleJoinedMeeting)
      frame.on('participant-joined', handleParticipantJoined)
      frame.on('participant-left', handleParticipantLeft)
      frame.on('error', handleError)
      
      // Add event listeners
      frame.on('joining-meeting', () => {
        setInitializing(true)
      })
      
      frame.on('started-camera', async () => {
        const currentState = await frame.meetingState()
        if (currentState !== 'error' && currentState !== 'left-meeting') {
          const participants = await frame.participants()
          setParticipants(participants || {})
          setInitializing(false)
        }
      })
      
      frame.on('meeting-session-state-updated', async () => {
        const currentState = await frame.meetingState()
        if (currentState === 'joined-meeting') {
          const participants = await frame.participants()
          setParticipants(participants || {})
          setInitializing(false)
        }
      })
      
      frame.on('left-meeting', () => {
        if (onLeftMeeting) {
          onLeftMeeting()
        }
      })

      setCallFrame(frame)
      
      // Additional UI customization after frame creation
      try {
        await frame.setActiveSpeakerMode(false)
        await frame.setLocalVideo(true)
      } catch {
        // Some UI customizations may not be available
      }
      
      try {
        await frame.join()
        
        // 通話参加後にデバイス設定を適用
        if (deviceSettings) {
          if (typeof deviceSettings.videoEnabled === 'boolean') {
            await frame.setLocalVideo(deviceSettings.videoEnabled)
            setIsVideoOff(!deviceSettings.videoEnabled)
          }
          
          if (typeof deviceSettings.audioEnabled === 'boolean') {
            await frame.setLocalAudio(deviceSettings.audioEnabled)
            setIsMuted(!deviceSettings.audioEnabled)
          }
          
          if (deviceSettings.videoDevice && deviceSettings.videoDevice.trim() !== '') {
            try {
              await frame.setInputDevicesAsync({
                videoDeviceId: deviceSettings.videoDevice
              })
            } catch {
              // Device setting failed
            }
          }
          
          if (deviceSettings.audioDevice && deviceSettings.audioDevice.trim() !== '') {
            try {
              await frame.setInputDevicesAsync({
                audioDeviceId: deviceSettings.audioDevice
              })
            } catch {
              // Device setting failed
            }
          }
        }
      } catch (joinError) {
        throw joinError
      }
    } catch (error) {
      toast.error('通話の初期化に失敗しました')
      setInitializing(false)
      throw error
    }
  }, [handleJoinedMeeting, handleParticipantJoined, handleParticipantLeft, handleError, onLeftMeeting])

  const toggleMute = useCallback(() => {
    if (!callFrame) return
    callFrame.setLocalAudio(!isMuted)
    setIsMuted(!isMuted)
  }, [callFrame, isMuted])

  const toggleVideo = useCallback(() => {
    if (!callFrame) return
    callFrame.setLocalVideo(!isVideoOff)
    setIsVideoOff(!isVideoOff)
  }, [callFrame, isVideoOff])

  const toggleScreenShare = useCallback(async () => {
    if (!callFrame) return
    
    try {
      if (isScreenSharing) {
        await callFrame.stopScreenShare()
      } else {
        await callFrame.startScreenShare()
      }
      setIsScreenSharing(!isScreenSharing)
    } catch {
      toast.error('画面共有の切り替えに失敗しました')
    }
  }, [callFrame, isScreenSharing])

  const leaveCall = useCallback(async () => {
    if (!callFrame) return
    
    try {
      await callFrame.leave()
      callFrame.destroy()
      setCallFrame(null)
    } catch {
      // Error leaving call
    }
  }, [callFrame])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callFrame) {
        try {
          callFrame.destroy()
        } catch {
          // Error destroying call frame
        }
      }
    }
  }, [callFrame])

  return {
    callFrame,
    participants,
    initializing,
    isMuted,
    isVideoOff,
    isScreenSharing,
    initializeCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    leaveCall
  }
}