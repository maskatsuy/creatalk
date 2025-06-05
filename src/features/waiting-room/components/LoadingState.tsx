import { RefreshCw } from 'lucide-react'

export function LoadingState() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>待機室を準備中...</p>
      </div>
    </div>
  )
}