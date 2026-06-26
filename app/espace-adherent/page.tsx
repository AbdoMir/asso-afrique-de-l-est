'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, CreditCard, FileText, Settings, LogOut, Heart, 
  AlertTriangle, ShieldCheck, CheckCircle2, Download, Calendar, Mail, Phone, MapPin 
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toaster'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function MemberDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'donations' | 'receipts' | 'profile'>('overview')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [donations, setDonations] = useState<any[]>([])
  const [membership, setMembership] = useState<any>(null)
  const [receipts, setReceipts] = useState<any[]>([])
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

  // Supabase component client
  let supabase: any = null
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      supabase = createClient()
    }
  } catch (e) {
    console.error('Supabase init failed', e)
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      
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

        // Mock Receipts
        setReceipts([
          { id: 'rec-1', year: 2026, total_amount: 50.0, cerfa_number: 'CERFA-2026-000104' },
          { id: 'rec-2', year: 2025, total_amount: 240.0, cerfa_number: 'CERFA-2025-000842' },
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

        // Receipts
        const { data: recData } = await supabase
          .from('fiscal_receipts')
          .select('*')
          .eq('user_id', sbUser.id)
          .order('year', { ascending: false })

        if (recData) {
          setReceipts(recData)
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

  const handleCancelSubscription = async () => {
    const confirm = window.confirm("Vous allez être redirigé vers le portail sécurisé Stripe pour gérer ou résilier votre don mensuel. Continuer ?")
    if (!confirm) return

    setPortalLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', { method: 'POST' })
      const result = await response.json()

      if (!response.ok || !result.url) {
        throw new Error(result.error || "Impossible d'ouvrir le portail de gestion.")
      }

      window.location.href = result.url
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible d\'ouvrir le portail de gestion. Contactez-nous directement.',
        variant: 'error',
      })
      setPortalLoading(false)
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
              {[
                { id: 'overview', label: 'Tableau de bord', icon: User },
                { id: 'donations', label: 'Dons & Adhésions', icon: CreditCard },
                { id: 'receipts', label: 'Reçus fiscaux', icon: FileText },
                { id: 'profile', label: 'Mon Profil', icon: Settings },
              ].map((item) => (
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
                    <p className="text-warm-500 text-sm">Téléchargez vos reçus CERFA annuels officiels</p>
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

                  {receipts.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-warm-200 rounded-2xl">
                      <FileText className="w-12 h-12 text-warm-300 mx-auto mb-3" />
                      <p className="text-warm-500 font-medium">Aucun reçu fiscal disponible pour le moment.</p>
                      <p className="text-xs text-warm-400 mt-1 max-w-sm mx-auto">
                        Les reçus annuels sont édités automatiquement chaque début d&apos;année (en janvier) pour l&apos;année précédente.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {receipts.map((rec) => (
                        <div key={rec.id} className="flex items-center justify-between p-4 border border-warm-100 rounded-xl hover:border-primary-300 hover:shadow-sm transition-all bg-white">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-warm-100 flex items-center justify-center text-warm-600">
                              <Calendar className="w-5 h-5 text-primary-500" />
                            </div>
                            <div>
                              <p className="font-bold text-warm-900">Reçu fiscal de l&apos;année {rec.year}</p>
                              <p className="text-xs text-warm-500">{rec.cerfa_number} • Montant cumulé : {rec.total_amount} €</p>
                            </div>
                          </div>
                          <a 
                            href={`/api/receipts/generate?year=${rec.year}`}
                            download
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 px-3.5 py-2 rounded-lg transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Télécharger CERFA
                          </a>
                        </div>
                      ))}
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
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  )
}
