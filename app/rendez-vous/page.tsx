'use client'

import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, CheckCircle2, Calendar, Clock, Users,
  FileText, BookOpen, MessageCircle, User, Mail, Phone,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { PrivacyNotice } from '@/components/ui/PrivacyNotice'
import { toast } from '@/components/ui/Toaster'
import type { AppointmentType, AppointmentSlot } from '@/types'

const TYPES: { id: AppointmentType; label: string; description: string; icon: any }[] = [
  {
    id: 'administratif',
    label: 'Accompagnement administratif',
    description: 'Aide aux démarches : CAF, préfecture, logement, etc.',
    icon: FileText,
  },
  {
    id: 'fle_atelier',
    label: 'Cours de FLE & Ateliers',
    description: 'Réservez votre place à un cours de français ou un atelier',
    icon: BookOpen,
  },
  {
    id: 'autre',
    label: 'Rendez-vous général',
    description: 'Une autre demande ? Prenons rendez-vous pour en discuter',
    icon: MessageCircle,
  },
]

type SlotWithRemaining = AppointmentSlot & { remaining: number }

const dateFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
const timeFmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })

export default function RendezVousPage() {
  const [selectedType, setSelectedType] = useState<AppointmentType | null>(null)
  const [slots, setSlots] = useState<SlotWithRemaining[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function loadSession() {
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        setIsLoggedIn(true)
        setEmail(user.email || '')

        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone')
          .eq('id', user.id)
          .single()

        if (profile) {
          setName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim())
          setPhone(profile.phone || '')
        }
      } catch (e) {
        console.error('Session load failed', e)
      }
    }
    loadSession()
  }, [])

  useEffect(() => {
    if (!selectedType) return
    setSelectedSlotId(null)
    setLoadingSlots(true)
    fetch(`/api/rendez-vous/slots?type=${selectedType}`)
      .then((res) => res.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [selectedType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType || !selectedSlotId) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/rendez-vous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlotId,
          type: selectedType,
          name,
          email,
          phone: phone || undefined,
          notes: notes || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Une erreur est survenue.')
      }

      setSuccess(true)
      toast({
        title: 'Rendez-vous confirmé ! 📅',
        description: 'Vous allez recevoir un email de confirmation.',
        variant: 'success',
      })
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de confirmer le rendez-vous.',
        variant: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setSuccess(false)
    setSelectedType(null)
    setSelectedSlotId(null)
    setSlots([])
    if (!isLoggedIn) {
      setName('')
      setEmail('')
      setPhone('')
    }
    setNotes('')
  }

  const groupedSlots = slots.reduce<Record<string, SlotWithRemaining[]>>((acc, slot) => {
    const key = dateFmt.format(new Date(slot.start_at))
    acc[key] = acc[key] || []
    acc[key].push(slot)
    return acc
  }, {})

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="hero-bg py-16 md:py-24 relative overflow-hidden" aria-label="Prendre rendez-vous">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-100/40 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="container-custom relative">
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-warm-500">
              <li><Link href="/" className="hover:text-primary-500 transition-colors">Accueil</Link></li>
              <li><ChevronRight className="w-4 h-4" /></li>
              <li className="text-warm-700 font-medium">Prendre rendez-vous</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <span className="section-badge bg-primary-50 text-primary-600">Réservation</span>
            <h1 className="font-display font-black text-warm-900 mb-6">
              Prenons <span className="gradient-text">rendez-vous</span>
            </h1>
            <p className="text-xl text-warm-600 leading-relaxed max-w-2xl">
              Réservez un créneau pour un accompagnement administratif, un cours de FLE, un atelier,
              ou tout autre besoin. Ouvert aux adhérents comme aux non-adhérents.
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Info (Left) */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="font-display font-black text-2xl text-warm-900">Types de rendez-vous</h2>
              <p className="text-warm-600 mb-8 leading-relaxed">
                Choisissez le motif de votre demande, puis un créneau parmi ceux proposés.
              </p>

              <div className="space-y-4">
                {TYPES.map((t) => (
                  <div key={t.id} className="p-5 border border-warm-100 rounded-2xl bg-warm-50/50 flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-white border border-warm-100 flex items-center justify-center text-primary-500 shrink-0 shadow-sm">
                      <t.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-warm-900 text-base">{t.label}</p>
                      <p className="text-sm text-warm-500 mt-0.5">{t.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {!isLoggedIn && (
                <div className="p-6 rounded-3xl bg-secondary-900 text-white space-y-2">
                  <h3 className="font-bold text-lg text-secondary-300">👋 Déjà adhérent ?</h3>
                  <p className="text-sm text-warm-300 leading-relaxed">
                    Connectez-vous pour retrouver tous vos rendez-vous dans votre espace membre.
                  </p>
                  <a href="/login?redirect=/rendez-vous" className="inline-block mt-2 text-sm font-semibold text-white underline">
                    Se connecter →
                  </a>
                </div>
              )}
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
                    <h3 className="text-2xl font-bold text-warm-900 mb-2">Rendez-vous confirmé !</h3>
                    <p className="text-warm-600 mb-6 max-w-sm mx-auto">
                      Un email de confirmation vient de vous être envoyé avec tous les détails.
                    </p>
                    <Button variant="outline" size="sm" onClick={resetForm}>
                      Prendre un autre rendez-vous
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {/* Step 1: type */}
                    <div>
                      <h2 className="font-display font-black text-2xl text-warm-900 mb-4">1. Motif du rendez-vous</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {TYPES.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSelectedType(t.id)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all ${
                              selectedType === t.id
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-warm-100 bg-white hover:border-primary-200'
                            }`}
                          >
                            <t.icon className={`w-5 h-5 mb-2 ${selectedType === t.id ? 'text-primary-600' : 'text-warm-400'}`} />
                            <p className="text-sm font-bold text-warm-900 leading-tight">{t.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step 2: slot */}
                    {selectedType && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className="font-display font-black text-2xl text-warm-900 mb-4">2. Choisir un créneau</h2>

                        {loadingSlots && (
                          <p className="text-warm-500 text-sm">Chargement des créneaux disponibles...</p>
                        )}

                        {!loadingSlots && slots.length === 0 && (
                          <div className="text-center py-8 border-2 border-dashed border-warm-200 rounded-2xl">
                            <Calendar className="w-10 h-10 text-warm-300 mx-auto mb-2" />
                            <p className="text-warm-500 text-sm font-medium">
                              Aucun créneau disponible actuellement pour ce motif.
                            </p>
                            <p className="text-warm-400 text-xs mt-1">
                              Contactez-nous directement, nous trouverons une solution.
                            </p>
                          </div>
                        )}

                        <div className="space-y-4">
                          {Object.entries(groupedSlots).map(([date, daySlots]) => (
                            <div key={date}>
                              <p className="text-xs font-bold uppercase tracking-wider text-warm-500 mb-2 capitalize">{date}</p>
                              <div className="flex flex-wrap gap-2">
                                {daySlots.map((slot) => (
                                  <button
                                    key={slot.id}
                                    type="button"
                                    onClick={() => setSelectedSlotId(slot.id)}
                                    className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold flex items-center gap-2 transition-all ${
                                      selectedSlotId === slot.id
                                        ? 'border-primary-500 bg-primary-500 text-white'
                                        : 'border-warm-100 bg-white text-warm-700 hover:border-primary-300'
                                    }`}
                                  >
                                    <Clock className="w-3.5 h-3.5" />
                                    {timeFmt.format(new Date(slot.start_at))}
                                    {slot.capacity > 1 && (
                                      <span className="inline-flex items-center gap-1 text-xs opacity-80">
                                        <Users className="w-3 h-3" />{slot.remaining}
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: contact info */}
                    {selectedSlotId && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <h2 className="font-display font-black text-2xl text-warm-900 mb-4">3. Vos coordonnées</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            type="text"
                            label="Nom complet"
                            placeholder="Jean Dupont"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoggedIn}
                            leftAddon={<User className="w-4 h-4" />}
                          />
                          <Input
                            type="email"
                            label="Adresse email"
                            placeholder="jean.dupont@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoggedIn}
                            leftAddon={<Mail className="w-4 h-4" />}
                          />
                        </div>

                        <Input
                          type="tel"
                          label="Téléphone (facultatif)"
                          placeholder="+33 6 12 34 56 78"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          leftAddon={<Phone className="w-4 h-4" />}
                        />

                        <Textarea
                          label="Précisions (facultatif)"
                          placeholder="Un détail à nous communiquer avant le rendez-vous ?"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />

                        <Button
                          type="submit"
                          variant="primary"
                          className="w-full justify-center mt-2"
                          isLoading={submitting}
                        >
                          Confirmer le rendez-vous
                        </Button>

                        <PrivacyNotice
                          purpose="pour organiser votre rendez-vous et préparer votre accompagnement"
                          retention="12 mois après le rendez-vous"
                          className="mt-4"
                        />
                      </motion.div>
                    )}
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
