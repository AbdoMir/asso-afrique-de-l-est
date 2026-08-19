import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Espace adhérent',
  robots: { index: false, follow: false },
}

export default function EspaceAdherentLayout({ children }: { children: React.ReactNode }) {
  return children
}
