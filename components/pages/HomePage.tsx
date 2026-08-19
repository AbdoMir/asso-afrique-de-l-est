import { HeroSection } from '@/components/sections/HeroSection'
import { ImpactSection } from '@/components/sections/ImpactSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { ActionsPreview } from '@/components/sections/ActionsPreview'
import { FocusPreview } from '@/components/sections/FocusPreview'
import { NewsletterSection } from '@/components/sections/NewsletterSection'
import { DonationCTASection } from '@/components/sections/DonationCTASection'
import { getDictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n'

/**
 * Accueil, identique dans les trois langues.
 *
 * Une seule composition pour /, /en et /ar : une section ajoutée ou déplacée
 * ici l'est partout, ce qui évite que les versions traduites divergent
 * silencieusement de la française.
 */
export function HomePage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).home

  return (
    <>
      <HeroSection dict={t.hero} locale={locale} />
      <ActionsPreview dict={t.actions} locale={locale} />
      <ImpactSection dict={t.impact} locale={locale} />
      <FocusPreview dict={t.focus} locale={locale} />
      <TestimonialsSection dict={t.testimonials} />
      <DonationCTASection dict={t.donationCta} locale={locale} />
      <NewsletterSection dict={t.newsletter} />
    </>
  )
}
