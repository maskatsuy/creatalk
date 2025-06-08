import { Star, MessageCircle, Users, Award } from 'lucide-react'
import type { CreatorStats as CreatorStatsType } from '../types'

interface CreatorStatsProps {
  stats: CreatorStatsType
}

export function CreatorStats({ stats }: CreatorStatsProps) {
  const statItems = [
    {
      icon: Award,
      label: '総通話回数',
      value: stats.total_calls.toLocaleString(),
      color: 'text-blue-600'
    },
    {
      icon: Star,
      label: '平均評価',
      value: stats.average_rating.toFixed(1),
      color: 'text-yellow-600'
    },
    {
      icon: MessageCircle,
      label: 'レスポンス率',
      value: `${stats.response_rate}%`,
      color: 'text-green-600'
    },
    {
      icon: Users,
      label: 'フォロワー',
      value: stats.follower_count.toLocaleString(),
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon
        return (
          <div key={index} className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${item.color}`} />
            <div>
              <p className="text-sm font-medium">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}