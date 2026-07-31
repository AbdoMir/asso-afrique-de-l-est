'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, ShieldAlert, Loader2, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toaster'
import Link from 'next/link'

export default function SecuritePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [isStaff, setIsStaff] = useState(false)
  const [hasFactor, setHasFactor] = useState(false)
  const [isAal2, setIsAal2] = useState(false)

  const [enrolling, setEnrolling] = useState(false)
  const [starting, setStarting] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const checkAccess = useCallback(async () => {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setChecking(false)
        return
      }
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/admin/securite')
        return
      }

      const { data: profile } = await supabase.from('profiles').select('is_staff').eq('id', user.id).single()
      if (!profile?.is_staff) {
        setChecking(false)
        return
      }
      setIsStaff(true)

      const { data: factorsData } = await supabase.auth.mfa.listFactors()
      setHasFactor((factorsData?.totp?.length ?? 0) > 0)

      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      setIsAal2(aal?.currentLevel === 'aal2')
    } catch (e) {
      console.error('Security page access check failed', e)
    } finally {
      setChecking(false)
    }
  }, [router])

  useEffect(() => {
    checkAccess()
  }, [checkAccess])

  const handleStartEnroll = async () => {
    setStarting(true)
    try {
      const supabase = createClient()

      // Une tentative precedente interrompue (onglet fermé avant de scanner
      // le QR code, double-clic...) laisse un facteur "unverified" orphelin.
      // listFactors().totp ne renvoie que les facteurs verifies (invisible
      // au check hasFactor), mais Supabase refuse quand meme un nouvel
      // enroll() tant que ce facteur non-verifie existe encore. On le
      // nettoie systematiquement avant de repartir sur un enrolement propre.
      const { data: existing } = await supabase.auth.mfa.listFactors()
      const unverified = existing?.all?.filter((f) => f.status !== 'verified') || []
      for (const f of unverified) {
        await supabase.auth.mfa.unenroll({ factorId: f.id })
      }

      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (error) throw error
      setFactorId(data.id)
      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setEnrolling(true)
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message || "Impossible de démarrer l'activation.", variant: 'error' })
    } finally {
      setStarting(false)
    }
  }

  const handleConfirmEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!factorId) return
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })
      if (challengeError) throw challengeError

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      })
      if (verifyError) throw verifyError

      toast({ title: 'Double authentification activée', description: 'Votre compte staff est désormais protégé.', variant: 'success' })
      setHasFactor(true)
      setIsAal2(true)
      setEnrolling(false)
      setQrCode(null)
      setSecret(null)
      setFactorId(null)
      setCode('')
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message || 'Code invalide, réessayez.', variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelEnroll = async () => {
    if (factorId) {
      try {
        const supabase = createClient()
        await supabase.auth.mfa.unenroll({ factorId })
      } catch {
        // best-effort cleanup du facteur non-verifie
      }
    }
    setEnrolling(false)
    setQrCode(null)
    setSecret(null)
    setFactorId(null)
    setCode('')
  }

  const handleUnenroll = async () => {
    if (!confirm('Désactiver la double authentification sur ce compte ?')) return
    try {
      const supabase = createClient()
      const { data: factorsData } = await supabase.auth.mfa.listFactors()
      const factor = factorsData?.totp?.[0]
      if (!factor) return

      const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id })
      if (error) throw error

      toast({ title: 'Double authentification désactivée', variant: 'success' })
      setHasFactor(false)
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'error' })
    }
  }

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
      <div className="container-custom max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display font-black text-3xl text-warm-900">Sécurité du compte</h1>
          <p className="text-warm-500 mt-1">Double authentification obligatoire pour les comptes staff</p>
        </div>

        <div className="bg-white rounded-3xl shadow-card border border-warm-100 p-6 md:p-8">
          {hasFactor && isAal2 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-secondary-500" />
                </div>
                <div>
                  <p className="font-bold text-warm-900">Double authentification activée</p>
                  <p className="text-sm text-warm-500">Votre compte est protégé par un code à usage unique.</p>
                </div>
              </div>
              <Button variant="destructive" size="sm" onClick={handleUnenroll}>
                Désactiver
              </Button>
            </div>
          )}

          {hasFactor && !isAal2 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <ShieldAlert className="w-8 h-8 text-accent-500" />
                <p className="text-warm-700">
                  Votre session actuelle n&apos;a pas complété la vérification en deux étapes.
                  Reconnectez-vous avec votre code pour gérer ce paramètre.
                </p>
              </div>
              <Link href="/login?redirect=/admin/securite" className="text-primary-500 font-semibold text-sm hover:underline">
                Se reconnecter →
              </Link>
            </div>
          )}

          {!hasFactor && !enrolling && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-accent-600" />
                </div>
                <div>
                  <p className="font-bold text-warm-900">Double authentification non activée</p>
                  <p className="text-sm text-warm-500">Requise pour accéder à l&apos;administration.</p>
                </div>
              </div>
              <p className="text-sm text-warm-500 mb-4">
                Vous aurez besoin d&apos;une application d&apos;authentification sur votre téléphone
                (Google Authenticator, Authy, etc.).
              </p>
              <Button variant="primary" onClick={handleStartEnroll} isLoading={starting}>
                Activer la double authentification
              </Button>
            </div>
          )}

          {!hasFactor && enrolling && qrCode && (
            <form onSubmit={handleConfirmEnroll} className="space-y-4">
              <p className="font-bold text-warm-900">1. Scannez ce QR code</p>
              <div className="bg-white p-4 border border-warm-100 rounded-2xl inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCode}
                  alt="QR code de double authentification"
                  width={180}
                  height={180}
                />
              </div>
              {secret && (
                <p className="text-xs text-warm-400">
                  Impossible de scanner ? Entrez ce code manuellement : <span className="font-mono">{secret}</span>
                </p>
              )}

              <p className="font-bold text-warm-900 pt-2">2. Entrez le code à 6 chiffres généré</p>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
              />

              <div className="flex gap-3">
                <Button type="submit" variant="primary" isLoading={submitting}>
                  Confirmer
                </Button>
                <Button type="button" variant="ghost" onClick={handleCancelEnroll}>
                  Annuler
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
