'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSafe, DEMO_MODE_ALLOWED } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, CreditCard, FileText, Settings, LogOut, Heart,
  AlertTriangle, ShieldCheck, CheckCircle2, Download, Calendar, Mail, Phone, MapPin,
  Trash2, Clock, X, KeyRound
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toaster'
import { formatCurrency, formatDate } from '@/lib/utils'
import { APPOINTMENT_TYPE_LABELS, libelleCategorie } from '@/lib/rendez-vous'

const appointmentDateTimeFmt = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
})

export default function MemberDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'donations' | 'receipts' | 'rdv' | 'profile'>('overview')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [donations, setDonations] = useState<any[]>([])
  const [membership, setMembership] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [externalAppointments, setExternalAppointments] = useState<any[]>([])
  const [rdvConsent, setRdvConsent] = useState(false)
  const [rdvConsentAt, setRdvConsentAt] = useState<string | null>(null)
  const [savingConsent, setSavingConsent] = useState(false)
  const [isMock, setIsMock] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  // Profile Form States
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [updatingProfile, setUpdatingProfile] = useState(false)

  // Droits RGPD : export (art. 15 et 20) et suppression du compte (art. 17)
  const [exporting, setExporting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)

  const supabase = createClientSafe()

  useEffect(() => {
    async function loadData() {
      setLoading(true)

      // Sans Supabase configuré, on ne rejoue une session factice qu'en
      // développement : en production, l'espace adhérent doit rester fermé.
      if (!supabase && !DEMO_MODE_ALLOWED) {
        toast({
          title: 'Service indisponible',
          description: "L'espace adhérent est momentanément inaccessible. Merci de réessayer plus tard.",
          variant: 'error',
        })
        router.push('/')
        return
      }

      // 1. If no supabase client, load from localStorage
      if (!supabase) {
        setIsMock(true)
        const mockUserStr = localStorage.getItem('aes_mock_user')
        if (!mockUserStr) {
          toast({
            title: 'Accès restreint',
            description: 'Veuillez vous connecter pour accéder à l\'espace adhérent.',
            variant: 'error',
          })
          router.push('/login')
          return
        }

        const mockUser = JSON.parse(mockUserStr)
        setUser({ id: mockUser.id, email: mockUser.email })
        setProfile(mockUser)
        
        setFirstName(mockUser.first_name || '')
        setLastName(mockUser.last_name || '')
        setPhone(mockUser.phone || '')
        setAddress(mockUser.address || '')
        setCity(mockUser.city || '')
        setZipCode(mockUser.zip_code || '')

        // Mock Membership
        setMembership({
          type: 'monthly_10',
          status: 'active',
          amount: 10,
          frequency: 'monthly',
          date_start: '2026-02-15',
        })

        // Mock Donations
        setDonations([
          { id: 'don-1', amount: 10, frequency: 'monthly', status: 'succeeded', created_at: '2026-06-15T12:00:00Z' },
          { id: 'don-2', amount: 10, frequency: 'monthly', status: 'succeeded', created_at: '2026-05-15T12:00:00Z' },
          { id: 'don-3', amount: 10, frequency: 'monthly', status: 'succeeded', created_at: '2026-04-15T12:00:00Z' },
          { id: 'don-4', amount: 10, frequency: 'monthly', status: 'succeeded', created_at: '2026-03-15T12:00:00Z' },
          { id: 'don-5', amount: 10, frequency: 'monthly', status: 'succeeded', created_at: '2026-02-15T12:00:00Z' },
          { id: 'don-6', amount: 50, frequency: 'once', status: 'succeeded', created_at: '2025-12-10T14:30:00Z' },
        ])

        // Mock Appointments
        setAppointments([
          {
            id: 'rdv-1',
            status: 'confirmed',
            appointment_slots: { type: 'administratif', start_at: '2026-08-05T14:00:00Z' },
          },
        ])

        setLoading(false)
        return
      }

      // 2. Real Supabase Load
      try {
        const { data: { user: sbUser } } = await supabase.auth.getUser()
        
        if (!sbUser) {
          router.push('/login?redirect=/espace-adherent')
          return
        }

        setUser(sbUser)

        // Profile
        const { data: profData, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sbUser.id)
          .single()

        if (profData) {
          setProfile(profData)
          setFirstName(profData.first_name || '')
          setLastName(profData.last_name || '')
          setPhone(profData.phone || '')
          setAddress(profData.address || '')
          setCity(profData.city || '')
          setZipCode(profData.zip_code || '')
          setRdvConsent(profData.external_appointments_consent || false)
          setRdvConsentAt(profData.external_appointments_consent_at || null)
        }

        // Active Membership
        const { data: memData } = await supabase
          .from('memberships')
          .select('*')
          .eq('user_id', sbUser.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)

        if (memData && memData.length > 0) {
          setMembership(memData[0])
        }

        // Donations
        const { data: donData } = await supabase
          .from('donations')
          .select('*')
          .eq('user_id', sbUser.id)
          .order('created_at', { ascending: false })

        if (donData) {
          setDonations(donData)
        }

        // Les reçus fiscaux CERFA sont édités et envoyés par HelloAsso :
        // rien à charger ici, l'onglet renvoie vers le compte HelloAsso.

        // Rendez-vous extérieurs saisis par l'association. La policy RLS
        // restreint déjà la lecture à ceux de la personne connectée.
        const { data: externesData } = await supabase
          .from('external_appointments')
          .select('*')
          .order('starts_at', { ascending: true })

        if (externesData) setExternalAppointments(externesData)

        // Appointments (RDV)
        const { data: bookingData } = await supabase
          .from('appointment_bookings')
          .select('*')
          .eq('user_id', sbUser.id)
          .order('created_at', { ascending: false })

        if (bookingData && bookingData.length > 0) {
          const slotIds = bookingData.map((b: any) => b.slot_id)
          const { data: slotData } = await supabase
            .from('appointment_slots')
            .select('*')
            .in('id', slotIds)

          const slotsById = new Map((slotData || []).map((s: any) => [s.id, s]))
          setAppointments(
            bookingData.map((b: any) => ({ ...b, appointment_slots: slotsById.get(b.slot_id) }))
          )
        }

      } catch (err: any) {
        console.error('Error fetching dashboard data:', err)
        toast({
          title: 'Erreur',
          description: 'Impossible de récupérer vos données.',
          variant: 'error',
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdatingProfile(true)

    if (isMock) {
      setTimeout(() => {
        setUpdatingProfile(false)
        const updated = {
          ...profile,
          first_name: firstName,
          last_name: lastName,
          phone,
          address,
          city,
          zip_code: zipCode,
        }
        setProfile(updated)
        localStorage.setItem('aes_mock_user', JSON.stringify(updated))
        toast({
          title: 'Profil mis à jour',
          description: 'Vos modifications fictives ont été enregistrées localement.',
          variant: 'success',
        })
      }, 800)
      return
    }

    // Les cas sans client (démo, indisponible) sont traités en amont.
    if (!supabase) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone,
          address,
          city,
          zip_code: zipCode,
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile({
        ...profile,
        first_name: firstName,
        last_name: lastName,
        phone,
        address,
        city,
        zip_code: zipCode,
      })

      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées.',
        variant: 'success',
      })
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de mettre à jour le profil.',
        variant: 'error',
      })
    } finally {
      setUpdatingProfile(false)
    }
  }

  /**
   * Consentement au suivi des rendez-vous extérieurs (art. 9.2.a).
   *
   * Le retrait ne supprime pas les rendez-vous déjà enregistrés : l'adhérent
   * les attend peut-être. Il bloque toute nouvelle saisie, et chaque entrée
   * reste supprimable une par une.
   */
  const handleToggleRdvConsent = async (consent: boolean) => {
    if (isMock) {
      toast({
        title: 'Mode Démo',
        description: "Le consentement n'est pas modifiable en mode démo.",
      })
      return
    }

    setSavingConsent(true)
    try {
      const response = await fetch('/api/compte/consentement-rendez-vous', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Enregistrement impossible.')

      setRdvConsent(consent)
      setRdvConsentAt(consent ? new Date().toISOString() : null)

      toast({
        title: consent ? 'Suivi activé' : 'Suivi désactivé',
        description: consent
          ? "L'association pourra enregistrer vos rendez-vous extérieurs."
          : 'Aucun nouveau rendez-vous ne sera enregistré.',
        variant: 'success',
      })
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de modifier ce réglage.',
        variant: 'error',
      })
    } finally {
      setSavingConsent(false)
    }
  }

  const handleDeleteExternalAppointment = async (id: string) => {
    if (!window.confirm('Supprimer ce rendez-vous de votre tableau de bord ?')) return

    try {
      const response = await fetch(`/api/compte/rendez-vous-exterieurs/${id}`, { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Suppression impossible.')

      setExternalAppointments((prev) => prev.filter((a) => a.id !== id))
      toast({ title: 'Rendez-vous supprimé', variant: 'success' })
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de supprimer ce rendez-vous.',
        variant: 'error',
      })
    }
  }

  // ─── Droits RGPD ───────────────────────────────────────────────────────────

  /** Droit d'accès et de portabilité (art. 15 et 20) : export JSON. */
  const handleExportData = async () => {
    if (isMock) {
      toast({
        title: 'Mode Démo',
        description: "L'export de données n'est pas disponible en mode démo.",
      })
      return
    }

    setExporting(true)
    try {
      const response = await fetch('/api/compte/export')
      if (!response.ok) throw new Error("L'export a échoué.")

      // Passer par un Blob plutôt que par un lien direct : la route exige la
      // session, qu'un téléchargement déclenché hors fetch ne porterait pas
      // toujours selon le navigateur.
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `mes-donnees-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: 'Export téléchargé',
        description: 'Le fichier contient toutes les données que nous détenons sur vous.',
        variant: 'success',
      })
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message || "Impossible d'exporter vos données.",
        variant: 'error',
      })
    } finally {
      setExporting(false)
    }
  }

  /** Droit à l'effacement (art. 17). Irréversible. */
  const handleDeleteAccount = async () => {
    if (isMock) {
      toast({
        title: 'Mode Démo',
        description: "La suppression de compte n'est pas disponible en mode démo.",
      })
      return
    }

    setDeleting(true)
    try {
      const response = await fetch('/api/compte/suppression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'La suppression a échoué.')

      toast({
        title: 'Compte supprimé',
        description: 'Vos données personnelles ont été effacées. Merci de nous avoir accompagnés.',
        variant: 'success',
      })

      router.push('/')
      router.refresh()
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de supprimer votre compte.',
        variant: 'error',
      })
      setDeleting(false)
    }
  }

  const handleLogout = async () => {
    if (isMock) {
      localStorage.removeItem('aes_mock_user')
      toast({
        title: 'Déconnexion',
        description: 'Vous êtes maintenant déconnecté.',
        variant: 'success',
      })
      router.push('/')
      return
    }

    // Les cas sans client (démo, indisponible) sont traités en amont.
    if (!supabase) return

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/')
      router.refresh()
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de vous déconnecter.',
        variant: 'error',
      })
    }
  }

  // Les dons récurrents sont gérés par HelloAsso : c'est depuis son compte
  // HelloAsso que le donateur suspend ou résilie son prélèvement. L'association
  // n'a pas la main dessus.
  const handleCancelSubscription = async () => {
    const confirm = window.confirm(
      'La gestion de votre don mensuel se fait depuis votre compte HelloAsso. Vous allez y être redirigé. Continuer ?'
    )
    if (!confirm) return

    window.open('https://www.helloasso.com/mon-compte/adhesions-et-dons', '_blank', 'noopener,noreferrer')
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    const confirmCancel = window.confirm('Annuler ce rendez-vous ?')
    if (!confirmCancel) return

    if (isMock) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status: 'cancelled' } : a))
      )
      toast({ title: 'Rendez-vous annulé', variant: 'success' })
      return
    }

    try {
      const response = await fetch(`/api/rendez-vous/${appointmentId}`, { method: 'DELETE' })
      const result = await response.json()

      if (!response.ok) throw new Error(result.error || 'Erreur lors de l\'annulation.')

      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status: 'cancelled' } : a))
      )
      toast({ title: 'Rendez-vous annulé', variant: 'success' })
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible d\'annuler ce rendez-vous.',
        variant: 'error',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-warm-600 font-medium">Chargement de votre espace adhérent...</p>
        </div>
      </div>
    )
  }

  const userInitials = profile ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() : 'U'
  const displayName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : user?.email

  return (
    <div className="min-h-screen bg-warm-50 py-12">
      <div className="container-custom">
        
        {/* Mock alert indicator */}
        {isMock && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-800 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold">Mode Démo actif (Données Fictives)</p>
              <p className="text-amber-700/90 mt-0.5">
                Vous visitez l&apos;espace membre simulé. Vous pouvez modifier votre profil fictif ou 
                télécharger de faux reçus fiscaux générés en temps réel.
              </p>
            </div>
          </div>
        )}

        {/* Dashboard Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar Profile Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl shadow-card border border-warm-100 p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white font-display font-black text-2xl mx-auto shadow-warm mb-4">
              {userInitials}
            </div>
            
            <h2 className="font-display font-bold text-xl text-warm-900 leading-tight mb-1">{displayName}</h2>
            <p className="text-sm text-warm-500 mb-6">{user?.email}</p>
            
            {/* Nav Menu */}
            <div className="space-y-1.5 text-left border-t border-warm-100 pt-6">
              {(profile?.is_staff
                ? [{ id: 'overview', label: 'Tableau de bord', icon: User }]
                : [
                    { id: 'overview', label: 'Tableau de bord', icon: User },
                    { id: 'donations', label: 'Dons & Adhésions', icon: CreditCard },
                    { id: 'receipts', label: 'Reçus fiscaux', icon: FileText },
                    { id: 'rdv', label: 'Mes RDV', icon: Calendar },
                    { id: 'profile', label: 'Mon Profil', icon: Settings },
                  ]
              ).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                    activeTab === item.id 
                      ? 'bg-primary-500 text-white shadow-warm' 
                      : 'text-warm-700 hover:bg-warm-100 hover:text-primary-600'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}

              {profile?.is_staff && (
                <>
                  <button
                    onClick={() => router.push('/admin/rendez-vous')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-warm-700 hover:bg-warm-100 hover:text-primary-600 transition-all mt-4 border-t border-warm-100 pt-4"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Administration
                  </button>
                  <button
                    onClick={() => router.push('/admin/securite')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-warm-700 hover:bg-warm-100 hover:text-primary-600 transition-all"
                  >
                    <KeyRound className="w-4 h-4" />
                    Sécurité
                  </button>
                </>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50 transition-colors mt-4"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          </div>

          {/* Right Main Content Card */}
          <div className="lg:col-span-8 bg-white rounded-3xl shadow-card border border-warm-100 p-6 md:p-8 min-h-[500px]">
            <AnimatePresence mode="wait">
              
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-display font-black text-2xl text-warm-900 mb-2">
                      Bonjour, {profile?.first_name || 'Ami'} ! 👋
                    </h3>
                    <p className="text-warm-500">
                      Bienvenue dans votre espace membre. Merci pour votre engagement envers l&apos;intégration des familles.
                    </p>
                  </div>

                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-100">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary-700">Adhésion & Don</span>
                        <ShieldCheck className="w-5 h-5 text-primary-500" />
                      </div>
                      {membership ? (
                        <div>
                          <p className="font-display font-black text-xl text-warm-900 mb-1">
                            {membership.amount}€ / mois
                          </p>
                          <p className="text-xs text-warm-600">
                            Actif depuis le {formatDate(membership.date_start)}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-warm-700 text-sm mb-2">Aucun soutien mensuel actif</p>
                          <Button variant="primary" size="sm" onClick={() => router.push('/adherer-soutenir')}>
                            Faire un don mensuel
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-br from-secondary-50 to-secondary-100/50 border border-secondary-100">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-secondary-700">Dons cumulés</span>
                        <Heart className="w-5 h-5 text-secondary-500" />
                      </div>
                      <p className="font-display font-black text-xl text-warm-900 mb-1">
                        {formatCurrency(donations.reduce((sum, d) => sum + Number(d.amount), 0))}
                      </p>
                      <p className="text-xs text-warm-600">
                        Total versé à l&apos;association
                      </p>
                    </div>
                  </div>

                  {/* Impact notice */}
                  <div className="bg-warm-900 text-white rounded-2xl p-6">
                    <h4 className="font-bold text-lg mb-2 text-warm-100">🌍 Votre impact direct</h4>
                    <p className="text-warm-300 text-sm leading-relaxed mb-4">
                      Grâce à vos contributions cumulées, l&apos;association a pu financer des cours individuels de français, 
                      des accompagnements administratifs et des sorties culturelles pour les enfants.
                    </p>
                    <div className="flex gap-4 text-xs font-semibold text-warm-200">
                      <div>• FLE : ~12 heures financées</div>
                      <div>• Accompagnement : 3 familles aidées</div>
                    </div>
                  </div>

                  {/* Quick Action links */}
                  <div className="border-t border-warm-100 pt-6">
                    <h4 className="font-bold text-warm-900 mb-4 text-sm uppercase tracking-wider">Liens rapides</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {profile?.is_staff ? (
                        <button
                          onClick={() => router.push('/admin/rendez-vous')}
                          className="p-3 text-left border border-warm-100 hover:border-primary-200 rounded-xl hover:bg-warm-50 text-sm font-semibold transition-colors"
                        >
                          🛠️ Aller à l&apos;administration
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setActiveTab('receipts')}
                            className="p-3 text-left border border-warm-100 hover:border-primary-200 rounded-xl hover:bg-warm-50 text-sm font-semibold transition-colors"
                          >
                            📄 Télécharger mes reçus
                          </button>
                          <button
                            onClick={() => setActiveTab('profile')}
                            className="p-3 text-left border border-warm-100 hover:border-primary-200 rounded-xl hover:bg-warm-50 text-sm font-semibold transition-colors"
                          >
                            ⚙️ Modifier mes coordonnées
                          </button>
                          <button
                            onClick={() => router.push('/adherer-soutenir')}
                            className="p-3 text-left border border-warm-100 hover:border-primary-200 rounded-xl hover:bg-warm-50 text-sm font-semibold transition-colors"
                          >
                            💚 Soutenir à nouveau
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Donations List */}
              {activeTab === 'donations' && (
                <motion.div
                  key="donations"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-display font-black text-2xl text-warm-900">Mes Dons & Adhésions</h3>
                      <p className="text-warm-500 text-sm">Historique de vos soutiens financiers</p>
                    </div>
                    {membership && membership.status === 'active' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelSubscription}
                        isLoading={portalLoading}
                        className="text-red-500 hover:bg-red-50"
                      >
                        Gérer / résilier le don mensuel
                      </Button>
                    )}
                  </div>

                  {donations.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-warm-200 rounded-2xl">
                      <CreditCard className="w-12 h-12 text-warm-300 mx-auto mb-3" />
                      <p className="text-warm-500 font-medium">Vous n&apos;avez fait aucun don pour le moment.</p>
                      <Button variant="primary" size="sm" className="mt-4" onClick={() => router.push('/adherer-soutenir')}>
                        Faire mon premier don
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-warm-100 text-warm-400 font-semibold">
                            <th className="pb-3">Date</th>
                            <th className="pb-3">Type</th>
                            <th className="pb-3">Montant</th>
                            <th className="pb-3">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donations.map((don) => (
                            <tr key={don.id} className="border-b border-warm-50 hover:bg-warm-50/50 transition-colors">
                              <td className="py-4 text-warm-600 font-medium">{formatDate(don.created_at)}</td>
                              <td className="py-4 text-warm-900 font-bold capitalize">
                                {don.frequency === 'monthly' ? 'Don mensuel' : 'Don unique / Adhésion'}
                              </td>
                              <td className="py-4 text-primary-600 font-extrabold">{don.amount} €</td>
                              <td className="py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  don.status === 'succeeded' 
                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                    : 'bg-warm-100 text-warm-600'
                                }`}>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Confirmé
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 3: Tax Receipts */}
              {activeTab === 'receipts' && (
                <motion.div
                  key="receipts"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-display font-black text-2xl text-warm-900">Mes Reçus Fiscaux</h3>
                    <p className="text-warm-500 text-sm">Vos reçus CERFA sont émis par HelloAsso</p>
                  </div>

                  {/* Deduction box info */}
                  <div className="p-5 rounded-2xl bg-secondary-50 border border-secondary-100 text-secondary-900 flex gap-4 items-center">
                    <ShieldCheck className="w-8 h-8 text-secondary-500 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Déduction Fiscale active (66%)</p>
                      <p className="text-xs text-secondary-700 mt-0.5 leading-relaxed">
                        Chaque reçu vous permet de déduire 66% de vos versements annuels de votre impôt sur le revenu.
                        Par exemple, un reçu de 100€ réduit vos impôts de 66€.
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-warm-200 bg-white space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-warm-100 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-primary-500" />
                      </div>
                      <p className="font-bold text-warm-900">Où trouver vos reçus ?</p>
                    </div>
                    <p className="text-sm text-warm-600 leading-relaxed">
                      Vos paiements étant encaissés par HelloAsso, c&apos;est HelloAsso qui édite et
                      vous envoie directement votre reçu fiscal CERFA 11580*03 par email, à l&apos;adresse
                      utilisée lors du paiement.
                    </p>
                    <p className="text-sm text-warm-600 leading-relaxed">
                      Vous les retrouvez également à tout moment depuis votre compte HelloAsso,
                      rubrique <span className="font-semibold">« Mes paiements »</span>.
                    </p>
                    <a
                      href="https://www.helloasso.com/mon-compte/paiements"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 px-3.5 py-2 rounded-lg transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Accéder à mes reçus HelloAsso
                    </a>
                    <p className="text-xs text-warm-400 leading-relaxed pt-1">
                      Vous ne retrouvez pas un reçu ? Contactez-nous, nous ferons le nécessaire auprès de HelloAsso.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Tab 5: RDV */}
              {activeTab === 'rdv' && (
                <motion.div
                  key="rdv"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-display font-black text-2xl text-warm-900">Mes Rendez-vous</h3>
                      <p className="text-warm-500 text-sm">
                        Vos rendez-vous avec l&apos;association et ceux enregistrés pour vous
                      </p>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => router.push('/rendez-vous')}>
                      Prendre RDV
                    </Button>
                  </div>

                  {/* Rendez-vous extérieurs, saisis par l'association */}
                  {externalAppointments.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-warm-400">
                        Vos démarches extérieures
                      </p>
                      {externalAppointments.map((rdv) => {
                        const aVenir = new Date(rdv.starts_at) > new Date()
                        return (
                          <div
                            key={rdv.id}
                            className={`p-4 border rounded-xl bg-white transition-all ${
                              aVenir ? 'border-primary-200 shadow-sm' : 'border-warm-100 opacity-70'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-secondary-50 flex items-center justify-center shrink-0">
                                  <MapPin className="w-5 h-5 text-secondary-600" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-bold text-warm-900">{rdv.title}</p>
                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-secondary-50 text-secondary-700 border border-secondary-200">
                                      {libelleCategorie(rdv.category)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-warm-500 capitalize mt-0.5">
                                    {appointmentDateTimeFmt.format(new Date(rdv.starts_at))}
                                    {rdv.location ? ` — ${rdv.location}` : ''}
                                  </p>
                                  {rdv.preparation && (
                                    <div className="mt-2 p-2.5 bg-warm-50 rounded-lg border border-warm-100">
                                      <p className="text-xs font-semibold text-warm-700 mb-0.5">
                                        À apporter
                                      </p>
                                      <p className="text-xs text-warm-600 whitespace-pre-line">
                                        {rdv.preparation}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteExternalAppointment(rdv.id)}
                                className="inline-flex items-center justify-center text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors shrink-0"
                                aria-label="Supprimer ce rendez-vous"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {externalAppointments.length > 0 && appointments.length > 0 && (
                    <p className="text-xs font-semibold uppercase tracking-wider text-warm-400 pt-2">
                      Avec l&apos;association
                    </p>
                  )}

                  {appointments.length === 0 && externalAppointments.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-warm-200 rounded-2xl">
                      <Calendar className="w-12 h-12 text-warm-300 mx-auto mb-3" />
                      <p className="text-warm-500 font-medium">Vous n&apos;avez aucun rendez-vous pour le moment.</p>
                      <Button variant="primary" size="sm" className="mt-4" onClick={() => router.push('/rendez-vous')}>
                        Prendre mon premier rendez-vous
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((appt) => {
                        const slot = appt.appointment_slots
                        const isFuture = slot && new Date(slot.start_at) > new Date()
                        return (
                          <div
                            key={appt.id}
                            className="flex items-center justify-between p-4 border border-warm-100 rounded-xl hover:border-primary-300 hover:shadow-sm transition-all bg-white"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-warm-100 flex items-center justify-center text-warm-600 shrink-0">
                                <Clock className="w-5 h-5 text-primary-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-warm-900 truncate">
                                  {slot ? APPOINTMENT_TYPE_LABELS[slot.type] || slot.type : 'Rendez-vous'}
                                </p>
                                <p className="text-xs text-warm-500 capitalize">
                                  {slot ? appointmentDateTimeFmt.format(new Date(slot.start_at)) : ''}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                appt.status === 'confirmed'
                                  ? 'bg-green-50 text-green-700 border border-green-200'
                                  : 'bg-warm-100 text-warm-500'
                              }`}>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {appt.status === 'confirmed' ? 'Confirmé' : 'Annulé'}
                              </span>
                              {appt.status === 'confirmed' && isFuture && (
                                <button
                                  onClick={() => handleCancelAppointment(appt.id)}
                                  className="inline-flex items-center justify-center text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                  aria-label="Annuler"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 4: Profile Editor */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-display font-black text-2xl text-warm-900">Coordonnées du Profil</h3>
                    <p className="text-warm-500 text-sm">Ces coordonnées figurent sur vos reçus fiscaux CERFA.</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="text"
                        label="Prénom"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        leftAddon={<User className="w-4 h-4" />}
                      />
                      <Input
                        type="text"
                        label="Nom"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        leftAddon={<User className="w-4 h-4" />}
                      />
                    </div>

                    <Input
                      type="tel"
                      label="Téléphone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      leftAddon={<Phone className="w-4 h-4" />}
                    />

                    <div className="border-t border-warm-100 pt-4 mt-6">
                      <h4 className="font-bold text-warm-900 mb-4 text-sm">Adresse de facturation (reçus fiscaux)</h4>
                      
                      <Input
                        type="text"
                        label="Adresse"
                        placeholder="12 rue des Fleurs"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        leftAddon={<MapPin className="w-4 h-4" />}
                      />

                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="col-span-1">
                          <Input
                            type="text"
                            label="Code Postal"
                            placeholder="75019"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="text"
                            label="Ville"
                            placeholder="Paris"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="mt-6"
                      isLoading={updatingProfile}
                    >
                      Enregistrer les modifications
                    </Button>
                  </form>

                  {/* ── Suivi des rendez-vous extérieurs (consentement art. 9) ── */}
                  <div className="border-t border-warm-100 pt-8 mt-10">
                    <div className="bg-secondary-50/60 border border-secondary-200 rounded-xl p-5 space-y-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-secondary-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-warm-900 text-sm">
                            Suivi de mes rendez-vous extérieurs
                          </p>
                          <p className="text-warm-600 text-xs mt-1 leading-relaxed">
                            L&apos;association peut enregistrer pour vous vos rendez-vous
                            à la préfecture, à la CAF, chez le médecin ou ailleurs, et
                            vous rappeler la veille ce qu&apos;il faut apporter. Tout
                            s&apos;affiche dans l&apos;onglet Mes Rendez-vous.
                          </p>
                          <p className="text-warm-600 text-xs mt-2 leading-relaxed">
                            Ces informations peuvent révéler votre santé ou votre
                            situation administrative. Nous ne les enregistrons donc
                            qu&apos;avec votre accord, que vous pouvez retirer à tout
                            moment. Les rendez-vous déjà notés resteront visibles, et
                            vous pourrez les supprimer un par un.
                          </p>
                        </div>
                      </div>

                      <div className="pl-8">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rdvConsent}
                            disabled={savingConsent}
                            onChange={(e) => handleToggleRdvConsent(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-warm-300 text-secondary-600 focus:ring-secondary-500 cursor-pointer"
                          />
                          <span className="text-sm text-warm-800">
                            J&apos;autorise l&apos;association à enregistrer mes
                            rendez-vous extérieurs pour m&apos;aider à les suivre.
                          </span>
                        </label>

                        {rdvConsent && rdvConsentAt && (
                          <p className="text-xs text-warm-500 mt-2 ml-7">
                            Accord donné le {formatDate(rdvConsentAt)}.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Droits RGPD ── */}
                  <div className="border-t border-warm-100 pt-8 mt-10 space-y-6">
                    <div>
                      <h3 className="font-display font-black text-2xl text-warm-900">
                        Mes données personnelles
                      </h3>
                      <p className="text-warm-500 text-sm">
                        Le RGPD vous donne la main sur les données que nous détenons sur vous.
                      </p>
                    </div>

                    {/* Export — art. 15 et 20 */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-warm-50 border border-warm-100 rounded-xl p-5">
                      <div className="flex-1">
                        <p className="font-semibold text-warm-900 text-sm">
                          Récupérer une copie de mes données
                        </p>
                        <p className="text-warm-500 text-xs mt-1 leading-relaxed">
                          Profil, adhésions, dons, reçus fiscaux, rendez-vous et
                          inscription à la newsletter, dans un fichier JSON.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleExportData}
                        isLoading={exporting}
                        leftIcon={<Download className="w-4 h-4" />}
                        className="shrink-0"
                      >
                        Exporter
                      </Button>
                    </div>

                    {/* Effacement — art. 17 */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-900 text-sm">
                            Supprimer mon compte
                          </p>
                          <p className="text-red-700 text-xs mt-1 leading-relaxed">
                            Votre compte, votre profil et vos
                            rendez-vous seront effacés définitivement. Cette
                            action est irréversible.
                          </p>
                          <p className="text-red-700 text-xs mt-2 leading-relaxed">
                            Vos dons et reçus fiscaux sont conservés 6 ans, comme
                            la loi comptable nous y oblige, mais ils ne seront
                            plus rattachés à votre compte.
                          </p>
                        </div>
                      </div>

                      <div className="pl-8 space-y-3">
                        <label className="block text-xs font-medium text-red-900">
                          Tapez <strong>SUPPRIMER</strong> pour confirmer
                          <input
                            type="text"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="SUPPRIMER"
                            autoComplete="off"
                            className="mt-1.5 w-full sm:w-64 px-3 py-2 text-sm border border-red-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                          />
                        </label>
                        <Button
                          variant="outline"
                          onClick={handleDeleteAccount}
                          isLoading={deleting}
                          disabled={deleteConfirmation !== 'SUPPRIMER'}
                          leftIcon={<Trash2 className="w-4 h-4" />}
                          className="border-red-300 text-red-700 hover:bg-red-100"
                        >
                          Supprimer définitivement mon compte
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  )
}
