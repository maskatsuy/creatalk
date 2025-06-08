import {
  HeroSection,
  FeaturesSection,
  UserStepsSection,
  CreatorSection,
  CTASection,
  Footer
} from '@/components/landing'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <HeroSection />
      <FeaturesSection />
      <UserStepsSection />
      <CreatorSection />
      <CTASection />
      <Footer />
    </div>
  )
}