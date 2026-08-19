import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HomePage } from '@/components/pages/HomePage'
import { getDictionary } from '@/lib/dictionaries'
import { alternatesFor, isLocale } from '@/lib/i18n'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  const t = getDictionary(locale).home

  return {
    title: t.meta.title,
    description: t.meta.description,
    // Mêmes balises hreflang que la version française : les trois accueils se
    // désignent mutuellement, aucun ne concurrence les autres.
    alternates: alternatesFor('home', locale),
  }
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return <HomePage locale={locale} />
}
