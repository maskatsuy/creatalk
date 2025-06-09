'use client'

import { MessageSquare } from 'lucide-react'

export function CallSidebar() {
  return (
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
  )
}