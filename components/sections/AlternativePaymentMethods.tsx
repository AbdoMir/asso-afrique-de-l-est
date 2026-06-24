import { Banknote, Wallet, Landmark, MapPin } from 'lucide-react'

const bankHolder = process.env.NEXT_PUBLIC_BANK_HOLDER || "Association Afrique de l'Est et ses amis"
const bankIban = process.env.NEXT_PUBLIC_BANK_IBAN || 'FRXX XXXX XXXX XXXX XXXX XXXX XXX'
const bankBic = process.env.NEXT_PUBLIC_BANK_BIC || 'XXXXXXXX'
const associationAddress =
  process.env.NEXT_PUBLIC_ASSOCIATION_ADDRESS || 'XX rue XXXXX, 75XXX Paris'

export function AlternativePaymentMethods() {
  return (
    <section className="section bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="section-badge">Autres moyens de paiement</span>
          <h2 className="section-title">D&apos;autres façons de nous soutenir</h2>
          <p className="text-warm-500 max-w-2xl mx-auto mt-3">
            En plus de la carte bancaire et du prélèvement SEPA, vous pouvez
            également nous soutenir par PayPal, virement ou directement sur
            place.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* PayPal — structure prête, en attente des identifiants */}
          <div className="card p-6 opacity-75">
            <div className="w-12 h-12 rounded-xl bg-warm-100 flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-warm-500" />
            </div>
            <h3 className="font-bold text-warm-900 mb-2">PayPal</h3>
            <p className="text-sm text-warm-500 mb-4">
              Payez avec votre compte PayPal en quelques clics.
            </p>
            <span className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full bg-warm-100 text-warm-500">
              Bientôt disponible
            </span>
          </div>

          {/* Virement bancaire — informatif uniquement */}
          <div className="card p-6">
            <div className="w-12 h-12 rounded-xl bg-secondary-50 flex items-center justify-center mb-4">
              <Landmark className="w-6 h-6 text-secondary-500" />
            </div>
            <h3 className="font-bold text-warm-900 mb-2">Virement bancaire</h3>
            <p className="text-sm text-warm-500 mb-4">
              Idéal pour les dons annuels importants. Indiquez vos nom et
              email en référence afin que nous puissions vous adresser votre
              reçu fiscal.
            </p>
            <div className="bg-warm-50 rounded-xl p-3 text-xs text-warm-600 space-y-1 font-mono">
              <p><span className="text-warm-400 font-sans">Titulaire : </span>{bankHolder}</p>
              <p><span className="text-warm-400 font-sans">IBAN : </span>{bankIban}</p>
              <p><span className="text-warm-400 font-sans">BIC : </span>{bankBic}</p>
            </div>
          </div>

          {/* Espèces ou chèque — informatif uniquement */}
          <div className="card p-6">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
              <Banknote className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="font-bold text-warm-900 mb-2">Espèces ou chèque</h3>
            <p className="text-sm text-warm-500 mb-4">
              Remettez votre don en main propre lors de nos permanences
              d&apos;accueil. Un reçu vous sera délivré sur place.
            </p>
            <div className="bg-warm-50 rounded-xl p-3 text-xs text-warm-600 space-y-1.5">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-warm-400 shrink-0" />
                {associationAddress}
              </p>
              <div className="flex justify-between border-t border-warm-100 pt-1.5 mt-1.5">
                <span>Mardi</span><span className="font-semibold">14h-18h</span>
              </div>
              <div className="flex justify-between">
                <span>Samedi</span><span className="font-semibold">10h-13h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
