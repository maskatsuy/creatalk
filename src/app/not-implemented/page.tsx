'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Construction, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotImplementedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-12 pb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-6">
            <Construction className="h-10 w-10 text-orange-600 dark:text-orange-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            この機能は準備中です
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            申し訳ございません。この機能は現在開発中です。<br />
            もうしばらくお待ちください。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="default"
              asChild
              className="gap-2"
            >
              <Link href="/">
                <Home className="h-4 w-4" />
                ホームに戻る
              </Link>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              前のページに戻る
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

