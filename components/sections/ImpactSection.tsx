'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { BookOpen, Users, Briefcase, Languages, Heart, Calendar } from 'lucide-react'
import { LOCALE_TAGS, type Locale } from '@/lib/i18n'
import type { Dictionary } from '@/lib/dictionaries'

type ImpactDict = Dictionary['home']['impact']

/** Chiffres et habillage seulement : les libellés viennent du dictionnaire. */
const STATS = [
  { value: 15, icon: BookOpen, color: 'text-primary-500', iconBg: 'bg-primary-100' },
  { value: 120, icon: Users, color: 'text-secondary-500', iconBg: 'bg-secondary-100' },
  { value: 89, icon: Briefcase, color: 'text-accent-600', iconBg: 'bg-accent-100' },
  { value: 1240, icon: Languages, color: 'text-purple-500', iconBg: 'bg-purple-50' },
  { value: 65, icon: Heart, color: 'text-pink-500', iconBg: 'bg-pink-50' },
  { value: 1, icon: Calendar, color: 'text-blue-500', iconBg: 'bg-blue-50' },
]

function AnimatedCounter({
  value,
  suffix,
  isVisible,
  localeTag,
}: {
  value: number
  suffix: string
  isVisible: boolean
  localeTag: string
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      // Ease out
      const progress = 1 - Math.pow(1 - step / steps, 3)
      current = Math.round(value * progress)
      setCount(current)
      if (step >= steps) {
        setCount(value)
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible, value])

  return (
    <span>
      {count.toLocaleString(localeTag)}
      {suffix}
    </span>
  )
}

export function ImpactSection({ dict, locale }: { dict: ImpactDict; locale: Locale }) {
  const localeTag = LOCALE_TAGS[locale]
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="section bg-white" aria-labelledby="impact-heading">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="section-badge">{dict.badge}</span>
          <h2 id="impact-heading" className="section-title">
            {dict.title}
          </h2>
          <p className="section-subtitle mx-auto">{dict.subtitle}</p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          {STATS.map((stat, i) => {
            const text = dict.stats[i]
            return (
            <motion.div
              key={text.label}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="card-hover p-6 md:p-7 group">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-full ${stat.iconBg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>

                {/* Counter */}
                <div className={`impact-counter ${stat.color} mb-1`}>
                  <AnimatedCounter
                    value={stat.value}
                    suffix={text.suffix}
                    isVisible={isInView}
                    localeTag={localeTag}
                  />
                </div>

                {/* Label */}
                <p className="font-semibold text-warm-900 text-base md:text-lg mb-1">
                  {text.label}
                </p>
                <p className="text-warm-500 text-sm leading-snug hidden md:block">
                  {text.description}
                </p>
              </div>
            </motion.div>
            )
          })}
        </div>

        {/* Quote */}
        <motion.blockquote
          className="mt-12 text-center max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-lg md:text-xl text-warm-700 italic leading-relaxed">
            &quot;{dict.quote}&quot;
          </p>
          <footer className="mt-3 text-warm-500 text-sm font-medium">
            {dict.quoteAuthor}
          </footer>
        </motion.blockquote>
      </div>
    </section>
  )
}
