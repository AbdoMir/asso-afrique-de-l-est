'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function DonationCTASection() {
  return (
    <section className="section bg-gradient-to-br from-warm-100 to-warm-50 relative overflow-hidden" aria-label="Appel aux dons">
      {/* Decorative blurry backgrounds */}
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-primary-200/20 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-secondary-200/20 blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-card-hover border border-warm-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left side info */}
            <div className="p-8 md:p-12 lg:col-span-7 flex flex-col justify-between">
              <div>
                <span className="section-badge bg-primary-50 text-primary-600">
                  <Heart className="w-4 h-4 text-primary-500 fill-primary-500" />
                  Soutien Solidaire
                </span>
                <h2 className="text-3xl md:text-4xl font-display font-black text-warm-900 mb-6 leading-tight">
                  Chaque geste compte pour <span className="gradient-text">l&apos;intégration des familles</span>
                </h2>
                <p className="text-warm-600 leading-relaxed mb-8">
                  Votre don mensuel régulier permet de financer sur la durée nos cours de français (FLE), 
                  l&apos;aide aux devoirs pour les jeunes, l&apos;aide à l&apos;emploi et nos services de traduction sociale. 
                  Vous donnez de la stabilité et de l&apos;espoir.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-warm-600">
                  <div className="w-5 h-5 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>Déductible d&apos;impôts à 66% • Reçu fiscal annuel automatique</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-warm-600">
                  <div className="w-5 h-5 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span>Paiement sécurisé Stripe & HelloAsso • Sans engagement</span>
                </div>
              </div>
            </div>

            {/* Right side CTA blocks */}
            <div className="p-8 md:p-12 lg:col-span-5 bg-warm-900 text-white flex flex-col justify-center">
              <h3 className="font-display font-bold text-xl mb-6 text-warm-100">Choisissez votre soutien :</h3>

              <div className="space-y-4 mb-8">
                {[
                  { amount: 5, action: '5€/mois', desc: 'finance 1 heure de FLE par mois', href: '/adherer-soutenir?formula=monthly_5#don-mensuel' },
                  { amount: 10, action: '10€/mois', desc: 'finance le suivi scolaire d\'un enfant', href: '/adherer-soutenir?formula=monthly_10#don-mensuel', popular: true },
                  { amount: 20, action: '20€/mois', desc: 'finance 1 accompagnement vers l\'emploi', href: '/adherer-soutenir?formula=monthly_20#don-mensuel' },
                  { amount: 'simple', action: 'Don ponctuel', desc: 'adhésion simple à partir de 10€, sans engagement', href: '/adherer-soutenir?formula=simple#don-mensuel' }
                ].map((item) => (
                  <Link href={item.href} key={item.amount} className="block group">
                    <div className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                      item.popular
                        ? 'bg-primary-500 border-primary-400 hover:bg-primary-600'
                        : 'bg-warm-800/50 border-warm-700 hover:bg-warm-800 hover:border-warm-600'
                    }`}>
                      <div>
                        <div className="font-black text-xl font-display flex items-center gap-2">
                          {item.action}
                          {item.popular && (
                            <span className="text-[10px] bg-white text-primary-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                              Populaire
                            </span>
                          )}
                        </div>
                        <div className={`text-xs ${item.popular ? 'text-white/80' : 'text-warm-400'} group-hover:text-white transition-colors`}>
                          {item.desc}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white/70 group-hover:text-white transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>

              <Link href="/adherer-soutenir" className="w-full">
                <Button variant="white" size="md" className="w-full text-warm-900 font-bold justify-center">
                  Voir toutes les formules
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
