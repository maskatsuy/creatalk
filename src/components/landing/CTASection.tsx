import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="container max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">
          今すぐCreatalkを始めよう
        </h2>
        <p className="text-xl mb-6 opacity-90">
          あなたの好きなクリエイターとの特別な時間が待っています
        </p>
        <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-4">
          <Link href="/signup">無料でアカウント作成</Link>
        </Button>
      </div>
    </section>
  )
}