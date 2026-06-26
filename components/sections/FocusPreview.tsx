'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Languages, Users, Briefcase, ArrowRight } from 'lucide-react'

const FOCUSES = [
  {
    id: 'traduction',
    icon: Languages,
    photo: null,
    title: 'Traduction',
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    iconColor: 'text-purple-600',
    description:
      'Nous aidons les familles à naviguer dans les démarches administratives françaises grâce à des services de traduction bénévoles : préfecture, CAF, écoles, hôpitaux.',
    stats: '1 240 documents traduits',
    href: '/nos-focus#traduction',
  },
  {
    id: 'jeunesse',
    icon: Users,
    photo: '/images/stock/kids-study.jpg',
    title: 'Jeunesse',
    color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
    iconColor: 'text-pink-600',
    description:
      'Ateliers créatifs, soutien scolaire et activités sportives pour les enfants et adolescents d\'Afrique de l\'Est en France. Cultiver les racines, ouvrir les horizons.',
    stats: '65+ jeunes accompagnés',
    href: '/nos-focus#jeunesse',
  },
  {
    id: 'emploi',
    icon: Briefcase,
    photo: '/images/stock/friends-group.jpg',
    title: 'Emploi',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    iconColor: 'text-emerald-600',
    description:
      'Accompagnement personnalisé vers l\'emploi : rédaction de CV, préparation aux entretiens, mise en relation avec des employeurs partenaires sensibilisés à la diversité.',
    stats: '89% d\'insertion emploi',
    href: '/nos-focus#emploi',
  },
]

export function FocusPreview() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section ref={ref} className="section bg-warm-50" aria-labelledby="focus-heading">
      <div className="container-custom">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="section-badge">Nos focus</span>
          <h2 id="focus-heading" className="section-title">
            Trois axes d&apos;action prioritaires
          </h2>
          <p className="section-subtitle mx-auto">
            Nos programmes sont pensés pour répondre aux besoins réels des familles 
            que nous accompagnons.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FOCUSES.map((focus, i) => (
            <motion.div
              key={focus.id}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <Link href={focus.href} className="block card-hover p-7 group h-full">
                {/* Photo (blob) + icône, ou icône seule à défaut */}
                {focus.photo ? (
                  <div className="relative w-20 h-20 mb-5">
                    <div className="absolute inset-0 blob-2 overflow-hidden">
                      <Image
                        src={focus.photo}
                        alt=""
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                    <div className={`absolute -bottom-1.5 -right-1.5 w-9 h-9 rounded-full bg-gradient-to-br ${focus.color} flex items-center justify-center shadow-sm border-2 border-white`}>
                      <focus.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className={`w-14 h-14 blob-3 bg-gradient-to-br ${focus.color} flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform`}>
                    <focus.icon className="w-7 h-7 text-white" />
                  </div>
                )}

                {/* Title */}
                <h3 className="text-xl font-bold text-warm-900 mb-3">{focus.title}</h3>

                {/* Description */}
                <p className="text-warm-600 leading-relaxed mb-4 text-sm">
                  {focus.description}
                </p>

                {/* Stat badge */}
                <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${focus.bg} ${focus.iconColor} border ${focus.border} mb-4`}>
                  {focus.stats}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-1 text-primary-500 font-semibold text-sm group-hover:gap-2 transition-all">
                  En savoir plus <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
