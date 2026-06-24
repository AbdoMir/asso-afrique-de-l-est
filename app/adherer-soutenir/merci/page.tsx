'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, AlertCircle, Clock, Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'

function MerciContent() {
  const searchParams = useSearchParams()
  const source = searchParams.get('source')
  const redirectStatus = searchParams.get('redirect_status')
  const paypalOrderId = searchParams.get('token')

  const [paypalState, setPaypalState] = useState<'capturing' | 'succeeded' | 'failed'>(
    source === 'paypal' ? 'capturing' : 'succeeded'
  )

  useEffect(() => {
    if (source !== 'paypal' || !paypalOrderId) return

    fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: paypalOrderId }),
    })
      .then((res) => (res.ok ? setPaypalState('succeeded') : setPaypalState('failed')))
      .catch(() => setPaypalState('failed'))
  }, [source, paypalOrderId])

  // Stripe ajoute redirect_status après confirmSetup (succeeded, processing, failed)
  const isFailed = (source === 'stripe' && redirectStatus === 'failed') || paypalState === 'failed'
  const isProcessing = source === 'stripe' && redirectStatus === 'processing'
  const isCapturingPaypal = source === 'paypal' && paypalState === 'capturing'

  if (isCapturingPaypal) {
    return (
      <div className="card p-8 md:p-12 text-center max-w-lg mx-auto">
        <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-pulse" />
        <h1 className="font-display font-bold text-2xl text-warm-900 mb-3">
          Finalisation du paiement…
        </h1>
        <p className="text-warm-500">Merci de patienter quelques instants.</p>
      </div>
    )
  }

  if (isFailed) {
    return (
      <div className="card p-8 md:p-12 text-center max-w-lg mx-auto">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="font-display font-bold text-2xl text-warm-900 mb-3">
          Le paiement n&apos;a pas pu être confirmé
        </h1>
        <p className="text-warm-500 mb-6">
          Votre banque a refusé l&apos;opération ou la confirmation a échoué.
          Aucun montant n&apos;a été prélevé. Vous pouvez réessayer ci-dessous.
        </p>
        <Link href="/adherer-soutenir">
          <Button variant="primary" size="lg">Réessayer</Button>
        </Link>
      </div>
    )
  }

  if (isProcessing) {
    return (
      <div className="card p-8 md:p-12 text-center max-w-lg mx-auto">
        <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h1 className="font-display font-bold text-2xl text-warm-900 mb-3">
          Paiement en cours de traitement
        </h1>
        <p className="text-warm-500 mb-6">
          Votre prélèvement SEPA est en cours de validation par votre banque.
          Vous recevrez un email de confirmation dès qu&apos;il sera finalisé
          (généralement sous quelques jours).
        </p>
        <Link href="/">
          <Button variant="outline" size="lg">Retour à l&apos;accueil</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="card p-8 md:p-12 text-center max-w-lg mx-auto">
      <CheckCircle2 className="w-16 h-16 text-secondary-500 mx-auto mb-4" />
      <h1 className="font-display font-bold text-2xl text-warm-900 mb-3">
        Merci pour votre soutien !
      </h1>
      <p className="text-warm-500 mb-6">
        Votre {source === 'helloasso' ? 'adhésion' : 'don'} a bien été
        enregistré{source === 'helloasso' ? 'e' : ''}. Un email de confirmation
        vous a été envoyé. Votre reçu fiscal CERFA vous parviendra chaque
        mois de janvier.
      </p>
      <div className="flex gap-3 justify-center">
        <Link href="/">
          <Button variant="outline" size="lg">Retour à l&apos;accueil</Button>
        </Link>
        <Link href="/espace-adherent">
          <Button variant="primary" size="lg" leftIcon={<Heart className="w-4 h-4" />}>
            Mon espace adhérent
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function MerciPage() {
  return (
    <div className="min-h-[70vh] py-16 px-4 bg-warm-50 flex items-center">
      <div className="w-full">
        <Suspense fallback={<div className="text-center text-warm-400">Chargement…</div>}>
          <MerciContent />
        </Suspense>
      </div>
    </div>
  )
}
