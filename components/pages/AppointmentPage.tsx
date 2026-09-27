'use client'

import Link from 'next/link'
import React, { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, CheckCircle2, Calendar, Clock, Users,
  FileText, BookOpen, MessageCircle, User, Mail, Phone,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PrivacyNotice } from '@/components/ui/PrivacyNotice'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbJsonLd } from '@/lib/seo'
import { toast } from '@/components/ui/Toaster'
import type { AppointmentType, AppointmentSlot } from '@/types'
import { REASONS_BY_TYPE } from '@/lib/rendez-vous'
import { getDictionary } from '@/lib/dictionaries'
import { LOCALE_TAGS, localizedLoginPath, pathFor, type Locale } from '@/lib/i18n'

/** Identifiants et icônes ; libellés et descriptions viennent du dictionnaire. */
const TYPE_IDS: { id: AppointmentType; icon: typeof FileText }[] = [
  { id: 'administratif', icon: FileText },
  { id: 'fle_atelier', icon: BookOpen },
  { id: 'autre', icon: MessageCircle },
]

type SlotWithRemaining = AppointmentSlot & { remaining: number }

export function AppointmentPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const t = dict.pages.appointment
  const homePath = pathFor('home', locale)

  // Les dates et heures suivent la langue de lecture, pas celle du serveur.
  const localeTag = LOCALE_TAGS[locale]
  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(localeTag, { weekday: 'long', day: 'numeric', month: 'long' }),
    [localeTag]
  )
  const timeFmt = useMemo(
    () => new Intl.DateTimeFormat(localeTag, { hour: '2-digit', minute: '2-digit' }),
    [localeTag]
  )

  const [selectedType, setSelectedType] = useState<AppointmentType | null>(null)
  const [slots, setSlots] = useState<SlotWithRemaining[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [reason, setReason] = useState('')

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
    setReason('')
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
          reason: reason || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || t.errorGeneric)
      }

      setSuccess(true)
      toast({
        title: t.toastSuccessTitle,
        description: t.toastSuccessText,
        variant: 'success',
      })
    } catch (err: any) {
      toast({
        title: t.toastErrorTitle,
        description: err.message || t.toastErrorText,
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
    setReason('')
  }

  /**
   * Le motif dépend du type de créneau : changer de type doit reproposer une
   * liste cohérente. Les identifiants viennent de lib/rendez-vous.ts, partagé
   * avec l'administration et les emails ; seuls les libellés sont traduits.
   */
  const motifsDisponibles = selectedType
    ? (REASONS_BY_TYPE[selectedType] ?? []).map((id) => ({ id, label: t.reasons[id] }))
    : []

  const groupedSlots = slots.reduce<Record<string, SlotWithRemaining[]>>((acc, slot) => {
    const key = dateFmt.format(new Date(slot.start_at))
    acc[key] = acc[key] || []
    acc[key].push(slot)
    return acc
  }, {})

  return (
    <div className="min-h-screen">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: dict.nav.home, path: homePath },
          { name: t.breadcrumb, path: pathFor('appointment', locale) },
        ])}
      />

      <section className="hero-bg py-16 md:py-24 relative overflow-hidden" aria-labelledby="appointment-title">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-100/40 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="container-custom relative">
          <nav aria-label={t.breadcrumb} className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-warm-500">
              <li>
                <Link href={homePath} className="hover:text-primary-500 transition-colors">
                  {dict.nav.home}
                </Link>
              </li>
              <li><ChevronRight className="w-4 h-4 rtl:rotate-180" /></li>
              <li className="text-warm-700 font-medium">{t.breadcrumb}</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <span className="section-badge bg-primary-50 text-primary-600">{t.badge}</span>
            <h1 id="appointment-title" className="font-display font-black text-warm-900 mb-6">
              {t.titleBefore} <span className="gradient-text">{t.titleHighlight}</span>
            </h1>
            <p className="text-xl text-warm-600 leading-relaxed max-w-2xl">{t.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Présentation des types */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="font-display font-black text-2xl text-warm-900">{t.typesTitle}</h2>
              <p className="text-warm-600 mb-8 leading-relaxed">{t.typesText}</p>

              <div className="space-y-4">
                {TYPE_IDS.map((type, index) => {
                  const text = t.types[index]
                  return (
                    <div
                      key={type.id}
                      className="p-5 border border-warm-100 rounded-2xl bg-warm-50/50 flex gap-4 items-start"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-warm-100 flex items-center justify-center text-primary-500 shrink-0 shadow-sm">
                        <type.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-warm-900 text-base">{text.label}</p>
                        <p className="text-sm text-warm-500 mt-0.5">{text.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {!isLoggedIn && (
                <div className="p-6 rounded-3xl bg-secondary-900 text-white space-y-2">
                  <h3 className="font-bold text-lg text-secondary-300">{t.memberTitle}</h3>
                  <p className="text-sm text-warm-300 leading-relaxed">{t.memberText}</p>
                  <a
                    href={localizedLoginPath(locale)}
                    className="inline-block mt-2 text-sm font-semibold text-white underline"
                  >
                    {t.memberLink}
                  </a>
                </div>
              )}
            </div>

            {/* Réservation */}
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
                    <h3 className="text-2xl font-bold text-warm-900 mb-2">{t.successTitle}</h3>
                    <p className="text-warm-600 mb-6 max-w-sm mx-auto">{t.successText}</p>
                    <Button variant="outline" size="sm" onClick={resetForm}>
                      {t.bookAnother}
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
                    <div>
                      <h2 className="font-display font-black text-2xl text-warm-900 mb-4">
                        {t.step1}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {TYPE_IDS.map((type, index) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setSelectedType(type.id)}
                            className={`p-4 rounded-2xl border-2 text-start transition-all ${
                              selectedType === type.id
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-warm-100 bg-white hover:border-primary-200'
                            }`}
                          >
                            <type.icon
                              className={`w-5 h-5 mb-2 ${
                                selectedType === type.id ? 'text-primary-600' : 'text-warm-400'
                              }`}
                            />
                            <p className="text-sm font-bold text-warm-900 leading-tight">
                              {t.types[index].label}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedType && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className="font-display font-black text-2xl text-warm-900 mb-4">
                          {t.step2}
                        </h2>

                        {loadingSlots && <p className="text-warm-500 text-sm">{t.loadingSlots}</p>}

                        {!loadingSlots && slots.length === 0 && (
                          <div className="text-center py-8 border-2 border-dashed border-warm-200 rounded-2xl">
                            <Calendar className="w-10 h-10 text-warm-300 mx-auto mb-2" />
                            <p className="text-warm-500 text-sm font-medium">{t.noSlots}</p>
                            <p className="text-warm-400 text-xs mt-1">{t.noSlotsHint}</p>
                          </div>
                        )}

                        <div className="space-y-4">
                          {Object.entries(groupedSlots).map(([date, daySlots]) => (
                            <div key={date}>
                              <p className="text-xs font-bold uppercase tracking-wider text-warm-500 mb-2 capitalize">
                                {date}
                              </p>
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
                                    {/* Sans l'heure de fin, un créneau de 11h à 12h s'affichait
                                        « 11:00 » : impossible de distinguer sa durée, et le
                                        dernier créneau d'une matinée passait pour absent. */}
                                    {timeFmt.format(new Date(slot.start_at))} – {timeFmt.format(new Date(slot.end_at))}
                                    {slot.capacity > 1 && (
                                      <span className="inline-flex items-center gap-1 text-xs opacity-80">
                                        <Users className="w-3 h-3" />
                                        {slot.remaining}
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

                    {selectedSlotId && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <h2 className="font-display font-black text-2xl text-warm-900 mb-4">
                          {t.step3}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            type="text"
                            label={t.nameLabel}
                            placeholder={t.namePlaceholder}
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoggedIn}
                            leftAddon={<User className="w-4 h-4" />}
                          />
                          <Input
                            type="email"
                            label={t.emailLabel}
                            placeholder={t.emailPlaceholder}
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoggedIn}
                            leftAddon={<Mail className="w-4 h-4" />}
                          />
                        </div>

                        <Input
                          type="tel"
                          label={t.phoneLabel}
                          placeholder={t.phonePlaceholder}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          leftAddon={<Phone className="w-4 h-4" />}
                        />

                        {/* Masqué quand le type choisi se suffit à lui-même :
                            pour un cours de FLE, préciser le besoin serait
                            reposer la même question. */}
                        {motifsDisponibles.length > 0 && (
                          <div>
                            <label
                              htmlFor="motif"
                              className="block text-sm font-medium text-warm-700 mb-1.5"
                            >
                              {t.reasonLabel}
                            </label>
                            <select
                              id="motif"
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              className="w-full px-4 py-2.5 border border-warm-200 rounded-xl bg-white text-warm-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                            >
                              <option value="">{t.reasonPlaceholder}</option>
                              {motifsDisponibles.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.label}
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-warm-500 mt-1.5">{t.reasonHint}</p>
                          </div>
                        )}

                        <Button
                          type="submit"
                          variant="primary"
                          className="w-full justify-center mt-2"
                          isLoading={submitting}
                        >
                          {t.submit}
                        </Button>

                        <PrivacyNotice
                          purpose={t.privacyPurpose}
                          retention={t.privacyRetention}
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
