import type { Metadata } from 'next'
import { ChevronRight, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité',
  description: 'Politique de confidentialité et gestion des données personnelles (RGPD) de l\'Association.',
}

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-warm-50 py-12">
      <div className="container-custom max-w-4xl">
        
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-warm-500">
            <li><a href="/" className="hover:text-primary-500 transition-colors">Accueil</a></li>
            <li><ChevronRight className="w-4 h-4" /></li>
            <li className="text-warm-700 font-medium">Politique de Confidentialité</li>
          </ol>
        </nav>

        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-card border border-warm-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-warm-100 pb-6">
            <ShieldCheck className="w-8 h-8 text-primary-500" />
            <h1 className="font-display font-black text-3xl text-warm-900">Politique de Confidentialité</h1>
          </div>

          <p className="text-warm-500 text-xs italic">Dernière mise à jour : 23 juin 2026</p>

          <section className="space-y-3">
            <h2 className="font-bold text-warm-900 text-lg">1. Collecte des données personnelles</h2>
            <p className="text-warm-600 text-sm leading-relaxed">
              Nous collectons des données personnelles lorsque vous utilisez nos formulaires d&apos;adhésion, de don, de contact 
              ou d&apos;inscription à la newsletter. Les informations recueillies peuvent inclure :
            </p>
            <ul className="text-warm-600 text-sm list-disc pl-5 space-y-1">
              <li>Identité : nom, prénom.</li>
              <li>Coordonnées : adresse email, numéro de téléphone, adresse postale.</li>
              <li>Données financières : montants de vos dons, historique de paiement (les transactions de paiement direct sont traitées de manière sécurisée par nos partenaires Stripe et HelloAsso, nous ne stockons aucun numéro de carte ni coordonnées bancaires).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-bold text-warm-900 text-lg">2. Utilisation des données</h2>
            <p className="text-warm-600 text-sm leading-relaxed">
              Vos données sont collectées et traitées uniquement pour les finalités suivantes :
            </p>
            <ul className="text-warm-600 text-sm list-disc pl-5 space-y-1">
              <li>Gestion administrative de vos adhésions et dons.</li>
              <li>Édition et envoi automatique de vos reçus fiscaux CERFA annuels.</li>
              <li>Envoi de notre newsletter d&apos;information (uniquement avec votre consentement explicite).</li>
              <li>Traitement et réponse à vos demandes émises via le formulaire de contact.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-bold text-warm-900 text-lg">3. Durée de conservation des données</h2>
            <p className="text-warm-600 text-sm leading-relaxed">
              Les données des donateurs et adhérents sont conservées pendant toute la durée de validité de leur adhésion/don, 
              puis archivées conformément aux obligations fiscales légales (6 ans pour les reçus fiscaux et pièces comptables). 
              Les données de la newsletter sont conservées jusqu&apos;à votre désinscription.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-bold text-warm-900 text-lg">4. Cookies & Analytics</h2>
            <p className="text-warm-600 text-sm leading-relaxed">
              Afin de respecter votre vie privée, ce site utilise <strong>Plausible Analytics</strong> pour mesurer son audience. 
              Plausible est un outil conforme au RGPD qui ne collecte aucune donnée personnelle, n&apos;utilise aucun cookie 
              de suivi, et ne stocke aucun identifiant persistant. Aucun consentement cookie n&apos;est donc requis pour naviguer.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-bold text-warm-900 text-lg">5. Vos droits (RGPD)</h2>
            <p className="text-warm-600 text-sm leading-relaxed">
              Conformément à la réglementation européenne relative à la protection des données personnelles (RGPD), vous disposez 
              d&apos;un droit d&apos;accès, de rectification, de portabilité et de suppression de vos données personnelles. 
              Vous pouvez exercer ces droits en nous envoyant un email à l&apos;adresse suivante : 
              <strong> {process.env.NEXT_PUBLIC_ASSOCIATION_EMAIL || 'contact@asso-aes.fr'}</strong>.
            </p>
          </section>
        </div>

      </div>
    </div>
  )
}
