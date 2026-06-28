'use client'

import React from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, BookOpen, Home, Trophy, Compass } from 'lucide-react'

const ACTIONS = [
  {
    id: '1',
    title: 'Accueil et orientation administrative',
    description:
      'Un accompagnement personnalisé pour comprendre et remplir les documents officiels : titre de séjour, allocations, scolarisation, accès aux soins.',
    status: 'active',
    beneficiaries: 154,
    icon: Home,
    color: 'bg-secondary-500',
    tags: ['Administratif', 'Toutes situations'],
    href: '/nos-actions',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    id: '2',
    title: 'Cours de français intensifs (FLE)',
    description:
      'Des cours hebdomadaires de français langue étrangère pour adultes, animés par des bénévoles certifiés. Tous niveaux acceptés, de l\'alphabet aux situations professionnelles.',
    status: 'active',
    beneficiaries: 87,
    icon: BookOpen,
    color: 'bg-primary-500',
    tags: ['FLE', 'Adultes', 'Hebdomadaire'],
    href: '/nos-actions',
    image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    id: '3',
    title: 'Intégration par le sport',
    description:
      'Des activités sportives collectives pour les jeunes de 5 à 20 ans : un vecteur de cohésion, de dépassement de soi et d\'intégration durable.',
    status: 'active',
    beneficiaries: 65,
    icon: Trophy,
    color: 'bg-accent-600',
    tags: ['Sport', '5-20 ans'],
    href: '/nos-actions',
    image: 'https://images.unsplash.com/photo-1598880513655-d1c6d4b2dfbf?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    id: '4',
    title: 'Autonomie',
    description:
      'Un accompagnement global vers une insertion citoyenne et professionnelle complète, pour que chacun devienne pleinement acteur de son parcours en France.',
    status: 'active',
    beneficiaries: 120,
    icon: Compass,
    color: 'bg-warm-700',
    tags: ['Insertion', 'Citoyenneté'],
    href: '/nos-actions',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600&h=400',
  },
]

export function ActionsPreview() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <section ref={ref} className="section bg-white" aria-labelledby="actions-heading">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="section-badge">Nos actions</span>
            <h2 id="actions-heading" className="section-title mb-0">
              Ce que nous faisons concrètement
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href="/nos-actions"
              className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold transition-colors"
            >
              Toutes nos actions <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ACTIONS.map((action, i) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={action.href} className="block card-hover overflow-hidden group h-full">
                {/* Photo + icon overlapping bottom-left */}
                <div className="relative aspect-[3/2] -m-px mb-0 overflow-hidden">
                  <img
                    src={action.image}
                    alt={action.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className={`absolute -bottom-5 left-5 w-12 h-12 blob-3 ${action.color} flex items-center justify-center shadow-card`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="p-6 pt-7">
                  {/* Status badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-600 bg-secondary-50 px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 animate-pulse" />
                      En cours
                    </span>
                    <span className="text-xs text-warm-400">
                      {action.beneficiaries} bénéficiaires
                    </span>
                  </div>

                  <h3 className="font-bold text-warm-900 text-lg mb-3 leading-snug">
                    {action.title}
                  </h3>
                  <p className="text-warm-600 text-sm leading-relaxed mb-4">
                    {action.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {action.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 text-xs font-medium text-warm-600 bg-warm-100 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
