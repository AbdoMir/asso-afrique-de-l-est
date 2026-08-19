'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Globe, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LOCALES,
  LOCALE_LABELS,
  LOCALE_SHORT,
  LOCALE_TAGS,
  pageFromPath,
  pathFor,
  TRANSLATED_PAGES,
  type Locale,
} from '@/lib/i18n'

/**
 * Sélecteur de langue, en menu déroulant.
 *
 * Les trois noms affichés côte à côte occupaient près de 200 px et faisaient
 * passer la navigation sur deux lignes. Réduit au code de la langue courante,
 * le sélecteur tient dans la barre ; les noms entiers — chacun écrit dans sa
 * propre langue — restent lisibles une fois le menu ouvert.
 *
 * Chaque lien pointe vers la même page dans la langue visée. Les pages non
 * encore traduites n'ont pas d'équivalent : le lien mène alors à l'accueil de
 * la langue choisie, plutôt que de paraître inerte en revenant au français.
 */
export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname()
  const current = pageFromPath(pathname)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => setIsOpen(false), [pathname])

  // Sans cela, le menu resterait ouvert après un clic ailleurs dans la page.
  useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onEscape)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={label}
        className="flex items-center gap-1 px-2 py-2 rounded-lg text-sm font-semibold text-warm-600 hover:text-primary-600 hover:bg-warm-50 transition-colors"
      >
        <Globe className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>{LOCALE_SHORT[locale]}</span>
        {/* Le chevron ne s'affiche qu'à partir de xl : en dessous, la barre est
            déjà à l'étroit et le globe suffit à désigner un choix de langue. */}
        <ChevronDown
          className={cn(
            'hidden xl:block w-3.5 h-3.5 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className="absolute top-full right-0 mt-1 w-36 bg-white rounded-xl shadow-card-hover border border-warm-100 overflow-hidden py-1 z-50"
          >
            {LOCALES.map((target) => {
              const isCurrent = target === locale
              const translated = current && TRANSLATED_PAGES[current.page].includes(target)
              const href = translated ? pathFor(current.page, target) : pathFor('home', target)

              return (
                <li key={target}>
                  <Link
                    href={href}
                    hrefLang={LOCALE_TAGS[target]}
                    lang={LOCALE_TAGS[target]}
                    role="menuitem"
                    aria-current={isCurrent ? 'true' : undefined}
                    className={cn(
                      'block px-4 py-2.5 text-sm transition-colors hover:bg-warm-50',
                      isCurrent
                        ? 'text-primary-600 font-semibold'
                        : 'text-warm-700 hover:text-primary-600'
                    )}
                  >
                    {LOCALE_LABELS[target]}
                  </Link>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
