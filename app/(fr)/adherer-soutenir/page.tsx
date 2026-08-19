import type { Metadata } from 'next'
import { SupportPage } from '@/components/pages/SupportPage'
import { getDictionary } from '@/lib/dictionaries'
import { alternatesFor } from '@/lib/i18n'

const t = getDictionary('fr').pages.support

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  alternates: alternatesFor('support', 'fr'),
}

export default function Page() {
  return <SupportPage locale="fr" />
}
