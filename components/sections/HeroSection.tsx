'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, ArrowRight, Users, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const ORIGIN_CHIPS = [
  { code: 'DJ', label: 'Djibouti', color: 'bg-primary-500' },
  { code: 'SO', label: 'Somalie', color: 'bg-secondary-500' },
  { code: 'ET', label: 'Éthiopie', color: 'bg-accent-500' },
  { code: 'SL', label: 'Somaliland', color: 'bg-warm-900' },
  { code: 'ER', label: 'Érythrée', color: 'bg-primary-700' },
  { code: 'SD', label: 'Soudan', color: 'bg-secondary-700' },
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

export function HeroSection() {
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
                Association loi 1901 — France
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              className="font-display font-black text-warm-900 mb-6 text-balance"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Ensemble, construisons{' '}
              <span className="relative inline-block">
                <span className="gradient-text">l&apos;avenir</span>
                <Squiggle className="absolute left-0 -bottom-2 w-full h-3 text-accent-500" />
              </span>{' '}
              des familles d&apos;Afrique de l&apos;Est en France
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl text-warm-600 leading-relaxed mb-10 max-w-xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Nous accompagnons les familles d&apos;Afrique de l&apos;Est dans leur intégration
              en France : cours de français (FLE), soutien jeunesse, aide à l&apos;emploi
              et services de traduction.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-12"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link href="/adherer-soutenir#don-mensuel">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Heart className="w-5 h-5" />}
                  className="w-full sm:w-auto"
                >
                  Faire un don mensuel
                </Button>
              </Link>
              <Link href="/qui-sommes-nous">
                <Button
                  variant="outline"
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="w-full sm:w-auto"
                >
                  Découvrir l&apos;association
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
                      title={origin.label}
                      className={`w-10 h-10 rounded-full ${origin.color} border-2 border-warm-50 flex items-center justify-center text-[11px] font-bold text-white`}
                    >
                      {origin.code}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-warm-900 text-sm">+248 familles</p>
                  <p className="text-warm-500 text-xs">nous font confiance</p>
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
                <p className="text-warm-500 text-xs">Reconnu d&apos;intérêt général</p>
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
                src="/images/stock/hero-portrait.jpg"
                alt="Membre de la communauté soutenue par l'association"
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
                    <p className="font-bold text-warm-900 text-base leading-none">248</p>
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
