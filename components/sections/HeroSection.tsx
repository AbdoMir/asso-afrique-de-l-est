'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ArrowRight, Play, Users, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function HeroSection() {
  return (
    <section className="hero-bg relative overflow-hidden min-h-[90vh] flex items-center" aria-label="Hero">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary-200/30 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-secondary-200/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-100/20 blur-3xl" />

        {/* Floating cards decorative */}
        <motion.div
          className="absolute top-24 right-16 hidden xl:block"
          animate={{ y: [-10, 10, -10] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-card border border-warm-100 w-52">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-warm-900 text-lg leading-none">248</p>
                <p className="text-warm-500 text-xs">familles accompagnées</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-32 right-24 hidden xl:block"
          animate={{ y: [10, -10, 10] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 1 }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-card border border-warm-100 w-56">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-warm-900 text-lg leading-none">127 mois</p>
                <p className="text-warm-500 text-xs">de cours FLE financés</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="absolute top-1/2 right-8 hidden xl:block"
          animate={{ y: [-8, 8, -8] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 2 }}
        >
          <div className="bg-secondary-500/90 backdrop-blur-sm rounded-2xl p-4 shadow-card w-44">
            <p className="text-white font-bold text-lg leading-none">66%</p>
            <p className="text-white/80 text-xs">déductibles des impôts</p>
          </div>
        </motion.div>
      </div>

      <div className="container-custom relative z-10 py-20">
        <div className="max-w-3xl">
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
            <span className="gradient-text">l&apos;avenir</span>{' '}
            des familles d&apos;Afrique de l&apos;Est en France
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl text-warm-600 leading-relaxed mb-10 max-w-2xl"
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
                className="w-full sm:w-auto shadow-warm-lg"
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
            {/* Avatars */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {['🇪🇹', '🇸🇴', '🇰🇪', '🇺🇬', '🇷🇼'].map((flag, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-white border-2 border-warm-50 flex items-center justify-center text-base shadow-sm"
                  >
                    {flag}
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
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" className="w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z"
            fill="#ffffff"
            fillOpacity="0.6"
          />
          <path
            d="M0 60C360 20 720 80 1080 40C1260 20 1380 50 1440 60V80H0V60Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  )
}
