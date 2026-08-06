import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PrivacyNoticeProps {
  /** Ce à quoi servent les données — la finalité, en une phrase. */
  purpose: string
  /** Combien de temps elles sont conservées. Doit correspondre à lib/retention.ts. */
  retention: string
  /** Sur fond sombre, le texte gris clair devient illisible. */
  tone?: 'light' | 'dark'
  className?: string
}

/**
 * Mention d'information affichée sous un formulaire.
 *
 * L'art. 13 du RGPD impose d'informer la personne **au moment de la collecte**,
 * pas seulement dans une page de politique atteignable depuis le pied de site.
 * Ce bloc porte le minimum exigible — finalité, durée, droits, lien vers la
 * politique complète — et doit accompagner chaque point de collecte.
 */
export function PrivacyNotice({
  purpose,
  retention,
  tone = 'light',
  className,
}: PrivacyNoticeProps) {
  const isDark = tone === 'dark'

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 text-xs leading-relaxed',
        isDark ? 'text-warm-400' : 'text-warm-500',
        className
      )}
    >
      <ShieldCheck
        className={cn('w-4 h-4 shrink-0 mt-0.5', isDark ? 'text-warm-500' : 'text-warm-400')}
        aria-hidden="true"
      />
      <p>
        Les informations saisies sont utilisées {purpose} et conservées{' '}
        {retention}. Elles sont destinées à l&apos;Association Afrique de
        l&apos;Est et ses amis, et ne sont jamais revendues. Vous disposez
        d&apos;un droit d&apos;accès, de rectification, d&apos;effacement,
        d&apos;opposition et de portabilité —{' '}
        <Link
          href="/legal/confidentialite"
          className={cn(
            'underline underline-offset-2 transition-colors',
            isDark ? 'hover:text-primary-400' : 'hover:text-primary-500'
          )}
        >
          en savoir plus
        </Link>
        .
      </p>
    </div>
  )
}
