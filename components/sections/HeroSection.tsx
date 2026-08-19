'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, ArrowRight, Users, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { pathFor, type Locale } from '@/lib/i18n'
import type { Dictionary } from '@/lib/dictionaries'

type HeroDict = Dictionary['home']['hero']

/** Les noms de pays viennent du dictionnaire ; seul le code reste ici. */
const ORIGIN_CHIPS: { code: keyof HeroDict['origins']; color: string }[] = [
  { code: 'DJ', color: 'bg-primary-500' },
  { code: 'SO', color: 'bg-secondary-500' },
  { code: 'ET', color: 'bg-accent-500' },
  { code: 'SL', color: 'bg-warm-900' },
  { code: 'ER', color: 'bg-primary-700' },
  { code: 'SD', color: 'bg-secondary-700' },
]

function Squiggle({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 14"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M2 10 Q 30 0, 55 9 T 105 9 T 155 9 T 198 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function HeroSection({ dict, locale }: { dict: HeroDict; locale: Locale }) {
  return (
    <section className="hero-bg relative overflow-hidden" aria-label="Hero">
      <div className="container-custom relative z-10 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Texte */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-6">
                <MapPin className="w-4 h-4" />
                {dict.badge}
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              className="font-display font-black text-warm-900 mb-6 text-balance"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {dict.titleBefore}{' '}
              <span className="relative inline-block">
                <span className="gradient-text">{dict.titleHighlight}</span>
                <Squiggle className="absolute left-0 -bottom-2 w-full h-3 text-accent-500" />
              </span>{' '}
              {dict.titleAfter}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl text-warm-600 leading-relaxed mb-10 max-w-xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {dict.subtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-12"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link href={`${pathFor('support', locale)}#don-mensuel`}>
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Heart className="w-5 h-5" />}
                  className="w-full sm:w-auto"
                >
                  {dict.ctaPrimary}
                </Button>
              </Link>
              <Link href={pathFor('about', locale)}>
                <Button
                  variant="outline"
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="w-full sm:w-auto"
                >
                  {dict.ctaSecondary}
                </Button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              className="flex flex-wrap items-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {/* Origin chips */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {ORIGIN_CHIPS.map((origin, i) => (
                    <div
                      key={i}
                      title={dict.origins[origin.code]}
                      className={`w-10 h-10 rounded-full ${origin.color} border-2 border-warm-50 flex items-center justify-center text-[11px] font-bold text-white`}
                    >
                      {origin.code}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-warm-900 text-sm">{dict.familiesCount}</p>
                  <p className="text-warm-500 text-xs">{dict.familiesTrust}</p>
                </div>
              </div>

              <div className="h-8 w-px bg-warm-200" />

              {/* Rating */}
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-accent-500 text-lg">★</span>
                  ))}
                </div>
                <p className="text-warm-500 text-xs">{dict.recognised}</p>
              </div>
            </motion.div>
          </div>

          {/* Visuel */}
          <motion.div
            className="relative mx-auto w-full max-w-md lg:max-w-none"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            {/* Formes organiques derrière la photo */}
            <div className="absolute -top-8 -left-8 w-48 h-48 bg-accent-200 blob-2" aria-hidden="true" />
            <div className="absolute -bottom-10 -right-6 w-56 h-56 bg-secondary-200 blob-3" aria-hidden="true" />

            {/* Photo */}
            <div className="relative blob-1 overflow-hidden shadow-blob aspect-[4/5] w-full">
              <Image
                src="/images/stock/hero_image.jpeg"
                alt={dict.photoAlt}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 480px, 384px"
              />
            </div>

            {/* Chips flottants */}
            <motion.div
              className="absolute top-6 -left-6 md:-left-10"
              animate={{ y: [-8, 8, -8] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            >
              <div className="bg-white rounded-2xl p-3.5 shadow-card border border-warm-100 w-44">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-secondary-100 flex items-center justify-center shrink-0">
                    <Users className="w-4.5 h-4.5 text-secondary-600" />
                  </div>
                  <div>
                    <p className="font-bold text-warm-900 text-base leading-none">120</p>
                    <p className="text-warm-500 text-[11px]">familles accompagnées</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-10 -right-4 md:-right-10"
              animate={{ y: [8, -8, 8] }}
              transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 1 }}
            >
              <div className="bg-accent-500 rounded-2xl p-3.5 shadow-card w-36">
                <p className="text-warm-900 font-black text-lg leading-none">66%</p>
                <p className="text-warm-900/80 text-[11px] font-medium">déductibles des impôts</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
