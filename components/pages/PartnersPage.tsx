import Link from 'next/link'
import { Building2, Landmark, Heart, FileText, ChevronRight, ShieldCheck } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbJsonLd } from '@/lib/seo'
import { getDictionary } from '@/lib/dictionaries'
import { pathFor, type Locale } from '@/lib/i18n'

const GROUP_ICONS = [Landmark, Building2, Heart]
const GROUP_LOGOS = ['🏛️', '🏙️', '🤝']
const ROW_COLORS = ['text-secondary-400', 'text-primary-400', 'text-accent-400']

export function PartnersPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const t = dict.pages.partners
  const homePath = pathFor('home', locale)

  return (
    <div className="min-h-screen">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: dict.nav.home, path: homePath },
          { name: t.breadcrumb, path: pathFor('partners', locale) },
        ])}
      />

      <section className="hero-bg py-16 md:py-24 relative overflow-hidden" aria-labelledby="partners-title">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-100/40 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
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
            <span className="section-badge bg-primary-50 text-primary-600">
              <ShieldCheck className="w-4 h-4 text-primary-500" />
              {t.badge}
            </span>
            <h1 id="partners-title" className="font-display font-black text-warm-900 mb-6">
              {t.titleBefore} <span className="gradient-text">{t.titleHighlight}</span>
            </h1>
            <p className="text-xl text-warm-600 leading-relaxed max-w-2xl">{t.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Gouvernance & finances */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="section-title">{t.governanceTitle}</h2>
              <p className="text-warm-600 leading-relaxed">{t.governanceText}</p>

              <div className="space-y-4">
                {t.governancePoints.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <h3 className="font-bold text-warm-900 text-base">{item.title}</h3>
                      <p className="text-warm-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-warm-900 text-white space-y-6">
              <FileText className="w-12 h-12 text-primary-400" />
              <h3 className="font-display font-black text-2xl text-warm-100">{t.financeTitle}</h3>

              <div className="space-y-4">
                {t.financeRows.map((row, index) => (
                  <div
                    key={row.label}
                    className={`flex justify-between items-center text-sm pb-3 ${
                      index < t.financeRows.length - 1 ? 'border-b border-warm-800' : 'pb-2'
                    }`}
                  >
                    <span className="text-warm-300">{row.label}</span>
                    <span className={`font-bold ${ROW_COLORS[index]}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-warm-400 leading-normal">{t.financeNote}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partenaires */}
      <section className="section bg-warm-50 border-t border-warm-100">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="section-badge">{t.partnersBadge}</span>
            <h2 className="section-title">{t.partnersTitle}</h2>
            <p className="section-subtitle">{t.partnersSubtitle}</p>
          </div>

          <div className="space-y-12">
            {t.groups.map((group, groupIndex) => {
              const Icon = GROUP_ICONS[groupIndex]
              return (
                <div key={group.category} className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-warm-200 pb-4">
                    <Icon className="w-5 h-5 text-primary-500" />
                    <h3 className="font-display font-black text-xl text-warm-900">
                      {group.category}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.items.map((item) => (
                      <div
                        key={item.name}
                        className="p-6 bg-white rounded-2xl shadow-sm border border-warm-100 hover:shadow-card transition-shadow"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-3xl bg-warm-50 w-12 h-12 rounded-xl flex items-center justify-center border border-warm-100">
                            {GROUP_LOGOS[groupIndex]}
                          </div>
                          <h4 className="font-bold text-warm-900 text-lg leading-tight">
                            {item.name}
                          </h4>
                        </div>
                        <p className="text-warm-500 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
