'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Globe, Mail, Lock, User, Phone, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toaster'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/espace-adherent'
  
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot'>('login')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  
  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')

  // Supabase component client
  // Using try/catch to avoid crash if env vars are missing
  let supabase: any = null
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      supabase = createClient()
    }
  } catch (e) {
    console.error('Supabase init failed', e)
  }

  const isMockMode = !supabase

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    if (isMockMode) {
      // Simulate login
      setTimeout(() => {
        setLoading(false)
        // Store mock session info in localStorage
        localStorage.setItem('aes_mock_user', JSON.stringify({
          id: 'mock-user-uuid',
          email,
          first_name: firstName || 'Abdoulaye',
          last_name: lastName || 'Diallo',
          phone: phone || '+33 6 12 34 56 78',
          address: '15 Rue de la Solidarité',
          city: 'Paris',
          zip_code: '75019',
          country: 'FR'
        }))
        toast({
          title: 'Connexion réussie (Démo)',
          description: 'Vous êtes connecté à votre espace adhérent fictif.',
          variant: 'success',
        })
        router.push(redirect)
      }, 1000)
      return
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast({
        title: 'Connexion réussie',
        description: 'Ravi de vous revoir !',
        variant: 'success',
      })
      router.push(redirect)
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Identifiants invalides')
      toast({
        title: 'Erreur de connexion',
        description: err.message || 'Veuillez vérifier vos identifiants',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    if (isMockMode) {
      setTimeout(() => {
        setLoading(false)
        localStorage.setItem('aes_mock_user', JSON.stringify({
          id: 'mock-user-uuid',
          email,
          first_name: firstName,
          last_name: lastName,
          phone: phone || '+33 6 12 34 56 78',
          address: '15 Rue de la Solidarité',
          city: 'Paris',
          zip_code: '75019',
          country: 'FR'
        }))
        toast({
          title: 'Inscription réussie (Démo)',
          description: 'Votre compte fictif a bien été créé.',
          variant: 'success',
        })
        router.push(redirect)
      }, 1000)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=${redirect}`,
        },
      })

      if (error) throw error

      setSuccessMsg('Compte créé ! Veuillez vérifier votre email pour valider votre inscription.')
      toast({
        title: 'Validation requise',
        description: 'Veuillez valider votre adresse email.',
        variant: 'success',
      })
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue lors de l\'inscription.')
      toast({
        title: 'Erreur d\'inscription',
        description: err.message || 'Impossible de créer votre compte',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    if (isMockMode) {
      setTimeout(() => {
        setLoading(false)
        setSuccessMsg('Simulation : Un email de réinitialisation de mot de passe a été envoyé.')
      }, 1000)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/espace-adherent/nouveau-mot-de-passe`,
      })

      if (error) throw error

      setSuccessMsg('Un email de réinitialisation de mot de passe a été envoyé.')
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-warm-50">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-100/40 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-secondary-100/30 translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        
        {/* Mock alert */}
        {isMockMode && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-800 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold">Mode Démo actif</p>
              <p className="text-amber-700/95 mt-0.5">
                Aucune base de données Supabase détectée. Le système tourne en mode simulation. 
                Saisissez n&apos;importe quelle adresse email pour tester instantanément.
              </p>
            </div>
          </div>
        )}

        {/* Card wrapper */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-card border border-warm-100">
          
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 group mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white">
                <Globe className="w-4 h-4" />
              </div>
              <span className="font-display font-black text-warm-900 text-sm">Afrique de l&apos;Est</span>
            </Link>
            
            <h1 className="font-display font-black text-3xl text-warm-900">
              {activeTab === 'login' && 'Espace adhérent'}
              {activeTab === 'signup' && 'Devenir membre'}
              {activeTab === 'forgot' && 'Mot de passe oublié'}
            </h1>
            <p className="text-warm-500 text-sm mt-1.5">
              {activeTab === 'login' && 'Connectez-vous pour suivre vos dons et reçus.'}
              {activeTab === 'signup' && 'Rejoignez-nous et soutenez nos actions.'}
              {activeTab === 'forgot' && 'Saisissez votre email pour réinitialiser.'}
            </p>
          </div>

          {/* Error / Success boxes */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex gap-2 items-center">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex gap-2 items-center">
              <CheckCircle className="w-4 h-4 shrink-0 text-green-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <AnimatePresence mode="wait">
            {activeTab === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <Input
                  type="email"
                  label="Adresse email"
                  placeholder="nom@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftAddon={<Mail className="w-4 h-4" />}
                />
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="label">Mot de passe</label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('forgot')}
                      className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                    >
                      Oublié ?
                    </button>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftAddon={<Lock className="w-4 h-4" />}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center mt-6"
                  isLoading={loading}
                >
                  Se connecter
                </Button>

                <p className="text-center text-sm text-warm-500 mt-4">
                  Nouveau chez nous ?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('signup')}
                    className="font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    Créer un compte
                  </button>
                </p>
              </motion.form>
            )}

            {activeTab === 'signup' && (
              <motion.form
                key="signup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSignup}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    label="Prénom"
                    placeholder="Abdoulaye"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    leftAddon={<User className="w-4 h-4" />}
                  />
                  <Input
                    type="text"
                    label="Nom"
                    placeholder="Diallo"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    leftAddon={<User className="w-4 h-4" />}
                  />
                </div>

                <Input
                  type="email"
                  label="Adresse email"
                  placeholder="nom@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftAddon={<Mail className="w-4 h-4" />}
                />

                <Input
                  type="tel"
                  label="Téléphone (facultatif)"
                  placeholder="+33 6 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftAddon={<Phone className="w-4 h-4" />}
                />

                <Input
                  type="password"
                  label="Mot de passe"
                  placeholder="Minimum 6 caractères"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftAddon={<Lock className="w-4 h-4" />}
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center mt-6"
                  isLoading={loading}
                >
                  S&apos;inscrire
                </Button>

                <p className="text-center text-sm text-warm-500 mt-4">
                  Déjà membre ?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    Se connecter
                  </button>
                </p>
              </motion.form>
            )}

            {activeTab === 'forgot' && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleForgotPassword}
                className="space-y-4"
              >
                <Input
                  type="email"
                  label="Adresse email"
                  placeholder="nom@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftAddon={<Mail className="w-4 h-4" />}
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center mt-6"
                  isLoading={loading}
                >
                  Réinitialiser le mot de passe
                </Button>

                <p className="text-center text-sm text-warm-500 mt-4">
                  Retourner à la{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    connexion
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
