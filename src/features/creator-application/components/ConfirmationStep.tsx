import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Info, CheckCircle2, AlertCircle } from 'lucide-react'
import { CreatorApplicationFormData, categories } from '../types'

interface ConfirmationStepProps {
  formData: CreatorApplicationFormData
  onChange: (data: Partial<CreatorApplicationFormData>) => void
}

export function ConfirmationStep({ formData, onChange }: ConfirmationStepProps) {
  return (
    <>
      {/* 入力内容の確認 */}
      <div className="space-y-6 border rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">入力内容の確認</h3>
        </div>

        <div className="space-y-4">
          {/* 基本情報 */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">基本情報</h4>
            <div className="bg-gray-50 rounded-md p-3 space-y-2">
              <div className="flex">
                <span className="text-sm text-gray-600 w-32">表示名:</span>
                <span className="text-sm font-medium">{formData.display_name || '未入力'}</span>
              </div>
              <div className="flex">
                <span className="text-sm text-gray-600 w-32">カテゴリー:</span>
                <span className="text-sm font-medium">
                  {categories.find(cat => cat.value === formData.category)?.label || '未選択'}
                </span>
              </div>
              {formData.bio && (
                <div className="flex">
                  <span className="text-sm text-gray-600 w-32">自己紹介:</span>
                  <span className="text-sm">{formData.bio}</span>
                </div>
              )}
              {formData.specialty && (
                <div className="flex">
                  <span className="text-sm text-gray-600 w-32">専門スキル:</span>
                  <span className="text-sm">{formData.specialty}</span>
                </div>
              )}
            </div>
          </div>

          {/* 活動計画 */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">活動計画</h4>
            <div className="bg-gray-50 rounded-md p-3 space-y-2">
              <div>
                <span className="text-sm text-gray-600">提供予定のコンテンツ:</span>
                <p className="text-sm mt-1">{formData.content_plan || '未入力'}</p>
              </div>
              {formData.availability && (
                <div className="flex">
                  <span className="text-sm text-gray-600 w-32">活動可能時間:</span>
                  <span className="text-sm">{formData.availability}</span>
                </div>
              )}
              {formData.pricing_plan && (
                <div className="flex">
                  <span className="text-sm text-gray-600 w-32">料金設定:</span>
                  <span className="text-sm">{formData.pricing_plan}</span>
                </div>
              )}
            </div>
          </div>

          {/* SNS・ポートフォリオ */}
          {(formData.portfolio_url || formData.social_twitter || formData.social_instagram || formData.social_youtube || formData.social_other) && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">SNS・ポートフォリオ</h4>
              <div className="bg-gray-50 rounded-md p-3 space-y-2">
                {formData.portfolio_url && (
                  <div className="flex">
                    <span className="text-sm text-gray-600 w-32">ポートフォリオ:</span>
                    <a href={formData.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      {formData.portfolio_url}
                    </a>
                  </div>
                )}
                {formData.social_twitter && (
                  <div className="flex">
                    <span className="text-sm text-gray-600 w-32">Twitter/X:</span>
                    <span className="text-sm">{formData.social_twitter}</span>
                  </div>
                )}
                {formData.social_instagram && (
                  <div className="flex">
                    <span className="text-sm text-gray-600 w-32">Instagram:</span>
                    <span className="text-sm">{formData.social_instagram}</span>
                  </div>
                )}
                {formData.social_youtube && (
                  <div className="flex">
                    <span className="text-sm text-gray-600 w-32">YouTube:</span>
                    <span className="text-sm">{formData.social_youtube}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 確認事項セクション */}
      <div className="space-y-4 border rounded-lg p-6 bg-gray-50">
        <div className="flex items-center space-x-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">確認事項</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="age_verified"
              checked={formData.age_verified}
              onCheckedChange={(checked) => 
                onChange({ age_verified: checked as boolean })
              }
              onClick={(e) => e.stopPropagation()}
            />
            <div className="space-y-1">
              <Label htmlFor="age_verified" className="cursor-pointer">
                年齢確認 <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-gray-600">
                私は18歳以上であることを確認します。
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms_agreed"
              checked={formData.terms_agreed}
              onCheckedChange={(checked) => 
                onChange({ terms_agreed: checked as boolean })
              }
              onClick={(e) => e.stopPropagation()}
            />
            <div className="space-y-1">
              <Label htmlFor="terms_agreed" className="cursor-pointer">
                利用規約への同意 <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-gray-600">
                <a href="/terms" className="text-primary hover:underline" target="_blank">
                  クリエイター利用規約
                </a>
                を読み、内容に同意します。
              </p>
            </div>
          </div>
        </div>

        {(!formData.age_verified || !formData.terms_agreed) && (
          <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-md">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">確認事項にチェックを入れてください</p>
          </div>
        )}
      </div>
    </>
  )
}