import type { Metadata } from 'next'
import { AppointmentPage } from '@/components/pages/AppointmentPage'
import { getDictionary } from '@/lib/dictionaries'
import { alternatesFor } from '@/lib/i18n'

const t = getDictionary('fr').pages.appointment

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  alternates: alternatesFor('appointment', 'fr'),
}

export default function Page() {
  return <AppointmentPage locale="fr" />
}
