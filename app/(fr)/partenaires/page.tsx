import type { Metadata } from 'next'
import { PartnersPage } from '@/components/pages/PartnersPage'
import { getDictionary } from '@/lib/dictionaries'
import { alternatesFor } from '@/lib/i18n'

const t = getDictionary('fr').pages.partners

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  alternates: alternatesFor('partners', 'fr'),
}

export default function Page() {
  return <PartnersPage locale="fr" />
}
