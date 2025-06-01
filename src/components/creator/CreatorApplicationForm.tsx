'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Database } from '@/types/database'

interface CreatorApplicationFormProps {
  userId: string
}

export function CreatorApplicationForm({ userId }: CreatorApplicationFormProps) {
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientComponentClient<Database>()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('creator_applications')
        .insert([
          {
            user_id: userId,
            message,
          },
        ])

      if (error) throw error

      toast.success('申請を受け付けました', {
        description: '審査結果をお待ちください。',
      })

      // フォームをリセット
      setMessage('')
    } catch (error) {
      toast.error('エラーが発生しました', {
        description: 'もう一度お試しください。',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="message"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          申請メッセージ
        </label>
        <Textarea
          id="message"
          placeholder="クリエイターとして活動したい理由や、提供したいコンテンツについて教えてください。"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="min-h-[200px]"
        />
      </div>
      <Button type="submit" disabled={isSubmitting || !message.trim()}>
        {isSubmitting ? '送信中...' : '申請する'}
      </Button>
    </form>
  )
} 