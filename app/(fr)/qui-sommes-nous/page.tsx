import type { Metadata } from 'next'
import { AboutPage } from '@/components/pages/AboutPage'
import { getDictionary } from '@/lib/dictionaries'
import { alternatesFor } from '@/lib/i18n'

const t = getDictionary('fr').pages.about

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  alternates: alternatesFor('about', 'fr'),
}

export default function Page() {
  return <AboutPage locale="fr" />
}
