import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Heart, Shield, FileCheck, Clock, ChevronRight } from 'lucide-react'
import { DonationSection } from '@/components/sections/DonationSection'
import { AlternativePaymentMethods } from '@/components/sections/AlternativePaymentMethods'

export const metadata: Metadata = {
  title: 'Adhérer & Soutenir',
  description:
    "Adhérez à l'Association Afrique de l'Est et ses amis ou faites un don mensuel. Reçu fiscal CERFA automatique. 66% déductibles des impôts.",
}

const guarantees = [
  {
    icon: Shield,
    title: 'Paiement 100% sécurisé',
    description: 'HelloAsso et Stripe assurent la sécurité de vos transactions.',
    color: 'text-secondary-500',
    bg: 'bg-secondary-50',
  },
  {
    icon: FileCheck,
    title: 'Reçu fiscal automatique',
    description: 'Votre reçu CERFA 11580*03 vous est envoyé chaque janvier.',
    color: 'text-primary-500',
    bg: 'bg-primary-50',
  },
  {
    icon: Clock,
    title: 'Résiliation en un clic',
    description: 'Annulez votre don mensuel à tout moment, sans engagement.',
    color: 'text-accent-600',
    bg: 'bg-accent-50',
  },
  {
    icon: Heart,
    title: '66% déductibles',
    description: "Vos dons sont déductibles à 66% de l'impôt sur le revenu.",
    color: 'text-red-500',
    bg: 'bg-red-50',
  },
]

export default function AdhererSoutenirPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="hero-bg py-16 md:py-24 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-100/40 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-secondary-100/30 translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />

        <div className="container-custom relative">
          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-warm-500">
              <li><a href="/" className="hover:text-primary-500 transition-colors">Accueil</a></li>
              <li><ChevronRight className="w-4 h-4" /></li>
              <li className="text-warm-700 font-medium">Adhérer & Soutenir</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <span className="section-badge">
              <Heart className="w-4 h-4" />
              Rejoignez-nous
            </span>
            <h1 className="font-display font-black text-warm-900 mb-6">
              Adhérez &{' '}
              <span className="gradient-text">soutenez notre mission</span>
            </h1>
            <p className="text-xl text-warm-600 leading-relaxed mb-8 max-w-2xl">
              Chaque euro compte. Votre soutien finance directement des cours de français,
              des ateliers jeunesse et un accompagnement à l&apos;emploi pour les familles
              d&apos;Afrique de l&apos;Est en France.
            </p>

            {/* Impact quick stats */}
            <div className="grid grid-cols-3 gap-4 max-w-md">
              {[
                { value: '5€', label: 'par mois', sub: 'pour commencer' },
                { value: '66%', label: 'déductibles', sub: 'des impôts' },
                { value: '100%', label: 'sécurisé', sub: 'HelloAsso & Stripe' },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-3 bg-white/80 rounded-xl shadow-sm border border-warm-100">
                  <div className="text-2xl font-black font-display text-primary-500">{stat.value}</div>
                  <div className="text-xs font-semibold text-warm-700">{stat.label}</div>
                  <div className="text-xs text-warm-400">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Guarantees bar */}
      <section className="bg-white border-y border-warm-100 py-6">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {guarantees.map((g) => (
              <div key={g.title} className="flex items-center gap-3">
                <div className={`w-10 h-10 blob-3 ${g.bg} flex items-center justify-center shrink-0`}>
                  <g.icon className={`w-5 h-5 ${g.color}`} />
                </div>
                <div>
                  <p className="font-semibold text-warm-900 text-sm leading-tight">{g.title}</p>
                  <p className="text-warm-500 text-xs leading-snug hidden lg:block">{g.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Donation Section */}
      <Suspense fallback={<div className="section text-center text-warm-400">Chargement…</div>}>
        <DonationSection />
      </Suspense>

      {/* Autres moyens de paiement */}
      <AlternativePaymentMethods />

      {/* Tax deduction explainer */}
      <section className="section bg-warm-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-3xl p-8 md:p-12 text-white">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="text-center md:text-left flex-1">
                  <div className="text-6xl md:text-7xl font-black font-display mb-3">66%</div>
                  <h2 className="text-2xl font-bold mb-3">de déduction fiscale</h2>
                  <p className="text-white/85 leading-relaxed">
                    En tant qu&apos;association loi 1901 reconnue d&apos;intérêt général,
                    vos dons ouvrent droit à une réduction d&apos;impôt de 66% du montant versé,
                    dans la limite de 20% de votre revenu imposable (article 200 du CGI).
                  </p>
                </div>
                <div className="flex-1">
                  <div className="bg-white/15 rounded-2xl p-6 space-y-4">
                    <h3 className="font-bold text-lg">Exemple concret</h3>
                    {[
                      { don: '5€/mois = 60€/an', revient: '20,40€/an réels', saving: '39,60€ économisés' },
                      { don: '10€/mois = 120€/an', revient: '40,80€/an réels', saving: '79,20€ économisés' },
                      { don: '20€/mois = 240€/an', revient: '81,60€/an réels', saving: '158,40€ économisés' },
                    ].map((row) => (
                      <div key={row.don} className="flex items-center justify-between text-sm border-b border-white/20 pb-3 last:border-0 last:pb-0">
                        <span className="text-white/80">{row.don}</span>
                        <div className="text-right">
                          <div className="font-bold">{row.revient}</div>
                          <div className="text-white/60 text-xs">{row.saving}</div>
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-white/60 mt-2">
                      * Après déduction fiscale de 66%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-white">
        <div className="container-custom max-w-3xl">
          <div className="text-center mb-12">
            <span className="section-badge">Questions fréquentes</span>
            <h2 className="section-title">Vous avez des questions ?</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Comment obtenir mon reçu fiscal ?',
                a: 'Votre reçu fiscal (CERFA 11580*03) vous sera envoyé automatiquement par email chaque mois de janvier, pour l\'ensemble de vos dons de l\'année précédente. Vous pouvez également le télécharger à tout moment dans votre espace adhérent.',
              },
              {
                q: 'Comment annuler mon don mensuel ?',
                a: 'Vous pouvez annuler votre don mensuel à tout moment depuis votre espace adhérent, sans frais ni pénalité. Votre abonnement sera arrêté à la fin du mois en cours.',
              },
              {
                q: 'Mes données sont-elles sécurisées ?',
                a: 'Absolument. Vos données personnelles et bancaires sont protégées conformément au RGPD. Les paiements sont traités par HelloAsso et Stripe, certifiés PCI-DSS. Nous ne stockons jamais vos informations bancaires.',
              },
              {
                q: 'Puis-je modifier le montant de mon don ?',
                a: 'Oui, vous pouvez modifier votre montant mensuel depuis votre espace adhérent. La modification prend effet au mois suivant.',
              },
              {
                q: 'L\'adhésion et le don mensuel sont-ils cumulables ?',
                a: 'Oui ! Vous pouvez adhérer à l\'association (10€/an) et également faire un don mensuel. Les deux sont cumulables et chacun donne droit à la déduction fiscale correspondante.',
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group card p-0 overflow-hidden"
              >
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-warm-900 hover:text-primary-600 transition-colors list-none">
                  {faq.q}
                  <ChevronRight className="w-5 h-5 shrink-0 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-6 pb-5 text-warm-600 leading-relaxed border-t border-warm-100 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
