'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { Lock, ShieldCheck, AlertTriangle } from 'lucide-react'
import { getStripe } from '@/lib/stripe/browser'
import { Button } from '@/components/ui/Button'

function PaymentForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsSubmitting(true)
    setErrorMsg('')

    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/adherer-soutenir/merci?source=stripe`,
      },
    })

    if (error) {
      setErrorMsg(error.message || 'Le paiement a été refusé. Veuillez réessayer.')
      setIsSubmitting(false)
    }
    // En cas de succès, Stripe redirige automatiquement vers return_url.
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-6">
      <PaymentElement options={{ layout: 'tabs' }} />

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex gap-2 items-center">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full justify-center"
        isLoading={isSubmitting}
        disabled={!stripe || !elements}
        leftIcon={<Lock className="w-4 h-4" />}
      >
        Confirmer mon don mensuel
      </Button>

      <p className="text-xs text-warm-400 flex items-center gap-1.5 justify-center">
        <ShieldCheck className="w-3.5 h-3.5 text-secondary-400" />
        Paiement sécurisé par Stripe — certifié PCI-DSS
      </p>
    </form>
  )
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const clientSecret = searchParams.get('client_secret')

  if (!clientSecret) {
    return (
      <div className="card p-8 text-center max-w-md mx-auto">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h1 className="font-display font-bold text-xl text-warm-900 mb-2">
          Lien de paiement invalide
        </h1>
        <p className="text-warm-500 text-sm">
          Ce lien de confirmation est invalide ou a expiré. Merci de relancer
          votre don depuis la page d&apos;adhésion.
        </p>
      </div>
    )
  }

  return (
    <Elements
      stripe={getStripe()}
      options={{
        clientSecret,
        appearance: { theme: 'stripe', variables: { colorPrimary: '#E8702A' } },
        locale: 'fr',
      }}
    >
      <PaymentForm clientSecret={clientSecret} />
    </Elements>
  )
}

export default function ConfirmationPage() {
  return (
    <div className="min-h-[70vh] py-16 px-4 bg-warm-50">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="section-title">Finalisez votre don</h1>
          <p className="text-warm-500 text-sm">
            Choisissez carte bancaire ou prélèvement SEPA pour confirmer votre
            don mensuel.
          </p>
        </div>
        <Suspense fallback={<div className="card p-8 text-center text-warm-400">Chargement…</div>}>
          <ConfirmationContent />
        </Suspense>
      </div>
    </div>
  )
}
