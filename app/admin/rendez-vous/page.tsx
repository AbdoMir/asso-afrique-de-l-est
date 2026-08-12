'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Users, Trash2, X, ShieldAlert, Loader2, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toaster'
import type { AppointmentType } from '@/types'
import {
  APPOINTMENT_TYPE_LABELS as TYPE_LABELS,
  APPOINTMENT_REASON_LABELS,
  EXTERNAL_CATEGORIES,
  libelleCategorie,
} from '@/lib/rendez-vous'
import type { AppointmentReason } from '@/types'

/** Les réservations arrivent de l'API sans typage : on borne l'accès ici. */
function libelleMotif(motif?: string | null): string {
  if (!motif) return ''
  return APPOINTMENT_REASON_LABELS[motif as AppointmentReason] ?? motif
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
const timeFmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })
const dateTimeFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function AdminRendezVousPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [isStaff, setIsStaff] = useState(false)

  const [activeTab, setActiveTab] = useState<'slots' | 'bookings' | 'exterieurs'>('slots')

  const [slots, setSlots] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [showPast, setShowPast] = useState(false)
  const [showCancelled, setShowCancelled] = useState(false)
  const [expandedSlotId, setExpandedSlotId] = useState<string | null>(null)

  const [type, setType] = useState<AppointmentType>('administratif')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [capacity, setCapacity] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  // Onglet « RDV extérieurs » : on cherche un adhérent par email, puis on
  // enregistre pour lui les rendez-vous qu'il a à l'extérieur.
  const [rechercheEmail, setRechercheEmail] = useState('')
  const [recherchant, setRecherchant] = useState(false)
  const [adherent, setAdherent] = useState<any>(null)
  const [adherentIntrouvable, setAdherentIntrouvable] = useState(false)
  const [rdvExterieurs, setRdvExterieurs] = useState<any[]>([])
  const [extCategory, setExtCategory] = useState<string>('prefecture')
  const [extTitle, setExtTitle] = useState('')
  const [extDate, setExtDate] = useState('')
  const [extTime, setExtTime] = useState('')
  const [extLocation, setExtLocation] = useState('')
  const [extPreparation, setExtPreparation] = useState('')

  // ─── Access check ─────────────────────────────────────────────────────
  useEffect(() => {
    async function checkAccess() {
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          setChecking(false)
          return
        }
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login?redirect=/admin/rendez-vous')
          return
        }
        const { data: profile } = await supabase.from('profiles').select('is_staff').eq('id', user.id).single()
        if (!profile?.is_staff) {
          setIsStaff(false)
          return
        }

        // La 2FA est obligatoire pour le staff (voir lib/admin-guard.ts) :
        // sans facteur enrole, direction la page d'activation ; avec un
        // facteur mais une session non elevee (aal1), retour au login.
        const { data: factorsData } = await supabase.auth.mfa.listFactors()
        if (!factorsData?.totp?.length) {
          router.push('/admin/securite')
          return
        }
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        if (aal?.currentLevel !== 'aal2') {
          router.push('/login?redirect=/admin/rendez-vous')
          return
        }

        setIsStaff(true)
      } catch (e) {
        console.error('Access check failed', e)
      } finally {
        setChecking(false)
      }
    }
    checkAccess()
  }, [router])

  // ─── Data loading ─────────────────────────────────────────────────────
  const loadSlots = useCallback(async () => {
    const res = await fetch(`/api/admin/rendez-vous/slots?includePast=${showPast}`)
    const result = await res.json()
    if (res.ok) setSlots(result.slots)
  }, [showPast])

  const loadBookings = useCallback(async () => {
    const res = await fetch(`/api/admin/rendez-vous/bookings?includeCancelled=${showCancelled}`)
    const result = await res.json()
    if (res.ok) setBookings(result.bookings)
  }, [showCancelled])

  useEffect(() => {
    if (isStaff) loadSlots()
  }, [isStaff, loadSlots])

  useEffect(() => {
    if (isStaff) loadBookings()
  }, [isStaff, loadBookings])

  // ─── Actions ──────────────────────────────────────────────────────────
  const handleRechercheAdherent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rechercheEmail.trim()) return

    setRecherchant(true)
    setAdherent(null)
    setAdherentIntrouvable(false)
    setRdvExterieurs([])

    try {
      const response = await fetch(
        `/api/admin/rendez-vous/exterieurs?email=${encodeURIComponent(rechercheEmail.trim())}`
      )
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Recherche impossible.')

      if (!result.profile) {
        setAdherentIntrouvable(true)
        return
      }

      setAdherent(result.profile)
      setRdvExterieurs(result.appointments || [])
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'error' })
    } finally {
      setRecherchant(false)
    }
  }

  const handleAddRdvExterieur = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adherent || !extDate || !extTime) return

    setSubmitting(true)
    try {
      const startsAt = new Date(`${extDate}T${extTime}`).toISOString()

      const response = await fetch('/api/admin/rendez-vous/exterieurs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: adherent.id,
          category: extCategory,
          title: extTitle.trim(),
          startsAt,
          location: extLocation.trim() || undefined,
          preparation: extPreparation.trim() || undefined,
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Enregistrement impossible.')

      setRdvExterieurs((prev) =>
        [...prev, result.appointment].sort(
          (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
        )
      )
      setExtTitle('')
      setExtDate('')
      setExtTime('')
      setExtLocation('')
      setExtPreparation('')

      toast({
        title: 'Rendez-vous enregistré',
        description: `${adherent.first_name} le retrouvera sur son espace.`,
        variant: 'success',
      })
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRdvExterieur = async (id: string) => {
    if (!window.confirm('Supprimer ce rendez-vous ?')) return

    try {
      const response = await fetch(`/api/admin/rendez-vous/exterieurs/${id}`, { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Suppression impossible.')

      setRdvExterieurs((prev) => prev.filter((r) => r.id !== id))
      toast({ title: 'Rendez-vous supprimé', variant: 'success' })
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'error' })
    }
  }

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    const startAt = new Date(`${date}T${startTime}:00`)
    const endAt = new Date(`${date}T${endTime}:00`)

    if (endAt <= startAt) {
      toast({ title: 'Erreur', description: "L'heure de fin doit être après l'heure de début.", variant: 'error' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/rendez-vous/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, start_at: startAt.toISOString(), end_at: endAt.toISOString(), capacity }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      toast({ title: 'Créneau ajouté', variant: 'success' })
      setDate('')
      setStartTime('')
      setEndTime('')
      setCapacity(1)
      loadSlots()
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Supprimer ce créneau ? Les réservations associées seront aussi supprimées.')) return
    const res = await fetch(`/api/admin/rendez-vous/slots/${id}`, { method: 'DELETE' })
    const result = await res.json()
    if (!res.ok) {
      toast({ title: 'Erreur', description: result.error, variant: 'error' })
      return
    }
    toast({ title: 'Créneau supprimé', variant: 'success' })
    loadSlots()
  }

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Annuler cette réservation ?')) return
    const res = await fetch(`/api/admin/rendez-vous/bookings/${id}/cancel`, { method: 'POST' })
    const result = await res.json()
    if (!res.ok) {
      toast({ title: 'Erreur', description: result.error, variant: 'error' })
      return
    }
    toast({ title: 'Réservation annulée', variant: 'success' })
    loadBookings()
    loadSlots()
  }

  // ─── Render ───────────────────────────────────────────────────────────

  if (checking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (!isStaff) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="font-display font-black text-2xl text-warm-900 mb-2">Accès refusé</h1>
          <p className="text-warm-500 mb-6">Cette page est réservée aux membres de l&apos;équipe de l&apos;association.</p>
          <Button variant="outline" onClick={() => router.push('/')}>Retour à l&apos;accueil</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-50 py-12">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="font-display font-black text-3xl text-warm-900">Administration — Rendez-vous</h1>
          <p className="text-warm-500 mt-1">Gestion des créneaux et des réservations</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('slots')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'slots' ? 'bg-primary-500 text-white shadow-warm' : 'bg-white text-warm-600 border border-warm-100'
            }`}
          >
            Créneaux
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'bookings' ? 'bg-primary-500 text-white shadow-warm' : 'bg-white text-warm-600 border border-warm-100'
            }`}
          >
            Réservations
          </button>
          <button
            onClick={() => setActiveTab('exterieurs')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'exterieurs' ? 'bg-primary-500 text-white shadow-warm' : 'bg-white text-warm-600 border border-warm-100'
            }`}
          >
            RDV extérieurs
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'slots' && (
            <motion.div key="slots" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="bg-white rounded-3xl shadow-card border border-warm-100 p-6">
                <h2 className="font-display font-bold text-lg text-warm-900 mb-4">Ajouter un créneau</h2>
                <form onSubmit={handleAddSlot} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div>
                    <label className="label">Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value as AppointmentType)} className="input">
                      <option value="administratif">Accompagnement administratif</option>
                      <option value="fle_atelier">Cours de FLE / Atelier</option>
                      <option value="autre">Rendez-vous général</option>
                    </select>
                  </div>
                  <Input type="date" label="Date" value={date} onChange={(e) => setDate(e.target.value)} required />
                  <Input type="time" label="Heure début" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                  <Input type="time" label="Heure fin" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                  <Input type="number" label="Capacité" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} required />
                  <div className="md:col-span-5">
                    <Button type="submit" variant="primary" isLoading={submitting}>Ajouter</Button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-3xl shadow-card border border-warm-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-display font-bold text-lg text-warm-900">Créneaux</h2>
                  <label className="flex items-center gap-2 text-sm text-warm-500 cursor-pointer">
                    <input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} />
                    Afficher les créneaux passés
                  </label>
                </div>

                {slots.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-warm-200 rounded-2xl">
                    <Calendar className="w-10 h-10 text-warm-300 mx-auto mb-2" />
                    <p className="text-warm-500 text-sm">Aucun créneau.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-warm-100 text-warm-400 font-semibold text-xs uppercase">
                        <th className="pb-3"></th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Horaire</th>
                        <th className="pb-3">Réservé</th>
                        <th className="pb-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {slots.map((slot) => {
                        const isFull = slot.booked >= slot.capacity
                        const isExpanded = expandedSlotId === slot.id
                        const slotBookings = bookings.filter((b) => b.slot_id === slot.id && b.status === 'confirmed')
                        return (
                          <React.Fragment key={slot.id}>
                            <tr
                              className="border-b border-warm-50 cursor-pointer hover:bg-warm-50/50"
                              onClick={() => setExpandedSlotId(isExpanded ? null : slot.id)}
                            >
                              <td className="py-3 pl-1 text-warm-400">
                                {slot.booked > 0 ? (isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) : null}
                              </td>
                              <td className="py-3 font-semibold text-warm-900">{TYPE_LABELS[slot.type] || slot.type}</td>
                              <td className="py-3 text-warm-600">{dateFmt.format(new Date(slot.start_at))}</td>
                              <td className="py-3 text-warm-600">{timeFmt.format(new Date(slot.start_at))} – {timeFmt.format(new Date(slot.end_at))}</td>
                              <td className="py-3">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  isFull ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                                }`}>
                                  <Users className="w-3.5 h-3.5" />{slot.booked} / {slot.capacity}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteSlot(slot.id) }}
                                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                  aria-label="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-warm-50/50">
                                <td colSpan={6} className="py-3 px-4">
                                  {slotBookings.length === 0 ? (
                                    <p className="text-xs text-warm-400">Aucun inscrit confirmé pour ce créneau.</p>
                                  ) : (
                                    <ul className="space-y-2">
                                      {slotBookings.map((b) => {
                                        const isMember = !!b.profiles
                                        const name = isMember
                                          ? `${b.profiles.first_name || ''} ${b.profiles.last_name || ''}`.trim() || '(adhérent)'
                                          : b.guest_name || '(invité)'
                                        const email = isMember ? b.profiles.email : b.guest_email
                                        const phone = isMember ? b.profiles.phone : b.guest_phone
                                        return (
                                          <li key={b.id} className="text-sm flex flex-wrap items-baseline gap-x-2">
                                            <span className="font-semibold text-warm-900">{name}</span>
                                            {isMember && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-600">adhérent</span>}
                                            <span className="text-warm-500">{email}</span>
                                            {phone && <span className="text-warm-400">· {phone}</span>}
                                            {b.reason && <span className="text-warm-400 italic">— {libelleMotif(b.reason)}</span>}
                                          </li>
                                        )
                                      })}
                                    </ul>
                                  )}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-white rounded-3xl shadow-card border border-warm-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-display font-bold text-lg text-warm-900">Réservations</h2>
                  <label className="flex items-center gap-2 text-sm text-warm-500 cursor-pointer">
                    <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} />
                    Afficher les annulées
                  </label>
                </div>

                {bookings.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-warm-200 rounded-2xl">
                    <Calendar className="w-10 h-10 text-warm-300 mx-auto mb-2" />
                    <p className="text-warm-500 text-sm">Aucune réservation.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-warm-100 text-warm-400 font-semibold text-xs uppercase">
                          <th className="pb-3">Nom</th>
                          <th className="pb-3">Contact</th>
                          <th className="pb-3">Créneau</th>
                          <th className="pb-3">Notes</th>
                          <th className="pb-3">Statut</th>
                          <th className="pb-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b) => {
                          const isMember = !!b.profiles
                          const name = isMember
                            ? `${b.profiles.first_name || ''} ${b.profiles.last_name || ''}`.trim() || '(adhérent)'
                            : b.guest_name || '(invité)'
                          const email = isMember ? b.profiles.email : b.guest_email
                          const phone = isMember ? b.profiles.phone : b.guest_phone
                          const slot = b.appointment_slots

                          return (
                            <tr key={b.id} className="border-b border-warm-50 align-top">
                              <td className="py-3 font-semibold text-warm-900">
                                {name}
                                {isMember && <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-600">adhérent</span>}
                              </td>
                              <td className="py-3 text-warm-600">
                                {email}
                                {phone && <div className="text-xs text-warm-400">{phone}</div>}
                              </td>
                              <td className="py-3 text-warm-600">
                                {slot ? (
                                  <>
                                    {TYPE_LABELS[slot.type] || slot.type}
                                    <div className="text-xs text-warm-400">{dateTimeFmt.format(new Date(slot.start_at))}</div>
                                  </>
                                ) : (
                                  <span className="text-warm-400">(créneau supprimé)</span>
                                )}
                              </td>
                              <td className="py-3 text-warm-500 max-w-[200px]">{libelleMotif(b.reason)}</td>
                              <td className="py-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  b.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-warm-100 text-warm-500'
                                }`}>
                                  {b.status === 'confirmed' ? 'Confirmé' : 'Annulé'}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                {b.status === 'confirmed' && (
                                  <button onClick={() => handleCancelBooking(b.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" aria-label="Annuler">
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'exterieurs' && (
            <motion.div key="exterieurs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold">Données sensibles</p>
                  <p className="text-amber-800 text-xs mt-1 leading-relaxed">
                    Un rendez-vous médical ou en préfecture révèle la situation d&apos;une
                    personne. N&apos;enregistrez qu&apos;un intitulé neutre et les documents
                    à apporter — jamais un motif médical ni un détail de dossier.
                    Chaque saisie est journalisée.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-warm-100 p-6">
                <h2 className="font-display font-bold text-lg text-warm-900 mb-4">Rechercher un adhérent</h2>
                <form onSubmit={handleRechercheAdherent} className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="email@exemple.fr"
                    value={rechercheEmail}
                    onChange={(e) => setRechercheEmail(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Button type="submit" variant="primary" isLoading={recherchant}>Rechercher</Button>
                </form>

                {adherentIntrouvable && (
                  <p className="text-sm text-warm-600 mt-4">
                    Aucun adhérent avec cette adresse. Vérifiez l&apos;orthographe : la
                    recherche est exacte, pour ne pas transformer cet outil en annuaire.
                  </p>
                )}
              </div>

              {adherent && (
                <>
                  <div className="bg-white rounded-2xl border border-warm-100 p-6">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="font-bold text-warm-900">{adherent.first_name} {adherent.last_name}</p>
                        <p className="text-sm text-warm-500">{adherent.email}</p>
                      </div>
                      {adherent.external_appointments_consent ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                          Suivi autorisé
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          Suivi non autorisé
                        </span>
                      )}
                    </div>

                    {!adherent.external_appointments_consent && (
                      <p className="text-sm text-warm-600 mt-4 leading-relaxed">
                        Cette personne n&apos;a pas encore autorisé le suivi de ses
                        rendez-vous. Elle peut le faire elle-même depuis son espace
                        adhérent, onglet Profil. Tant que ce n&apos;est pas fait, aucune
                        saisie n&apos;est possible.
                      </p>
                    )}
                  </div>

                  {adherent.external_appointments_consent && (
                    <div className="bg-white rounded-2xl border border-warm-100 p-6">
                      <h2 className="font-display font-bold text-lg text-warm-900 mb-4">Ajouter un rendez-vous</h2>
                      <form onSubmit={handleAddRdvExterieur} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="ext-cat" className="block text-sm font-medium text-warm-700 mb-1.5">Catégorie</label>
                            <select
                              id="ext-cat"
                              value={extCategory}
                              onChange={(e) => setExtCategory(e.target.value)}
                              className="w-full px-4 py-2.5 border border-warm-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                            >
                              {EXTERNAL_CATEGORIES.map((c) => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                              ))}
                            </select>
                          </div>
                          <Input
                            label="Intitulé"
                            placeholder="Renouvellement de titre de séjour"
                            value={extTitle}
                            onChange={(e) => setExtTitle(e.target.value)}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <Input label="Date" type="date" value={extDate} onChange={(e) => setExtDate(e.target.value)} required />
                          <Input label="Heure" type="time" value={extTime} onChange={(e) => setExtTime(e.target.value)} required />
                          <Input
                            label="Lieu (facultatif)"
                            placeholder="Préfecture du Bas-Rhin"
                            value={extLocation}
                            onChange={(e) => setExtLocation(e.target.value)}
                          />
                        </div>

                        <div>
                          <label htmlFor="ext-prep" className="block text-sm font-medium text-warm-700 mb-1.5">
                            Documents à apporter (facultatif)
                          </label>
                          <textarea
                            id="ext-prep"
                            value={extPreparation}
                            onChange={(e) => setExtPreparation(e.target.value)}
                            rows={3}
                            maxLength={1000}
                            placeholder="Passeport, 2 photos, justificatif de domicile de moins de 3 mois"
                            className="w-full px-4 py-2.5 border border-warm-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                          />
                          <p className="text-xs text-warm-500 mt-1.5">
                            Uniquement la liste des pièces. Aucun élément de dossier ni
                            d&apos;information médicale.
                          </p>
                        </div>

                        <Button type="submit" variant="primary" isLoading={submitting}>Enregistrer</Button>
                      </form>
                    </div>
                  )}

                  <div className="bg-white rounded-2xl border border-warm-100 p-6">
                    <h2 className="font-display font-bold text-lg text-warm-900 mb-4">
                      Rendez-vous enregistrés ({rdvExterieurs.length})
                    </h2>
                    {rdvExterieurs.length === 0 ? (
                      <p className="text-sm text-warm-500">Aucun rendez-vous pour cette personne.</p>
                    ) : (
                      <div className="space-y-3">
                        {rdvExterieurs.map((r) => (
                          <div key={r.id} className="flex items-start justify-between gap-3 p-4 border border-warm-100 rounded-xl">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-warm-900">{r.title}</p>
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-secondary-50 text-secondary-700 border border-secondary-200">
                                  {libelleCategorie(r.category)}
                                </span>
                              </div>
                              <p className="text-xs text-warm-500 mt-0.5">
                                {dateTimeFmt.format(new Date(r.starts_at))}
                                {r.location ? ` — ${r.location}` : ''}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteRdvExterieur(r.id)}
                              className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors shrink-0"
                              aria-label="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
