'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, AlertCircle, Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'

function MerciContent() {
  const searchParams = useSearchParams()
  const isFailed = searchParams.get('error') !== null

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

  return (
    <div className="card p-8 md:p-12 text-center max-w-lg mx-auto">
      <CheckCircle2 className="w-16 h-16 text-secondary-500 mx-auto mb-4" />
      <h1 className="font-display font-bold text-2xl text-warm-900 mb-3">
        Merci pour votre soutien !
      </h1>
      <p className="text-warm-500 mb-6">
        HelloAsso vous envoie la confirmation de votre paiement ainsi que votre
        reçu fiscal CERFA, à l&apos;adresse email utilisée lors du règlement.
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
