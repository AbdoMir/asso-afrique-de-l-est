import type { Metadata } from 'next'
import { ContactPage } from '@/components/pages/ContactPage'
import { getDictionary } from '@/lib/dictionaries'
import { alternatesFor } from '@/lib/i18n'

const t = getDictionary('fr').pages.contact

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  alternates: alternatesFor('contact', 'fr'),
}

export default function Page() {
  return <ContactPage locale="fr" />
}
