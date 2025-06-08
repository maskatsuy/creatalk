import { Video, Clock, Shield } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Video,
    title: '1対1のビデオ通話',
    description: '高品質なビデオ通話でクリエイターと直接対話できます',
    color: 'text-blue-500'
  },
  {
    icon: Clock,
    title: '柔軟な時間設定',
    description: '5分から60分まで、あなたの都合に合わせて通話時間を選べます',
    color: 'text-green-500'
  },
  {
    icon: Shield,
    title: '安心・安全',
    description: 'セキュアな環境で、プライバシーを守りながら交流できます',
    color: 'text-purple-500'
  }
]

export function FeaturesSection() {
  return (
    <section className="container max-w-6xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12">Creatalkの特徴</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <feature.icon className={`h-10 w-10 ${feature.color} mb-2`} />
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}