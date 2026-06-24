'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Heart, ChevronDown, Globe } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const navigation = [
  { label: 'Accueil', href: '/' },
  { label: 'Qui sommes-nous', href: '/qui-sommes-nous' },
  {
    label: 'Nos actions',
    href: '/nos-actions',
    children: [
      { label: 'Toutes nos actions', href: '/nos-actions' },
      { label: 'Traduction', href: '/nos-focus#traduction' },
      { label: 'Jeunesse', href: '/nos-focus#jeunesse' },
      { label: 'Emploi', href: '/nos-focus#emploi' },
    ],
  },
  { label: 'Nos focus', href: '/nos-focus' },
  { label: 'Partenaires', href: '/partenaires' },
  { label: 'Contact', href: '/contact' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileOpen(false)
    setOpenDropdown(null)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobileOpen])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-warm-100'
          : 'bg-white/80 backdrop-blur-sm'
      )}
      role="banner"
    >
      <nav
        className="container-custom flex items-center justify-between h-18 py-3"
        aria-label="Navigation principale"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="Accueil — Association Afrique de l'Est et ses amis"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-warm transition-transform group-hover:scale-105">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="font-display font-bold text-warm-900 text-sm leading-tight">
              Afrique de l&apos;Est
            </p>
            <p className="text-primary-500 text-xs font-medium">et ses amis</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex items-center gap-1" role="list">
          {navigation.map((item) => (
            <li key={item.href} className="relative">
              {item.children ? (
                <div
                  onMouseEnter={() => setOpenDropdown(item.href)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    className={cn(
                      'nav-link px-3 py-2 rounded-lg flex items-center gap-1 text-sm',
                      pathname.startsWith(item.href) && 'nav-link-active text-primary-600'
                    )}
                    aria-expanded={openDropdown === item.href}
                    aria-haspopup="true"
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 transition-transform duration-200',
                        openDropdown === item.href && 'rotate-180'
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {openDropdown === item.href && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-card-hover border border-warm-100 overflow-hidden py-1"
                        role="menu"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm text-warm-700 hover:bg-warm-50 hover:text-primary-600 transition-colors"
                            role="menuitem"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'nav-link px-3 py-2 rounded-lg block text-sm',
                    (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)))
                      && 'nav-link-active text-primary-600'
                  )}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* CTA + Mobile menu button */}
        <div className="flex items-center gap-3">
          <Link href="/adherer-soutenir" className="hidden sm:block">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Heart className="w-4 h-4" />}
              className="whitespace-nowrap"
            >
              Faire un don
            </Button>
          </Link>

          <Link href="/adherer-soutenir" className="hidden sm:hidden">
            <Button variant="outline" size="sm">
              Adhérer
            </Button>
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-warm-100 transition-colors"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isMobileOpen ? (
              <X className="w-6 h-6 text-warm-700" />
            ) : (
              <Menu className="w-6 h-6 text-warm-700" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden border-t border-warm-100 bg-white overflow-hidden"
          >
            <div className="container-custom py-4 space-y-1">
              {navigation.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'block px-4 py-3 rounded-xl text-base font-medium transition-colors',
                      (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)))
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-warm-700 hover:bg-warm-50 hover:text-primary-600'
                    )}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.slice(1).map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 rounded-lg text-sm text-warm-600 hover:bg-warm-50 hover:text-primary-600 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4 pb-2">
                <Link href="/adherer-soutenir" className="block">
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Heart className="w-5 h-5" />}
                    className="w-full"
                  >
                    Faire un don mensuel
                  </Button>
                </Link>
                <Link href="/adherer-soutenir" className="block mt-2">
                  <Button variant="outline" size="md" className="w-full">
                    Adhérer à l&apos;association
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
