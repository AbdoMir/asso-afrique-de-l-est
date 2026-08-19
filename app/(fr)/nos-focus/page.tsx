import type { Metadata } from 'next'
import { FocusPage } from '@/components/pages/FocusPage'
import { getDictionary } from '@/lib/dictionaries'
import { alternatesFor } from '@/lib/i18n'

const t = getDictionary('fr').pages.focus

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  alternates: alternatesFor('focus', 'fr'),
}

export default function Page() {
  return <FocusPage locale="fr" />
}
