import type { Metadata } from 'next'
import { HomePage } from '@/components/pages/HomePage'
import { getDictionary } from '@/lib/dictionaries'
import { alternatesFor } from '@/lib/i18n'

const t = getDictionary('fr').home

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  // `alternatesFor` produit le canonical **et** les balises hreflang des trois
  // langues : Google comprend alors que /, /en et /ar sont la même page
  // traduite, et non trois pages qui se concurrencent.
  alternates: alternatesFor('home', 'fr'),
}

export default function Page() {
  return <HomePage locale="fr" />
}
