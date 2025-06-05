'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Users,
  Clock
} from 'lucide-react'
import { endCall, endQueueCall } from '@/features/creator-calls/actions'
import Daily, { 
  DailyCall, 
  DailyEventObjectParticipant, 
  DailyEventObjectParticipants, 
  DailyEventObjectParticipantLeft, 
  DailyParticipant,
  DailyEventObjectCameraError,
  DailyEventObjectActiveSpeakerChange,
  DailyEventObjectFatalError,
  DailyEventObjectMeetingSessionStateUpdated
} from '@daily-co/daily-js'


export default function CallPage() {
  const router = useRouter()
  const [initializing, setInitializing] = useState(false)
  const [callFrame, setCallFrame] = useState<DailyCall | null>(null)
  const [participants, setParticipants] = useState<Record<string, DailyParticipant>>({})
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [isQueueCall, setIsQueueCall] = useState(false)
  const [planId, setPlanId] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Callback ref to track when container is available
  const containerCallbackRef = useCallback((element: HTMLDivElement | null) => {
    if (element !== containerRef.current) {
      console.log('=== Container callback ref called ===')
      console.log('Element:', element)
      console.log('isMounted:', isMounted)
      containerRef.current = element
      setContainerElement(element)
    }
  }, [isMounted])

  // Mark component as mounted
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    // URLパラメータから情報を取得
    const urlParams = new URLSearchParams(window.location.search)
    const roomUrl = urlParams.get('url')
    const token = urlParams.get('t')
    const duration = urlParams.get('duration')
    const booking = urlParams.get('booking')
    const queueParam = urlParams.get('queue') === 'true'
    const planIdParam = urlParams.get('planId')
    

    console.log('Call page params:', { roomUrl, token, duration, booking, isQueueCall: queueParam, planId: planIdParam })

    if (!roomUrl || !token) {
      console.error('Missing required params:', { roomUrl, token })
      toast.error('通話情報が不足しています')
      router.push('/creator/calls')
      return
    }

    if (booking) {
      setBookingId(booking)
    }
    
    // Queue call parameters
    setIsQueueCall(queueParam)
    if (planIdParam) {
      setPlanId(planIdParam)
    }

    // 通話時間の設定（実際の時間より少し余裕を持たせる）
    if (duration) {
      const durationMinutes = parseInt(duration)
      // 5分の通話なら5分10秒（310秒）に設定
      // これにより5分間フルに通話でき、最後の10秒はボーナスタイム
      setTimeRemaining(durationMinutes * 60 + 10)
    }

    return () => {
      console.log('Cleaning up call page...')
      if (callFrame) {
        console.log('Destroying call frame')
        callFrame.destroy()
      }
      if (timerRef.current) {
        console.log('Clearing timer')
        clearInterval(timerRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted])

  // Initialize call when container becomes available
  useEffect(() => {
    console.log('Container initialization effect triggered:', { containerElement, isMounted })
    
    if (!containerElement || !isMounted) {
      console.log('Skipping initialization - not ready yet')
      return
    }

    console.log('Container element is now available, initializing call...')
    
    const urlParams = new URLSearchParams(window.location.search)
    const roomUrl = urlParams.get('url')
    const token = urlParams.get('t')
    
    // デバイス設定を取得
    const videoEnabledParam = urlParams.get('videoEnabled') !== 'false'
    const audioEnabledParam = urlParams.get('audioEnabled') !== 'false'
    const videoDeviceParam = urlParams.get('videoDevice')
    const audioDeviceParam = urlParams.get('audioDevice')

    console.log('URL params for initialization:', { roomUrl, token })

    if (roomUrl && token) {
      console.log('Starting initializeCall...')
      initializeCall(roomUrl, token, {
        videoEnabled: videoEnabledParam,
        audioEnabled: audioEnabledParam,
        videoDevice: videoDeviceParam,
        audioDevice: audioDeviceParam
      })
    } else {
      console.error('Missing roomUrl or token for initialization')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerElement, isMounted])

  // 残り時間のカウントダウン（一度だけ初期化）
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || timerRef.current) return

    let warningShown5min = false
    let warningShown1min = false

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          // ここではhandleEndCallを呼ばず、別のuseEffectで処理
          return 0
        }
        
        // 残り5分で警告（310秒 = 5分10秒から10秒引いた値）
        if (prev === 310 && !warningShown5min) {
          warningShown5min = true
          toast.warning('通話終了まで残り5分です')
        }
        // 残り1分で警告（70秒 = 1分10秒から10秒引いた値）
        if (prev === 70 && !warningShown1min) {
          warningShown1min = true
          toast.warning('通話終了まで残り1分です')
        }
        
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [timeRemaining])
  

  const initializeCall = async (roomUrl: string, token: string, deviceSettings?: {
    videoEnabled: boolean
    audioEnabled: boolean
    videoDevice?: string | null
    audioDevice?: string | null
  }) => {
    try {
      console.log('=== initializeCall START ===')
      console.log('Parameters:', { roomUrl, token })
      console.log('Container element:', containerElement)
      
      setInitializing(true)
      
      console.log('Using Daily.co npm package...')
      
      if (!containerElement) {
        console.error('Container element not available for initialization')
        toast.error('ビデオコンテナが準備できていません')
        return
      }

      console.log('Creating call frame with container:', containerElement)
      
      console.log('About to create Daily frame...')
      const frame = Daily.createFrame(containerElement, {
        url: roomUrl,
        token: token,
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: '0',
          borderRadius: '0.5rem'
        },
        showLeaveButton: false,
        showFullscreenButton: false,
        showLocalVideo: true,
        showParticipantsBar: false,
        activeSpeakerMode: false
      })

      console.log('Daily frame created successfully:', frame)
      
      // Check if iframe was created
      const iframe = containerElement.querySelector('iframe')
      console.log('Iframe element found:', iframe)
      if (iframe) {
        console.log('Iframe src:', iframe.src)
        console.log('Iframe style:', iframe.style.cssText)
      }

      // イベントリスナーの設定
      console.log('Setting up event listeners...')
      frame.on('joined-meeting', (event) => {
        console.log('EVENT: joined-meeting', event)
        handleJoinedMeeting(event)
      })
      frame.on('participant-joined', handleParticipantJoined)
      frame.on('participant-left', handleParticipantLeft)
      frame.on('error', handleError)
      
      // Add additional event listeners for debugging
      frame.on('joining-meeting', () => {
        console.log('EVENT: joining-meeting')
        setInitializing(true) // Show loading state
      })
      frame.on('loading', (event) => {
        console.log('EVENT: loading', event)
      })
      frame.on('loaded', (event) => {
        console.log('EVENT: loaded', event)
      })
      frame.on('app-message', (event) => {
        console.log('EVENT: app-message', event)
      })
      frame.on('track-started', (event) => {
        console.log('EVENT: track-started', event)
      })
      frame.on('track-stopped', (event) => {
        console.log('EVENT: track-stopped', event)
      })
      frame.on('started-camera', async (event) => {
        console.log('EVENT: started-camera', event)
        
        // Camera started often means we're in the call
        const currentState = await frame.meetingState()
        console.log('Meeting state after camera start:', currentState)
        
        // If we have camera access, we're likely connected
        if (currentState !== 'error' && currentState !== 'left-meeting') {
          console.log('Camera started, assuming connected')
          const participants = await frame.participants()
          console.log('Participants after camera start:', participants)
          setParticipants(participants || {})
          setInitializing(false)
        }
      })
      frame.on('camera-error', (event: DailyEventObjectCameraError) => {
        console.log('EVENT: camera-error', event)
      })
      frame.on('meeting-session-state-updated', async (event: DailyEventObjectMeetingSessionStateUpdated) => {
        console.log('EVENT: meeting-session-state-updated', event)
        // Check if this means we've joined successfully
        const sessionState = event.meetingSessionState
        console.log('Meeting session state:', sessionState)
        
        // Get current meeting state
        const currentState = await frame.meetingState()
        console.log('Current meeting state from API:', currentState)
        
        if (sessionState.toString() === 'joined-meeting' || currentState === 'joined-meeting') {
          console.log('Joined meeting detected!')
          const participants = await frame.participants()
          console.log('Current participants:', participants)
          setParticipants(participants || {})
          setInitializing(false)
        }
      })
      frame.on('access-state-updated', (event) => {
        console.log('EVENT: access-state-updated', event)
      })
      frame.on('network-quality-change', (event) => {
        console.log('EVENT: network-quality-change', event)
      })
      frame.on('active-speaker-change', (event: DailyEventObjectActiveSpeakerChange) => {
        console.log('EVENT: active-speaker-change', event)
      })
      frame.on('left-meeting', (event) => {
        console.log('EVENT: left-meeting', event)
      })

      setCallFrame(frame)
      console.log('Call frame state updated')
      
      // Additional UI customization after frame creation
      try {
        // Set active speaker mode off
        await frame.setActiveSpeakerMode(false)
        
        // Disable local video mirroring
        await frame.setLocalVideo(true)
        
        console.log('UI customization applied')
      } catch (e) {
        console.log('Some UI customizations may not be available:', e)
      }

      // デバイス設定を適用
      if (deviceSettings) {
        console.log('Applying device settings:', deviceSettings)
        
        console.log('Skipping device pre-configuration - will apply after join')
        // デバイス設定はjoin後に適用する方が安全
      }
      
      console.log('Frame created with room enable_prejoin_ui: false')
      console.log('Attempting to join call...')
      
      try {
        // Explicitly join the call
        const joinResult = await frame.join()
        console.log('Join result:', joinResult)
      } catch (joinError) {
        console.error('Join error:', joinError)
        throw joinError
      }
    } catch (error) {
      console.error('=== ERROR in initializeCall ===')
      console.error('Error details:', error)
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      toast.error('通話の初期化に失敗しました')
      setInitializing(false)
      // router.push('/creator/calls') // Comment out for debugging
    }
  }

  const handleJoinedMeeting = async (event: DailyEventObjectParticipants) => {
    console.log('=== JOINED MEETING EVENT ===')
    console.log('Joined meeting event:', event)
    console.log('Participants:', event.participants)
    // Convert DailyParticipantsObject to Record<string, DailyParticipant>
    const participantsRecord: Record<string, DailyParticipant> = {}
    Object.entries(event.participants).forEach(([id, participant]) => {
      participantsRecord[id] = participant
    })
    setParticipants(participantsRecord)
    
    // 通話参加後にデバイス設定を適用
    if (callFrame) {
      const urlParams = new URLSearchParams(window.location.search)
      const videoEnabledParam = urlParams.get('videoEnabled') !== 'false'
      const audioEnabledParam = urlParams.get('audioEnabled') !== 'false'
      const videoDeviceParam = urlParams.get('videoDevice')
      const audioDeviceParam = urlParams.get('audioDevice')
      
      try {
        console.log('Applying post-join device settings...')
        
        // カメラとマイクのON/OFF設定
        if (typeof videoEnabledParam === 'boolean') {
          await callFrame.setLocalVideo(videoEnabledParam)
          setIsVideoOff(!videoEnabledParam)
          console.log('Video setting applied:', videoEnabledParam)
        }
        
        if (typeof audioEnabledParam === 'boolean') {
          await callFrame.setLocalAudio(audioEnabledParam)
          setIsMuted(!audioEnabledParam)
          console.log('Audio setting applied:', audioEnabledParam)
        }
        
        // デバイス選択（join後なので、使用可能であれば適用）
        if (videoDeviceParam && videoDeviceParam.trim() !== '') {
          try {
            await callFrame.setInputDevicesAsync({
              videoDeviceId: videoDeviceParam
            })
            console.log('Video device applied post-join:', videoDeviceParam)
          } catch (error) {
            console.warn('Could not set video device post-join:', error)
          }
        }
        
        if (audioDeviceParam && audioDeviceParam.trim() !== '') {
          try {
            await callFrame.setInputDevicesAsync({
              audioDeviceId: audioDeviceParam
            })
            console.log('Audio device applied post-join:', audioDeviceParam)
          } catch (error) {
            console.warn('Could not set audio device post-join:', error)
          }
        }
        
        console.log('Post-join device settings completed')
      } catch (error) {
        console.error('Error applying post-join device settings:', error)
      }
    }
    
    setInitializing(false) // Meeting joined successfully
  }

  const handleParticipantJoined = (event: DailyEventObjectParticipant) => {
    console.log('Participant joined:', event)
    setParticipants(prev => ({
      ...prev,
      [event.participant.user_id]: event.participant
    }))
    toast.success('参加者が入室しました')
  }

  const handleParticipantLeft = (event: DailyEventObjectParticipantLeft) => {
    console.log('Participant left:', event)
    setParticipants(prev => {
      const updated = { ...prev }
      delete updated[event.participant.user_id]
      return updated
    })
    toast.info('参加者が退室しました')
  }

  const handleError = (event: DailyEventObjectFatalError) => {
    console.error('=== DAILY ERROR EVENT ===')
    console.error('Call error:', event)
    console.error('Error type:', typeof event)
    if (event && typeof event === 'object') {
      console.error('Error keys:', Object.keys(event))
      console.error('Error details:', JSON.stringify(event, null, 2))
    }
    toast.error('通話エラーが発生しました')
  }

  const toggleMute = () => {
    if (!callFrame) return
    callFrame.setLocalAudio(!isMuted)
    setIsMuted(!isMuted)
  }

  const toggleVideo = () => {
    if (!callFrame) return
    callFrame.setLocalVideo(!isVideoOff)
    setIsVideoOff(!isVideoOff)
  }

  const toggleScreenShare = async () => {
    if (!callFrame) return
    
    try {
      if (isScreenSharing) {
        await callFrame.stopScreenShare()
      } else {
        await callFrame.startScreenShare()
      }
      setIsScreenSharing(!isScreenSharing)
    } catch (error) {
      console.error('Screen share error:', error)
      toast.error('画面共有の切り替えに失敗しました')
    }
  }

  const handleEndCall = useCallback(async () => {
    if (callFrame) {
      try {
        await callFrame.leave()
        callFrame.destroy()
      } catch (error) {
        console.error('Error ending call:', error)
      }
    }

    // 通話終了処理
    if (isQueueCall && planId) {
      // キュー通話の場合はendQueueCallを使用
      const result = await endQueueCall(planId)
      if (result.error) {
        toast.error('通話の終了処理に失敗しました')
      } else {
        toast.success('通話を終了しました')
        // 待機室に戻る
        router.push(`/waiting-room/${planId}`)
        return
      }
    } else if (bookingId) {
      // 通常の通話の場合
      const result = await endCall(bookingId)
      if (result.error) {
        toast.error('通話の終了処理に失敗しました')
      }
    }

    toast.success('通話を終了しました')
    router.push('/creator/calls')
  }, [callFrame, isQueueCall, planId, bookingId, router])

  // 時間切れの処理
  useEffect(() => {
    if (timeRemaining === 0) {
      handleEndCall()
    }
  }, [timeRemaining, handleEndCall])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const participantCount = Object.keys(participants).length

  // Show loading overlay when initializing the call
  const showLoadingOverlay = initializing
  
  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-white">
            {showLoadingOverlay ? '通話を準備中...' : '通話中'}
          </h1>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300">{participantCount}人</span>
          </div>
        </div>

        {timeRemaining !== null && (
          <div className="flex items-center gap-2">
            {timeRemaining > 10 && <Clock className="h-4 w-4 text-gray-400" />}
            {timeRemaining > 60 ? (
              <Badge variant="secondary" className="font-mono">
                残り {formatTime(timeRemaining)}
              </Badge>
            ) : timeRemaining > 30 ? (
              <Badge variant="default" className="font-mono bg-yellow-600">
                あと {timeRemaining}秒
              </Badge>
            ) : timeRemaining > 10 ? (
              <Badge variant="destructive" className="font-mono animate-pulse">
                まもなく終了 {timeRemaining}秒
              </Badge>
            ) : (
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-green-400 animate-pulse">
                  {timeRemaining}
                </div>
                <div className="text-sm text-green-400">
                  ボーナス
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {isQueueCall && planId && (
            <Button
              variant="outline"
              onClick={() => router.push(`/waiting-room/${planId}`)}
              className="gap-2"
            >
              待機室に戻る
            </Button>
          )}
          
          <Button
            variant="destructive"
            onClick={handleEndCall}
            className="gap-2"
          >
            <PhoneOff className="h-4 w-4" />
            通話を終了
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Container */}
        <div className="flex-1 relative bg-black">
          <div ref={containerCallbackRef} className="absolute inset-0 daily-video-container" />
          
          <style jsx global>{`
            /* Daily.jsのデフォルトUIを非表示 */
            .daily-video-container iframe {
              pointer-events: all;
            }
            
            /* Daily.jsのコントロールバーを非表示 */
            .daily-video-container .daily-call-controls {
              display: none !important;
            }
            
            /* Daily.jsの参加者バーを非表示 */
            .daily-video-container .daily-participants-bar {
              display: none !important;
            }
            
            /* Daily.jsのユーザー名オーバーレイを非表示 */
            .daily-video-container .daily-username-overlay {
              display: none !important;
            }
          `}</style>
          
          {/* Loading overlay - always present but conditionally visible */}
          {showLoadingOverlay && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white">Daily.coに接続中...</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (チャットなど将来的に追加) */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 hidden lg:block">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-medium text-white">チャット</h2>
            </div>
            <div className="text-center py-8 text-gray-500">
              チャット機能は準備中です
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isMuted ? 'destructive' : 'secondary'}
            size="icon"
            onClick={toggleMute}
            className="h-12 w-12"
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Button
            variant={isVideoOff ? 'destructive' : 'secondary'}
            size="icon"
            onClick={toggleVideo}
            className="h-12 w-12"
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? 'default' : 'secondary'}
            size="icon"
            onClick={toggleScreenShare}
            className="h-12 w-12"
          >
            {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}