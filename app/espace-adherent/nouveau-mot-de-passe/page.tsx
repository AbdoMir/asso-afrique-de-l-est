'use client'

import React, { useState } from 'react'
import { Lock, Globe, CheckCircle, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toaster'
import Link from 'next/link'

export default function NouveauMotDePassePage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })

      if (error) throw error

      setSuccessMsg('Mot de passe mis à jour avec succès.')
      toast({
        title: 'Mot de passe modifié',
        description: 'Vous pouvez maintenant accéder à votre espace adhérent.',
        variant: 'success',
      })
      setTimeout(() => {
        window.location.href = '/espace-adherent'
      }, 1000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue. Le lien a peut-être expiré.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-warm-50">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-100/40 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-secondary-100/30 translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-card border border-warm-100">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 group mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white">
                <Globe className="w-4 h-4" />
              </div>
              <span className="font-display font-black text-warm-900 text-sm">Afrique de l&apos;Est</span>
            </Link>

            <h1 className="font-display font-black text-3xl text-warm-900">Nouveau mot de passe</h1>
            <p className="text-warm-500 text-sm mt-1.5">
              Choisissez un nouveau mot de passe pour votre compte.
            </p>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              label="Nouveau mot de passe"
              placeholder="Minimum 6 caractères"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftAddon={<Lock className="w-4 h-4" />}
            />
            <Input
              type="password"
              label="Confirmer le mot de passe"
              placeholder="••••••••"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftAddon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center mt-6"
              isLoading={loading}
            >
              Mettre à jour le mot de passe
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
