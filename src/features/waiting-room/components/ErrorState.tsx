import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ErrorStateProps {
  onBackToCallManagement: () => void
}

export function ErrorState({ onBackToCallManagement }: ErrorStateProps) {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
        <p>待機室が見つかりません</p>
        <Button onClick={onBackToCallManagement} className="mt-4">
          通話管理に戻る
        </Button>
      </div>
    </div>
  )
}