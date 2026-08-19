'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

function DesinscriptionContent() {
  const searchParams = useSearchParams()
  const hasFailed = searchParams.get('statut') === 'erreur'

  if (hasFailed) {
    return (
      <div className="card p-8 md:p-12 text-center max-w-lg mx-auto">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="font-display font-bold text-2xl text-warm-900 mb-3">
          La désinscription n&apos;a pas abouti
        </h1>
        <p className="text-warm-500 mb-6">
          Le lien est peut-être incomplet. Écrivez-nous et nous retirerons votre
          adresse manuellement — c&apos;est un droit, nous y répondons sous un mois.
        </p>
        <Link href="/contact">
          <Button variant="primary" size="lg">Nous contacter</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="card p-8 md:p-12 text-center max-w-lg mx-auto">
      <CheckCircle2 className="w-16 h-16 text-secondary-500 mx-auto mb-4" />
      <h1 className="font-display font-bold text-2xl text-warm-900 mb-3">
        Vous êtes désinscrit
      </h1>
      <p className="text-warm-500 mb-6">
        Votre adresse a été retirée de notre liste de diffusion et vous ne
        recevrez plus notre newsletter. Vous pourrez vous réinscrire quand vous
        le souhaitez depuis la page d&apos;accueil.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <Link href="/">
          <Button variant="outline" size="lg">Retour à l&apos;accueil</Button>
        </Link>
        <Link href="/legal/confidentialite">
          <Button variant="primary" size="lg">Mes données personnelles</Button>
        </Link>
      </div>
    </div>
  )
}

export default function DesinscriptionPage() {
  return (
    <div className="min-h-[70vh] py-16 px-4 bg-warm-50 flex items-center">
      <div className="w-full">
        <Suspense fallback={<div className="text-center text-warm-400">Chargement…</div>}>
          <DesinscriptionContent />
        </Suspense>
      </div>
    </div>
  )
}
