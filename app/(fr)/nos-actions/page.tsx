import type { Metadata } from 'next'
import { ActionsPage } from '@/components/pages/ActionsPage'
import { getDictionary } from '@/lib/dictionaries'
import { alternatesFor } from '@/lib/i18n'

const t = getDictionary('fr').pages.actions

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  alternates: alternatesFor('actions', 'fr'),
}

export default function Page() {
  return <ActionsPage locale="fr" />
}
