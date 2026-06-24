import type { Metadata } from 'next'
import { HeroSection } from '@/components/sections/HeroSection'
import { ImpactSection } from '@/components/sections/ImpactSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { ActionsPreview } from '@/components/sections/ActionsPreview'
import { FocusPreview } from '@/components/sections/FocusPreview'
import { NewsletterSection } from '@/components/sections/NewsletterSection'
import { DonationCTASection } from '@/components/sections/DonationCTASection'

export const metadata: Metadata = {
  title: "Association Afrique de l'Est et ses amis — Intégration en France",
  description:
    "Association loi 1901 accompagnant les familles d'Afrique de l'Est dans leur intégration en France. Cours de français (FLE), aide à la jeunesse, emploi, traduction.",
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ImpactSection />
      <ActionsPreview />
      <FocusPreview />
      <TestimonialsSection />
      <DonationCTASection />
      <NewsletterSection />
    </>
  )
}
