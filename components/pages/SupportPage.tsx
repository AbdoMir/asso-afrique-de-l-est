import Link from 'next/link'
import { Suspense } from 'react'
import { Heart, Shield, FileCheck, Clock, ChevronRight, Users, Bell, Megaphone } from 'lucide-react'
import { DonationSection } from '@/components/sections/DonationSection'
import { AlternativePaymentMethods } from '@/components/sections/AlternativePaymentMethods'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo'
import { getDictionary } from '@/lib/dictionaries'
import { pathFor, type Locale } from '@/lib/i18n'

const GUARANTEE_LOOK = [
  { icon: Shield, color: 'text-secondary-500', bg: 'bg-secondary-50' },
  { icon: FileCheck, color: 'text-primary-500', bg: 'bg-primary-50' },
  { icon: Clock, color: 'text-accent-600', bg: 'bg-accent-50' },
  { icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
]

const REASON_LOOK = [
  { icon: Heart, color: 'text-primary-500', bg: 'bg-primary-50' },
  { icon: Users, color: 'text-secondary-500', bg: 'bg-secondary-50' },
  { icon: Bell, color: 'text-accent-600', bg: 'bg-accent-50' },
  { icon: Megaphone, color: 'text-purple-500', bg: 'bg-purple-50' },
]

export function SupportPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const t = dict.pages.support
  const homePath = pathFor('home', locale)

  return (
    <div className="min-h-screen">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: dict.nav.home, path: homePath },
          { name: t.breadcrumb, path: pathFor('support', locale) },
        ])}
      />
      {/* Les questions sont réellement affichées plus bas, dans des <details> :
          le balisage FAQPage décrit donc bien un contenu présent à l'écran. */}
      <JsonLd data={faqJsonLd(t.faqs)} />

      <section className="hero-bg py-16 md:py-24 relative overflow-hidden" aria-labelledby="support-title">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-100/40 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-secondary-100/30 translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />

        <div className="container-custom relative">
          <nav aria-label={t.breadcrumb} className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-warm-500">
              <li>
                <Link href={homePath} className="hover:text-primary-500 transition-colors">
                  {dict.nav.home}
                </Link>
              </li>
              <li><ChevronRight className="w-4 h-4 rtl:rotate-180" /></li>
              <li className="text-warm-700 font-medium">{t.breadcrumb}</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <span className="section-badge">
              <Heart className="w-4 h-4" />
              {t.badge}
            </span>
            <h1 id="support-title" className="font-display font-black text-warm-900 mb-6">
              {t.titleBefore} <span className="gradient-text">{t.titleHighlight}</span>
            </h1>
            <p className="text-xl text-warm-600 leading-relaxed mb-8 max-w-2xl">{t.subtitle}</p>

            <div className="grid grid-cols-3 gap-4 max-w-md">
              {t.heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-3 bg-white/80 rounded-xl shadow-sm border border-warm-100"
                >
                  <div className="text-2xl font-black font-display text-primary-500">{stat.value}</div>
                  <div className="text-xs font-semibold text-warm-700">{stat.label}</div>
                  <div className="text-xs text-warm-400">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Garanties */}
      <section className="bg-white border-y border-warm-100 py-6">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {t.guarantees.map((g, index) => {
              const look = GUARANTEE_LOOK[index]
              return (
                <div key={g.title} className="flex items-center gap-3">
                  <div className={`w-10 h-10 blob-3 ${look.bg} flex items-center justify-center shrink-0`}>
                    <look.icon className={`w-5 h-5 ${look.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-warm-900 text-sm leading-tight">{g.title}</p>
                    <p className="text-warm-500 text-xs leading-snug hidden lg:block">
                      {g.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pourquoi adhérer */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="section-badge">{t.whyBadge}</span>
            <h2 className="section-title">{t.whyTitle}</h2>
            <p className="section-subtitle mx-auto">{t.whySubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.reasons.map((reason, index) => {
              const look = REASON_LOOK[index]
              return (
                <div key={reason.title} className="card-hover p-6 h-full">
                  <div className={`w-12 h-12 blob-3 ${look.bg} flex items-center justify-center mb-5`}>
                    <look.icon className={`w-6 h-6 ${look.color}`} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-warm-900 mb-2">
                    {reason.title}
                  </h3>
                  <p className="text-warm-500 text-sm leading-relaxed">{reason.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="section text-center text-warm-400">{t.loading}</div>}>
        <DonationSection dict={t.donation} />
      </Suspense>

      <AlternativePaymentMethods dict={t} />

      {/* Déduction fiscale */}
      <section className="section bg-warm-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-3xl p-8 md:p-12 text-white">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="text-center md:text-start flex-1">
                  <div className="text-6xl md:text-7xl font-black font-display mb-3">66%</div>
                  <h2 className="text-2xl font-bold mb-3">{t.taxTitle}</h2>
                  <p className="text-white/85 leading-relaxed">{t.taxText}</p>
                </div>
                <div className="flex-1">
                  <div className="bg-white/15 rounded-2xl p-6 space-y-4">
                    <h3 className="font-bold text-lg">{t.taxExampleTitle}</h3>
                    {t.taxRows.map((row) => (
                      <div
                        key={row.don}
                        className="flex items-center justify-between text-sm border-b border-white/20 pb-3 last:border-0 last:pb-0"
                      >
                        <span className="text-white/80">{row.don}</span>
                        <div className="text-end">
                          <div className="font-bold">{row.revient}</div>
                          <div className="text-white/60 text-xs">{row.saving}</div>
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-white/60 mt-2">{t.taxFootnote}</p>
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
            <span className="section-badge">{t.faqBadge}</span>
            <h2 className="section-title">{t.faqTitle}</h2>
          </div>

          <div className="space-y-4">
            {t.faqs.map((faq) => (
              <details key={faq.q} className="group card p-0 overflow-hidden">
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
