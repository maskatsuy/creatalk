import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ModernVideoCallIllustration } from '@/components/illustrations/ModernVideoCallIllustration'

export function HeroSection() {
  return (
    <section className="container max-w-6xl mx-auto px-4 py-16">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            クリエイターと話そう
          </h1>
          <p className="text-xl md:text-2xl text-gray-600">
            好きなクリエイターと1対1のビデオ通話で<br />
            より直接的で価値のある交流を実現します
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button asChild size="lg" className="text-lg px-8 py-4">
              <Link href="/signup">今すぐ始める</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4">
              <Link href="/login">クリエイターを探す</Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-center">
          <ModernVideoCallIllustration className="w-full max-w-lg h-auto" />
        </div>
      </div>
    </section>
  )
}