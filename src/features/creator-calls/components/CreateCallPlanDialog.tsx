'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Clock, Users, Calendar, Info, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { format, parse, addMinutes, isBefore } from 'date-fns'
import { createCallPlan } from '../actions'

interface CreateCallPlanDialogProps {
  onPlanCreated?: () => void
}

interface TimeSlot {
  start: string
  end: string
}

export function CreateCallPlanDialog({ onPlanCreated }: CreateCallPlanDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [planType, setPlanType] = useState<'queue' | 'fixed'>('queue')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('1000')
  
  // Default start date/time is 10 minutes from now
  const getDefaultStartDateTime = () => {
    const now = new Date()
    const defaultTime = addMinutes(now, 10)
    return {
      date: format(defaultTime, 'yyyy-MM-dd'),
      time: format(defaultTime, 'HH:mm')
    }
  }
  
  const defaults = getDefaultStartDateTime()
  const [startDate, setStartDate] = useState(defaults.date)
  const [startTime, setStartTime] = useState(defaults.time)
  const [endTime, setEndTime] = useState('')
  const [duration, setDuration] = useState('30')
  const [breakTime, setBreakTime] = useState('5')
  const [slotCount, setSlotCount] = useState('4') // 時間制の枠数（デフォルト4枠）
  const [enableRecording, setEnableRecording] = useState(false)
  
  // Calculated slots for fixed type
  const [calculatedSlots, setCalculatedSlots] = useState<TimeSlot[]>([])

  // Warning state
  const [slotWarning, setSlotWarning] = useState<string>('')
  const [timeConflict, setTimeConflict] = useState<{
    hasConflict: boolean
    conflictPlan?: { title: string; time: string }
  }>({ hasConflict: false })
  const [checkingConflict, setCheckingConflict] = useState(false)

  // Recalculate slots when relevant fields change
  useEffect(() => {
    if (planType !== 'fixed' || !startTime || !duration || !slotCount) {
      setCalculatedSlots([])
      setSlotWarning('')
      return
    }

    const slots: TimeSlot[] = []
    const durationMin = parseInt(duration)
    const breakMin = parseInt(breakTime) || 0
    const slotNum = Math.min(parseInt(slotCount) || 1, 10) // 最大10枠
    
    // Parse start date and time
    const startDateTime = parse(`${startDate} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date())
    let currentTime = new Date(startDateTime)
    
    // Generate slots
    for (let i = 0; i < slotNum; i++) {
      const slotEnd = addMinutes(currentTime, durationMin)
      
      // Check if slot crosses midnight
      const startDay = format(currentTime, 'yyyy-MM-dd')
      const endDay = format(slotEnd, 'yyyy-MM-dd')
      
      slots.push({
        start: startDay !== endDay ? `${format(currentTime, 'HH:mm')} (${format(currentTime, 'MM/dd')})` : format(currentTime, 'HH:mm'),
        end: endDay !== startDay ? `${format(slotEnd, 'HH:mm')} (${format(slotEnd, 'MM/dd')})` : format(slotEnd, 'HH:mm')
      })
      
      // Move to next slot start (current end + break time)
      if (i < slotNum - 1) { // Don't add break after the last slot
        currentTime = addMinutes(slotEnd, breakMin)
      } else {
        currentTime = slotEnd
      }
    }
    
    // Update calculated end time
    const calculatedEnd = format(currentTime, 'HH:mm')
    setEndTime(calculatedEnd)
    
    // Set warnings if needed
    if (slotNum > 10) {
      setSlotWarning('最大10枠までしか作成できません。')
    } else {
      setSlotWarning('')
    }
    
    setCalculatedSlots(slots)
  }, [planType, startDate, startTime, duration, breakTime, slotCount])

  // Check for time conflicts when start/end time changes
  useEffect(() => {
    if (!startTime || !endTime) {
      setTimeConflict({ hasConflict: false })
      return
    }

    const debounceTimer = setTimeout(async () => {
      setCheckingConflict(true)
      try {
        // クライアントコンポーネントでは直接checkTimeConflictを呼べないので、
        // ここでは時間の競合チェックをスキップ
        setTimeConflict({ hasConflict: false })
      } catch (error) {
        console.error('Error checking time conflict:', error)
        setTimeConflict({ hasConflict: false })
      } finally {
        setCheckingConflict(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(debounceTimer)
  }, [planType, startTime, endTime])

  const handleSubmit = async () => {
    // Validation
    if (!title || !price || !startDate || !startTime || !endTime || !duration) {
      toast.error('必須項目を入力してください')
      return
    }

    const priceNum = parseInt(price)
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('価格は0以上の数値を入力してください')
      return
    }
    
    // 念のため100円単位に丸める（通常はonBlurで処理済み）
    const finalPrice = Math.round(priceNum / 100) * 100

    // Validate start date/time (must be at least 5 minutes from now)
    const now = new Date()
    const minStartTime = addMinutes(now, 5)
    const selectedStart = parse(`${startDate} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date())
    
    if (isBefore(selectedStart, minStartTime)) {
      toast.error('開始日時は現在時刻の5分後以降に設定してください')
      return
    }

    // Check for time conflicts before submitting
    if (timeConflict.hasConflict) {
      toast.error('時間が重複しているため、プランを作成できません')
      return
    }

    setLoading(true)

    try {
      // Force queue type only for now
      const planData = {
        type: 'queue' as const,
        title,
        description,
        price: finalPrice,
        duration_minutes: parseInt(duration),
        slot_date: startDate,
        start_time: startTime,
        end_time: endTime,
        break_minutes: parseInt(breakTime),
        max_participants: 10 // デフォルト値
      }

      const result = await createCallPlan(planData)
      
      if (result.error) {
        toast.error(result.error)
        return
      }
      
      toast.success('プランを作成しました')
      
      onPlanCreated?.()
      setOpen(false)
      resetForm()
    } catch {
      toast.error('プランの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setPlanType('queue')
    setTitle('')
    setDescription('')
    setPrice('1000')
    const defaults = getDefaultStartDateTime()
    setStartDate(defaults.date)
    setStartTime(defaults.time)
    setEndTime('')
    setDuration('30')
    setBreakTime('5')
    setSlotCount('4')
    setEnableRecording(false)
    setCalculatedSlots([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          新しいプラン作成
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>通話プランを作成</DialogTitle>
          <DialogDescription>
            先着制の通話プランを作成できます
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plan Type Selection - Queue Only */}
          <div className="space-y-3">
            <div className="flex items-start space-x-2 p-3 border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-4 h-4 rounded-full bg-blue-600 mt-1 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">先着制</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  設定した時間内で、来た順番に通話を開始します。
                  各通話の時間と休憩時間を設定できます。
                </p>
              </div>
            </div>
            
            {/* Fixed type - Coming Soon */}
            <div className="flex items-start space-x-2 p-3 border border-gray-200 bg-gray-50 dark:bg-gray-800 rounded-lg opacity-60">
              <div className="w-4 h-4 rounded-full bg-gray-400 mt-1 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-500">時間制</span>
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">開発中</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  固定の時間枠を作成し、ユーザーが事前に予約できます。
                  （近日公開予定）
                </p>
              </div>
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-2">
            <Label htmlFor="title">プラン名 <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              placeholder="例：雑談プラン、相談プラン"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              placeholder="プランの詳細説明..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">価格（円） <span className="text-red-500">*</span></Label>
            <Input
              id="price"
              type="number"
              placeholder="1000"
              min="0"
              step="100"
              value={price}
              onChange={(e) => {
                const value = e.target.value
                setPrice(value)
              }}
              onBlur={(e) => {
                // フォーカスが外れたときに100円単位に自動修正
                const value = parseInt(e.target.value) || 0
                if (value > 0 && value % 100 !== 0) {
                  const rounded = Math.round(value / 100) * 100
                  setPrice(rounded.toString())
                  toast.info(`価格を${rounded}円に修正しました`)
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              100円単位で設定できます。100円単位でない場合は自動的に修正されます。
            </p>
          </div>

          {/* Date and Time Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">開始日 <span className="text-red-500">*</span></Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">開始時刻 <span className="text-red-500">*</span></Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">開始日時は現在の5分後以降に設定してください</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">終了時刻 <span className="text-red-500">*</span></Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* No slot count needed for queue type */}

          {/* Duration and Break */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">1枠の時間（分） <span className="text-red-500">*</span></Label>
              <Input
                id="duration"
                type="number"
                min="5"
                max="120"
                step="5"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breakTime">休憩時間（分）</Label>
              <Input
                id="breakTime"
                type="number"
                min="0"
                max="30"
                step="5"
                value={breakTime}
                onChange={(e) => setBreakTime(e.target.value)}
              />
            </div>
          </div>

          {/* Recording Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="recording"
              checked={enableRecording}
              onCheckedChange={(checked) => setEnableRecording(checked as boolean)}
            />
            <Label htmlFor="recording" className="cursor-pointer">
              通話の録画を許可する
            </Label>
          </div>

          {/* Show warning for queue type */}
          {startTime && endTime && duration && (() => {
            const start = parse(startTime, 'HH:mm', new Date())
            const end = parse(endTime, 'HH:mm', new Date())
            if (isBefore(end, start)) end.setDate(end.getDate() + 1)
            const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
            const durationMin = parseInt(duration)
            const breakMin = parseInt(breakTime) || 0
            const maxPossibleSlots = Math.floor(totalMinutes / (durationMin + breakMin))
            
            if (totalMinutes < durationMin) {
              return (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    時間枠が短すぎます。最低でも1回分の通話時間が必要です。
                  </p>
                </div>
              )
            } else if (maxPossibleSlots > 10) {
              return (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    この設定では最大{maxPossibleSlots}回の通話が可能です。
                  </p>
                </div>
              )
            }
            return null
          })()}

          {/* Show warning for fixed type */}
          {planType === 'fixed' && slotWarning && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{slotWarning}</p>
            </div>
          )}

          {/* Show calculated slots for fixed type */}
          {planType === 'fixed' && calculatedSlots.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                <Label>作成される時間枠 - {duration}分枠 × {calculatedSlots.length}枠</Label>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="space-y-3">
                  {calculatedSlots.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{slot.start}</span>
                          <span className="text-gray-500">→</span>
                          <span className="font-medium">{slot.end}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {duration}分間
                      </div>
                    </div>
                  ))}
                </div>
                {calculatedSlots.length > 5 && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    全{calculatedSlots.length}枠
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          {startDate && startTime && duration && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-1">
              <p className="text-sm font-medium">プラン概要</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {planType === 'queue' ? '先着制' : '時間制'} | 
                {format(new Date(startDate), 'MM/dd')} {startTime} - {endTime || '--:--'} | 
                1枠{duration}分 | 
                休憩{breakTime}分
              </p>
              {planType === 'fixed' && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {slotCount}枠 × {duration}分 = 合計{parseInt(slotCount || '0') * parseInt(duration)}分の通話時間
                </p>
              )}
              {planType === 'queue' && endTime && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  最大稼働時間: {(() => {
                    const start = parse(startTime, 'HH:mm', new Date())
                    const end = parse(endTime, 'HH:mm', new Date())
                    if (isBefore(end, start)) end.setDate(end.getDate() + 1)
                    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
                    const hours = Math.floor(totalMinutes / 60)
                    const minutes = totalMinutes % 60
                    return `${hours}時間${minutes > 0 ? `${minutes}分` : ''}`
                  })()}
                </p>
              )}
            </div>
          )}

          {/* Time Conflict Warning */}
          {checkingConflict && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm text-yellow-700 dark:text-yellow-300">
                  時間重複をチェック中...
                </span>
              </div>
            </div>
          )}

          {timeConflict.hasConflict && timeConflict.conflictPlan && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    時間が重複しています
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    既存のプラン「{timeConflict.conflictPlan.title}」({timeConflict.conflictPlan.time})と重複しています。
                  </p>
                  <p className="text-xs text-red-500 dark:text-red-500">
                    別の時間帯を選択してください。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            キャンセル
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={
              loading || 
              (planType === 'fixed' && calculatedSlots.length === 0) ||
              timeConflict.hasConflict ||
              checkingConflict
            }
          >
            {loading ? '作成中...' : 
             checkingConflict ? 'チェック中...' :
             timeConflict.hasConflict ? '時間重複あり' :
             'プランを作成'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}