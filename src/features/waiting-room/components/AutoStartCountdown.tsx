import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

interface AutoStartCountdownProps {
  countdown: number | null
  onCancel: () => void
}

export function AutoStartCountdown({ countdown, onCancel }: AutoStartCountdownProps) {
  if (countdown === null) return null

  return (
    <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 mb-6">
      <CardContent className="p-6 text-center">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Play className="h-6 w-6 text-green-600 animate-pulse" />
            <h3 className="text-xl font-bold text-green-700 dark:text-green-400">
              まもなく通話が始まります
            </h3>
          </div>
          <div className="text-6xl font-bold text-green-600 dark:text-green-400 font-mono">
            {countdown}
          </div>
          <p className="text-sm text-green-600 dark:text-green-500">
            自動的にビデオ通話が開始されます
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="border-green-300 text-green-700 hover:bg-green-100"
          >
            キャンセル
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}