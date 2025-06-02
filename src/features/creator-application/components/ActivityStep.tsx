import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Briefcase, Globe, FileText, Calendar, DollarSign, Info } from 'lucide-react'
import { CreatorApplicationFormData } from '../types'

interface ActivityStepProps {
  formData: CreatorApplicationFormData
  onChange: (data: Partial<CreatorApplicationFormData>) => void
}

export function ActivityStep({ formData, onChange }: ActivityStepProps) {
  return (
    <>
      {/* 活動経験セクション */}
      <div className="space-y-6 border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Briefcase className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">活動経験</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">
            これまでの活動実績
          </Label>
          <Textarea
            id="experience"
            placeholder="配信経験、指導経験、実績などを具体的に記載してください"
            value={formData.experience}
            onChange={(e) => onChange({ experience: e.target.value })}
            className="min-h-[120px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="portfolio_url">
            ポートフォリオURL
          </Label>
          <Input
            id="portfolio_url"
            type="url"
            placeholder="https://example.com"
            value={formData.portfolio_url}
            onChange={(e) => onChange({ portfolio_url: e.target.value })}
          />
        </div>
      </div>

      {/* SNSリンクセクション */}
      <div className="space-y-6 border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">SNSアカウント</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="social_twitter">Twitter/X</Label>
            <Input
              id="social_twitter"
              placeholder="@username"
              value={formData.social_twitter}
              onChange={(e) => onChange({ social_twitter: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_instagram">Instagram</Label>
            <Input
              id="social_instagram"
              placeholder="@username"
              value={formData.social_instagram}
              onChange={(e) => onChange({ social_instagram: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_youtube">YouTube</Label>
            <Input
              id="social_youtube"
              placeholder="チャンネルURL"
              value={formData.social_youtube}
              onChange={(e) => onChange({ social_youtube: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social_other">その他</Label>
            <Input
              id="social_other"
              placeholder="その他のSNS・サイト"
              value={formData.social_other}
              onChange={(e) => onChange({ social_other: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* 活動計画セクション */}
      <div className="space-y-6 border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">活動計画</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content_plan">
            提供予定のコンテンツ <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="content_plan"
            placeholder="どのようなビデオ通話サービスを提供する予定か具体的に記載してください"
            value={formData.content_plan}
            onChange={(e) => onChange({ content_plan: e.target.value })}
            className="min-h-[120px]"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="availability">
              <Calendar className="inline w-4 h-4 mr-1" />
              活動可能時間
            </Label>
            <Input
              id="availability"
              placeholder="例：平日夜間、週末午後"
              value={formData.availability}
              onChange={(e) => onChange({ availability: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricing_plan">
              <DollarSign className="inline w-4 h-4 mr-1" />
              料金設定の予定
            </Label>
            <Input
              id="pricing_plan"
              placeholder="例：30分3,000円〜"
              value={formData.pricing_plan}
              onChange={(e) => onChange({ pricing_plan: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* 追加メッセージセクション */}
      <div className="space-y-6 border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">補足事項</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">
            審査担当者へのメッセージ
          </Label>
          <Textarea
            id="message"
            placeholder="その他、アピールポイントや質問事項があれば記載してください"
            value={formData.message}
            onChange={(e) => onChange({ message: e.target.value })}
            className="min-h-[100px]"
          />
        </div>
      </div>
    </>
  )
}