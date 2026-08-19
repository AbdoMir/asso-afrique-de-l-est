import { Banknote, Landmark, MapPin } from 'lucide-react'
import { ASSOCIATION_ADDRESS, ASSOCIATION_NAME } from '@/lib/association'
import type { Dictionary } from '@/lib/dictionaries'

type SupportDict = Dictionary['pages']['support']

const bankHolder = process.env.NEXT_PUBLIC_BANK_HOLDER || ASSOCIATION_NAME
const bankIban = process.env.NEXT_PUBLIC_BANK_IBAN || 'FRXX XXXX XXXX XXXX XXXX XXXX XXX'
const bankBic = process.env.NEXT_PUBLIC_BANK_BIC || 'XXXXXXXX'
const associationAddress = ASSOCIATION_ADDRESS

export function AlternativePaymentMethods({ dict }: { dict: SupportDict }) {
  return (
    <section className="section bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="section-badge">{dict.altBadge}</span>
          <h2 className="section-title">{dict.altTitle}</h2>
          <p className="text-warm-500 max-w-2xl mx-auto mt-3">{dict.altSubtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Virement bancaire — informatif uniquement */}
          <div className="card p-6">
            <div className="w-12 h-12 rounded-xl bg-secondary-50 flex items-center justify-center mb-4">
              <Landmark className="w-6 h-6 text-secondary-500" />
            </div>
            <h3 className="font-bold text-warm-900 mb-2">{dict.transferTitle}</h3>
            <p className="text-sm text-warm-500 mb-4">{dict.transferText}</p>
            <div className="bg-warm-50 rounded-xl p-3 text-xs text-warm-600 space-y-1 font-mono">
              <p><span className="text-warm-400 font-sans">{dict.transferHolder} : </span>{bankHolder}</p>
              <p><span className="text-warm-400 font-sans">IBAN : </span>{bankIban}</p>
              <p><span className="text-warm-400 font-sans">BIC : </span>{bankBic}</p>
            </div>
          </div>

          {/* Espèces ou chèque — informatif uniquement */}
          <div className="card p-6">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
              <Banknote className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="font-bold text-warm-900 mb-2">{dict.cashTitle}</h3>
            <p className="text-sm text-warm-500 mb-4">{dict.cashText}</p>
            <div className="bg-warm-50 rounded-xl p-3 text-xs text-warm-600 space-y-1.5">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-warm-400 shrink-0" />
                {associationAddress}
              </p>
              {dict.openingDays.map((slot, i) => (
                <div
                  key={slot.day}
                  className={`flex justify-between ${i === 0 ? 'border-t border-warm-100 pt-1.5 mt-1.5' : ''}`}
                >
                  <span>{slot.day}</span>
                  <span className="font-semibold">{slot.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
