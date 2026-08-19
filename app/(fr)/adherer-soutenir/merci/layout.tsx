import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Merci',
  robots: { index: false, follow: false },
}

export default function MerciLayout({ children }: { children: React.ReactNode }) {
  return children
}
