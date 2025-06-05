import { useState, useRef, useCallback } from 'react'

export function useAudioLevel() {
  const [audioLevel, setAudioLevel] = useState<number>(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const smoothedLevelRef = useRef<number>(0)

  // 音量レベルを監視
  const startAudioLevelMonitoring = useCallback((stream: MediaStream) => {
    try {
      // AudioContextを作成
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioContextRef.current = new AudioContextClass()
      }
      
      const audioContext = audioContextRef.current
      
      // AnalyserNodeを作成
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0 // スムージングを無効化（自前で行うため）
      analyserRef.current = analyser
      
      // MediaStreamからソースを作成
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      
      // 音量レベルを監視（RMSベースの実装）
      const monitorAudioLevel = () => {
        if (!analyserRef.current) return
        
        const bufferLength = analyserRef.current.fftSize
        const dataArray = new Uint8Array(bufferLength)
        analyserRef.current.getByteTimeDomainData(dataArray)
        
        // RMS（Root Mean Square）を計算
        let sumSquares = 0
        for (let i = 0; i < bufferLength; i++) {
          const normalizedSample = (dataArray[i] - 128) / 128.0
          sumSquares += normalizedSample * normalizedSample
        }
        const rms = Math.sqrt(sumSquares / bufferLength)
        
        // デシベルに変換（-60dB to 0dB）
        const db = 20 * Math.log10(Math.max(0.00001, rms))
        
        // -60dB to 0dB を 0-100 にマッピング
        const normalizedDb = Math.max(0, db + 60) / 60
        const currentLevel = Math.min(100, normalizedDb * 100)
        
        // ダブルスムージング（高速応答と低速応答の組み合わせ）
        const fastSmooth = smoothedLevelRef.current * 0.3 + currentLevel * 0.7  // より速い応答
        const slowSmooth = smoothedLevelRef.current * 0.85 + currentLevel * 0.15  // 減衰も少し速く
        
        // ピークホールド効果（音が大きくなった時は速く、小さくなった時はゆっくり）
        if (currentLevel > smoothedLevelRef.current) {
          smoothedLevelRef.current = fastSmooth
        } else {
          smoothedLevelRef.current = slowSmooth
        }
        
        // 整数に丸めて設定
        setAudioLevel(Math.round(smoothedLevelRef.current))
        
        animationFrameRef.current = requestAnimationFrame(monitorAudioLevel)
      }
      
      monitorAudioLevel()
    } catch (error) {
      console.error('Error setting up audio level monitoring:', error)
    }
  }, [])

  // 音量監視を停止
  const stopAudioLevelMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    analyserRef.current = null
    smoothedLevelRef.current = 0
    setAudioLevel(0)
  }, [])

  return {
    audioLevel,
    startAudioLevelMonitoring,
    stopAudioLevelMonitoring
  }
}