import Link from 'next/link'
import { Star, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ModernCreatorIllustration } from '@/components/illustrations/ModernCreatorIllustration'

const creatorBenefits = [
  {
    icon: Star,
    title: '収益化',
    description: 'あなたの時間と経験を収益に変えられます。価格設定も自由自在。',
    color: 'text-yellow-500'
  },
  {
    icon: Users,
    title: 'ユーザーとの深いつながり',
    description: '1対1の対話で、より深く学習・指導することができます。',
    color: 'text-blue-500'
  },
  {
    icon: Clock,
    title: '柔軟なスケジュール',
    description: 'あなたの都合に合わせて通話時間を設定できます。',
    color: 'text-green-500'
  }
]

const creatorSteps = [
  {
    step: 1,
    title: 'アカウント作成',
    description: '基本情報を登録',
    color: 'bg-purple-500'
  },
  {
    step: 2,
    title: 'クリエイター申請',
    description: '活動内容とプロフィールを提出',
    color: 'bg-pink-500'
  },
  {
    step: 3,
    title: '通話プラン設定',
    description: '料金・時間・内容を設定',
    color: 'bg-purple-600'
  },
  {
    step: 4,
    title: '収益開始',
    description: 'ファンとの通話で収益化',
    color: 'bg-pink-600'
  }
]

export function CreatorSection() {
  return (
    <section className="py-16">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-4">クリエイターの方へ</h2>
            <p className="text-gray-600 text-lg">あなたの時間を収益化し、ファンとの絆を深めよう</p>
          </div>
          <div className="flex justify-center">
            <ModernCreatorIllustration className="w-full max-w-md h-auto" />
          </div>
        </div>
        
        {/* クリエイターのメリット */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {creatorBenefits.map((benefit, index) => (
            <Card key={index}>
              <CardHeader>
                <benefit.icon className={`h-10 w-10 ${benefit.color} mb-2`} />
                <CardTitle>{benefit.title}</CardTitle>
                <CardDescription>
                  {benefit.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* クリエイター向け利用手順 */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center mb-8">クリエイターとして始める手順</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {creatorSteps.map((step) => (
              <div key={step.step} className="text-center">
                <div className={`w-12 h-12 ${step.color} text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold`}>
                  {step.step}
                </div>
                <h4 className="font-semibold mb-2">{step.title}</h4>
                <p className="text-sm text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Link href="/creator/apply">クリエイター申請を始める</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}