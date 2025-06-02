import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { User } from 'lucide-react'
import { CreatorApplicationFormData, categories } from '../types'

interface BasicInfoStepProps {
  formData: CreatorApplicationFormData
  onChange: (data: Partial<CreatorApplicationFormData>) => void
}

export function BasicInfoStep({ formData, onChange }: BasicInfoStepProps) {
  return (
    <div className="space-y-6 border rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <User className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">基本情報</h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="display_name">
            表示名 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="display_name"
            placeholder="クリエイター名を入力"
            value={formData.display_name}
            onChange={(e) => onChange({ display_name: e.target.value })}
            required
            className="max-w-md"
          />
          <p className="text-xs text-gray-500">ファンに表示される名前です</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">
            カテゴリー <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formData.category}
            onValueChange={(value) => onChange({ category: value })}
            required
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <div key={cat.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={cat.value} id={cat.value} />
                  <Label htmlFor={cat.value} className="text-sm cursor-pointer whitespace-nowrap">
                    {cat.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">
          自己紹介
        </Label>
        <Textarea
          id="bio"
          placeholder="あなたについて教えてください（最大500文字）"
          value={formData.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          className="min-h-[100px]"
          maxLength={500}
        />
        <p className="text-xs text-gray-500">{formData.bio.length}/500</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialty">
          得意分野・専門スキル
        </Label>
        <Input
          id="specialty"
          placeholder="例：FPSゲーム、React開発、ボイストレーニング"
          value={formData.specialty}
          onChange={(e) => onChange({ specialty: e.target.value })}
        />
      </div>
    </div>
  )
}