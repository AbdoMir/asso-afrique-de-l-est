'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import type { Dictionary } from '@/lib/dictionaries'

type TestimonialsDict = Dictionary['home']['testimonials']

/** Seul le drapeau ne se traduit pas ; le reste vient du dictionnaire. */
const FLAGS = ['🇪🇹', '🇸🇴', '🇩🇯', '🇪🇷']


export function TestimonialsSection({ dict }: { dict: TestimonialsDict }) {
  const [current, setCurrent] = useState(0)
  const items = dict.items

  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length)
  const next = () => setCurrent((c) => (c + 1) % items.length)

  const testimonial = items[current]

  return (
    <section className="section bg-gradient-to-br from-warm-900 to-warm-800 relative overflow-hidden" aria-labelledby="testimonials-heading">
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-secondary-500/10 blur-3xl" />
      </div>

      <div className="container-custom relative">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-white/10 text-white/90 mb-4">
            {dict.badge}
          </span>
          <h2 id="testimonials-heading" className="text-3xl md:text-4xl font-bold text-white">
            {dict.title}
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 md:p-12"
            >
              {/* Quote icon */}
              <Quote className="w-12 h-12 text-primary-400 mb-6 opacity-80" />

              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 text-accent-400 fill-accent-400" />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-xl md:text-2xl text-white/95 leading-relaxed italic mb-8">
                &quot;{testimonial.quote}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl border-2 border-white/30 shrink-0">
                  {FLAGS[current]}
                </div>
                <div>
                  <p className="font-bold text-white text-lg">{testimonial.name}</p>
                  <p className="text-white/60 text-sm">{testimonial.role}</p>
                </div>
                <div className="ml-auto">
                  <span className="px-3 py-1.5 bg-primary-500/30 text-primary-300 rounded-full text-xs font-semibold">
                    {testimonial.program}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label={dict.previous}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === current
                      ? 'w-8 h-2.5 bg-primary-400'
                      : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`${dict.dotLabel} ${i + 1}`}
                  aria-current={i === current}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label={dict.next}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
