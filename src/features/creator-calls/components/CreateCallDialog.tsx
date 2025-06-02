'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Plus, Video, Calendar, Phone, Users } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface CreateCallDialogProps {
  onCallCreated?: () => void
}

export function CreateCallDialog({ onCallCreated }: CreateCallDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [callType, setCallType] = useState<'immediate' | 'scheduled'>('immediate')
  const [participantEmail, setParticipantEmail] = useState('')
  const [callMode, setCallMode] = useState<'video' | 'audio'>('video')
  const [duration, setDuration] = useState('30')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [enableRecording, setEnableRecording] = useState(false)
  const [description, setDescription] = useState('')

  const handleSubmit = async () => {
    // Validation
    if (!participantEmail) {
      toast.error('参加者のメールアドレスを入力してください')
      return
    }

    if (callType === 'scheduled' && (!scheduledDate || !scheduledTime)) {
      toast.error('日時を選択してください')
      return
    }

    setLoading(true)

    try {
      if (callType === 'immediate') {
        // TODO: Create immediate call room
        toast.success('通話室を作成しました')
        
        // Mock navigation to call room
        router.push(`/call/room/${Date.now()}`)
      } else {
        // TODO: Create scheduled call
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
        
        toast.success(
          `${format(scheduledDateTime, 'M月d日 HH:mm', { locale: ja })}に通話を予約しました`
        )
        
        onCallCreated?.()
      }
      
      setOpen(false)
      resetForm()
    } catch {
      toast.error('通話の作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setCallType('immediate')
    setParticipantEmail('')
    setCallMode('video')
    setDuration('30')
    setScheduledDate('')
    setScheduledTime('')
    setEnableRecording(false)
    setDescription('')
  }

  // Get min date/time for scheduling
  const now = new Date()
  const minDate = format(now, 'yyyy-MM-dd')
  const minTime = format(now, 'HH:mm')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          新しい通話を作成
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新しい通話を作成</DialogTitle>
          <DialogDescription>
            今すぐ通話を開始するか、後で通話をスケジュールできます
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Call Type Selection */}
          <RadioGroup value={callType} onValueChange={(value) => setCallType(value as 'immediate' | 'scheduled')}>
            <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
              <RadioGroupItem value="immediate" id="immediate" />
              <Label htmlFor="immediate" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-green-600" />
                  <span className="font-medium">今すぐ開始</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  すぐに通話室を作成して開始します
                </p>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
              <RadioGroupItem value="scheduled" id="scheduled" />
              <Label htmlFor="scheduled" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">スケジュール予約</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  指定した日時に通話を予約します
                </p>
              </Label>
            </div>
          </RadioGroup>

          {/* Participant Email */}
          <div className="space-y-2">
            <Label htmlFor="email">参加者のメールアドレス</Label>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={participantEmail}
                onChange={(e) => setParticipantEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Schedule Settings (only for scheduled calls) */}
          {callType === 'scheduled' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">日付</Label>
                  <Input
                    id="date"
                    type="date"
                    min={minDate}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">時刻</Label>
                  <Input
                    id="time"
                    type="time"
                    min={scheduledDate === minDate ? minTime : undefined}
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">通話時間</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15分</SelectItem>
                    <SelectItem value="30">30分</SelectItem>
                    <SelectItem value="45">45分</SelectItem>
                    <SelectItem value="60">60分</SelectItem>
                    <SelectItem value="90">90分</SelectItem>
                    <SelectItem value="120">120分</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Call Mode */}
          <div className="space-y-2">
            <Label>通話モード</Label>
            <RadioGroup value={callMode} onValueChange={(value) => setCallMode(value as 'video' | 'audio')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="video" id="video" />
                <Label htmlFor="video" className="flex items-center gap-2 cursor-pointer">
                  <Video className="h-4 w-4" />
                  ビデオ通話
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="audio" id="audio" />
                <Label htmlFor="audio" className="flex items-center gap-2 cursor-pointer">
                  <Phone className="h-4 w-4" />
                  音声通話のみ
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Recording Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="recording"
              checked={enableRecording}
              onCheckedChange={(checked) => setEnableRecording(checked as boolean)}
            />
            <Label htmlFor="recording" className="cursor-pointer">
              通話を録画する
            </Label>
          </div>

          {/* Description (optional) */}
          <div className="space-y-2">
            <Label htmlFor="description">説明（任意）</Label>
            <textarea
              id="description"
              className="w-full px-3 py-2 border rounded-md resize-none"
              rows={3}
              placeholder="通話の目的や議題など..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '作成中...' : callType === 'immediate' ? '通話を開始' : '予約する'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}