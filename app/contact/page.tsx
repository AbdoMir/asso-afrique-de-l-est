'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, MapPin, Send, CheckCircle2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toaster'

const schema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Le sujet doit contenir au moins 3 caractères'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
})

type FormData = z.infer<typeof schema>

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Une erreur est survenue.')
      }

      setSuccess(true)
      toast({
        title: 'Message envoyé ! 📬',
        description: 'Nous avons bien reçu votre demande et vous répondrons rapidement.',
        variant: 'success',
      })
      reset()
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible d\'envoyer le message pour le moment.',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="hero-bg py-16 md:py-24 relative overflow-hidden" aria-label="Contact hero">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-100/40 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="container-custom relative">
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-warm-500">
              <li><a href="/" className="hover:text-primary-500 transition-colors">Accueil</a></li>
              <li><ChevronRight className="w-4 h-4" /></li>
              <li className="text-warm-700 font-medium">Contact</li>
            </ol>
          </nav>
          
          <div className="max-w-3xl">
            <span className="section-badge bg-primary-50 text-primary-600">Nous contacter</span>
            <h1 className="font-display font-black text-warm-900 mb-6">
              Une question ? <span className="gradient-text">Écrivez-nous</span>
            </h1>
            <p className="text-xl text-warm-600 leading-relaxed max-w-2xl">
              Que vous soyez une famille sollicitant un accompagnement, un bénévole motivé, 
              ou un partenaire potentiel, notre équipe est à votre écoute.
            </p>
          </div>
        </div>
      </section>

      {/* Main Form & Info Grid */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Info cards (Left) */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="font-display font-black text-2xl text-warm-900">Nos coordonnées</h2>
              <p className="text-warm-600 mb-8 leading-relaxed">
                N&apos;hésitez pas à nous contacter directement ou à venir nous rencontrer pendant nos permanences d&apos;accueil.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Mail, label: 'Adresse email', value: 'contact@asso-aes.fr', href: 'mailto:contact@asso-aes.fr' },
                  { icon: Phone, label: 'Téléphone', value: '+33 1 XX XX XX XX', href: 'tel:+33100000000' },
                  { icon: MapPin, label: 'Adresse postale', value: '15 Rue de la Solidarité, 75019 Paris', href: '#' }
                ].map((item) => (
                  <div key={item.label} className="p-5 border border-warm-100 rounded-2xl bg-warm-50/50 flex gap-4 items-start hover:border-primary-300 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-white border border-warm-100 flex items-center justify-center text-primary-500 shrink-0 shadow-sm">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-warm-500 uppercase tracking-wider mb-1">{item.label}</p>
                      {item.href !== '#' ? (
                        <a href={item.href} className="font-bold text-warm-900 text-base hover:text-primary-500 transition-colors">
                          {item.value}
                        </a>
                      ) : (
                        <span className="font-bold text-warm-900 text-base">{item.value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Permanences info */}
              <div className="p-6 rounded-3xl bg-secondary-900 text-white space-y-4">
                <h3 className="font-bold text-lg text-secondary-300">📅 Permanences d&apos;accueil</h3>
                <p className="text-sm text-warm-300 leading-relaxed">
                  Sans rendez-vous pour les premières démarches et l&apos;interprétariat d&apos;urgence.
                </p>
                <div className="text-xs text-warm-400 space-y-2">
                  <div className="flex justify-between border-b border-secondary-800 pb-1.5">
                    <span>Mardi (Permanence administrative)</span>
                    <span className="font-bold text-white">14h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between border-b border-secondary-800 pb-1.5">
                    <span>Mercredi (Soutien scolaire)</span>
                    <span className="font-bold text-white">14h00 - 17h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samedi (Permanence FLE)</span>
                    <span className="font-bold text-white">10h00 - 13h00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form box (Right) */}
            <div className="lg:col-span-7 bg-warm-50/50 border border-warm-100 rounded-3xl p-8 md:p-10 shadow-sm">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-12"
                  >
                    <CheckCircle2 className="w-16 h-16 text-secondary-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-warm-900 mb-2">Message envoyé !</h3>
                    <p className="text-warm-600 mb-6 max-w-sm mx-auto">
                      Nous vous remercions pour votre intérêt. Un membre de l&apos;équipe prendra contact avec vous très rapidement.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setSuccess(false)}>
                      Écrire un autre message
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <h2 className="font-display font-black text-2xl text-warm-900 mb-4">Envoyer un message</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="text"
                        label="Nom complet / Structure"
                        placeholder="Jean Dupont"
                        required
                        error={errors.name?.message}
                        {...register('name')}
                      />
                      <Input
                        type="email"
                        label="Adresse email"
                        placeholder="jean.dupont@example.com"
                        required
                        error={errors.email?.message}
                        {...register('email')}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="tel"
                        label="Téléphone (facultatif)"
                        placeholder="+33 6 12 34 56 78"
                        error={errors.phone?.message}
                        {...register('phone')}
                      />
                      <Input
                        type="text"
                        label="Sujet"
                        placeholder="Demande d'accompagnement, bénévolat..."
                        required
                        error={errors.subject?.message}
                        {...register('subject')}
                      />
                    </div>

                    <Textarea
                      label="Votre message"
                      placeholder="Comment pouvons-nous vous aider ?..."
                      required
                      error={errors.message?.message}
                      {...register('message')}
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full justify-center mt-6"
                      isLoading={loading}
                      rightIcon={<Send className="w-4 h-4" />}
                    >
                      Envoyer le message
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
