import Link from 'next/link'
import { Languages, Users, Briefcase, ChevronRight, HelpCircle, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbJsonLd } from '@/lib/seo'
import { getDictionary } from '@/lib/dictionaries'
import { pathFor, type Locale } from '@/lib/i18n'

/**
 * Les ancres (#traduction, #jeunesse, #emploi) restent en français dans les
 * trois langues : elles sont déjà utilisées par les liens du menu et par des
 * liens externes éventuels, et un fragment d'URL n'est pas indexé séparément.
 */
const LOOK = [
  { id: 'traduction', icon: Languages, color: 'text-primary-500', bg: 'bg-primary-50' },
  { id: 'jeunesse', icon: Users, color: 'text-secondary-500', bg: 'bg-secondary-50' },
  { id: 'emploi', icon: Briefcase, color: 'text-accent-600', bg: 'bg-accent-50' },
]

export function FocusPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const t = dict.pages.focus
  const homePath = pathFor('home', locale)
  const contactPath = pathFor('contact', locale)

  return (
    <div className="min-h-screen">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: dict.nav.home, path: homePath },
          { name: t.breadcrumb, path: pathFor('focus', locale) },
        ])}
      />

      <section className="hero-bg py-16 md:py-24 relative overflow-hidden" aria-labelledby="focus-title">
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
              <UserCheck className="w-4 h-4 text-primary-500" />
              {t.badge}
            </span>
            <h1 id="focus-title" className="font-display font-black text-warm-900 mb-6">
              {t.titleBefore} <span className="gradient-text">{t.titleHighlight}</span>
            </h1>
            <p className="text-xl text-warm-600 leading-relaxed max-w-2xl">{t.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-custom space-y-16">
          {t.items.map((focus, index) => {
            const look = LOOK[index]
            return (
              <div
                key={look.id}
                id={look.id}
                className="scroll-mt-24 p-8 md:p-12 rounded-3xl bg-warm-50/50 border border-warm-100 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
              >
                <div className="lg:col-span-8 space-y-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 blob-3 ${look.bg} flex items-center justify-center`}>
                        <look.icon className={`w-6 h-6 ${look.color}`} />
                      </div>
                      <div>
                        <h2 className="font-display font-black text-2xl md:text-3xl text-warm-900">
                          {focus.title}
                        </h2>
                        <p className="text-primary-500 font-semibold text-sm">{focus.desc}</p>
                      </div>
                    </div>

                    <ul className="space-y-3 mt-8">
                      {focus.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-3 text-warm-700 text-base">
                          <span className="w-5 h-5 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                            ✓
                          </span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <Link href={contactPath}>
                      <Button variant="primary" size="sm">
                        {t.benefit}
                      </Button>
                    </Link>
                    <Link href={`${contactPath}?subject=devenir-benevole`}>
                      <Button variant="outline" size="sm">
                        {t.volunteer}
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-warm-900 text-white rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <HelpCircle className="w-8 h-8 text-primary-400 mb-6" />
                    <p className="italic text-warm-200 text-sm md:text-base leading-relaxed">
                      {focus.testimonialText}
                    </p>
                  </div>
                  <div className="border-t border-warm-800 pt-4 mt-6">
                    <p className="font-bold text-sm text-warm-100">{focus.testimonialAuthor}</p>
                    <p className="text-xs text-warm-400">{t.verifiedTestimonial}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
