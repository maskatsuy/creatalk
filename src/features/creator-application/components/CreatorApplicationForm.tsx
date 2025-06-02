'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useAuthContext } from '@/features/auth'
import { CreatorApplicationFormData, initialFormData } from '../types'
import { submitCreatorApplication } from '../actions'
import { StepIndicator } from './StepIndicator'
import { BasicInfoStep } from './BasicInfoStep'
import { ActivityStep } from './ActivityStep'
import { ConfirmationStep } from './ConfirmationStep'

interface CreatorApplicationFormProps {
  userId: string
}

export function CreatorApplicationForm({ }: CreatorApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<CreatorApplicationFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuthContext()

  const updateFormData = (data: Partial<CreatorApplicationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    // ステップ1の必須項目チェック
    if (currentStep === 1) {
      if (!formData.display_name.trim() || !formData.category) {
        toast.error('必須項目を入力してください', {
          description: '表示名とカテゴリーは必須です。',
        })
        return
      }
    }
    // ステップ2の必須項目チェック
    else if (currentStep === 2) {
      if (!formData.content_plan.trim()) {
        toast.error('必須項目を入力してください', {
          description: '提供予定のコンテンツは必須です。',
        })
        return
      }
    }
    
    setCurrentStep(currentStep + 1)
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('handleSubmit called, currentStep:', currentStep)
    
    // ステップ3以外では送信しない
    if (currentStep !== 3) {
      console.log('Not on step 3, preventing submission')
      return
    }
    
    if (!formData.terms_agreed || !formData.age_verified) {
      toast.error('必須項目を確認してください', {
        description: '利用規約への同意と年齢確認が必要です。',
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (!user) {
        toast.error('認証エラー', {
          description: 'ログインしてから申請してください。',
        })
        return
      }

      // Server Actionを使用して申請を送信
      const result = await submitCreatorApplication(formData)

      if (result.success) {
        toast.success(result.message, {
          description: '審査結果は通常3営業日以内にメールでお知らせします。',
        })
        // フォームをリセット
        setFormData(initialFormData)
        setCurrentStep(1)
      } else {
        toast.error('エラーが発生しました', {
          description: result.error,
        })
      }
    } catch (error: unknown) {
      console.error('Submission error:', error)
      toast.error('エラーが発生しました', {
        description: 'もう一度お試しください。',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // フォーム送信をより厳密に制御
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Form submit prevented at step:', currentStep)
    
    // ステップ3かつ送信ボタンクリック時のみ処理
    if (currentStep === 3 && !isSubmitting) {
      handleSubmit(e)
    }
  }

  // Enterキーによる送信を防ぐ
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep !== 3) {
      e.preventDefault()
      console.log('Enter key prevented at step:', currentStep)
    }
  }

  return (
    <form onSubmit={handleFormSubmit} onKeyDown={handleKeyDown} className="space-y-8">
      <StepIndicator currentStep={currentStep} />

      {/* ステップ1: 基本情報 */}
      {currentStep === 1 && (
        <BasicInfoStep formData={formData} onChange={updateFormData} />
      )}

      {/* ステップ2: 活動内容 */}
      {currentStep === 2 && (
        <ActivityStep formData={formData} onChange={updateFormData} />
      )}

      {/* ステップ3: 確認 */}
      {currentStep === 3 && (
        <ConfirmationStep formData={formData} onChange={updateFormData} />
      )}

      {/* ナビゲーションボタン */}
      <div className="flex justify-between gap-4">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={isSubmitting}
          >
            前へ
          </Button>
        )}
        
        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={handleNext}
            className="ml-auto"
          >
            次へ
          </Button>
        ) : (
          <Button 
            type="submit" 
            disabled={isSubmitting || !formData.terms_agreed || !formData.age_verified}
            className="ml-auto"
            size="lg"
          >
            {isSubmitting ? '送信中...' : '申請を送信する'}
          </Button>
        )}
      </div>
    </form>
  )
}