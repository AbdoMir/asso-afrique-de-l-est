import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, GraduationCap, Briefcase, Languages, ChevronRight, CheckCircle2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbJsonLd } from '@/lib/seo'
import { getDictionary } from '@/lib/dictionaries'
import { pathFor, type Locale } from '@/lib/i18n'

/**
 * Habillage seulement : icône, couleurs et photo, appariés par position aux
 * textes du dictionnaire. Rien ici ne se traduit.
 */
const LOOK = [
  {
    icon: Languages,
    color: 'text-primary-500',
    bg: 'bg-primary-50',
    image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    icon: Briefcase,
    color: 'text-secondary-500',
    bg: 'bg-secondary-50',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    icon: GraduationCap,
    color: 'text-accent-600',
    bg: 'bg-accent-50',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    icon: BookOpen,
    color: 'text-red-500',
    bg: 'bg-red-50',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=600&h=400',
  },
]

export function ActionsPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const t = dict.pages.actions
  const homePath = pathFor('home', locale)
  const supportPath = pathFor('support', locale)

  return (
    <div className="min-h-screen">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: dict.nav.home, path: homePath },
          { name: t.breadcrumb, path: pathFor('actions', locale) },
        ])}
      />

      {/* Hero */}
      <section className="hero-bg py-16 md:py-24 relative overflow-hidden" aria-labelledby="actions-title">
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
              <Calendar className="w-4 h-4 text-primary-500" />
              {t.badge}
            </span>
            <h1 id="actions-title" className="font-display font-black text-warm-900 mb-6">
              {t.titleBefore} <span className="gradient-text">{t.titleHighlight}</span>
            </h1>
            <p className="text-xl text-warm-600 leading-relaxed max-w-2xl">{t.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Programmes */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="space-y-16">
            {t.items.map((act, index) => {
              const look = LOOK[index]
              return (
                <div
                  key={act.title}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-warm-100 pb-16 last:border-0 last:pb-0"
                >
                  <div className={`lg:col-span-5 ${index % 2 === 1 ? 'lg:order-last' : ''}`}>
                    <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-card border border-warm-100 relative group">
                      <Image
                        src={look.image}
                        alt={`${t.illustrationAlt} ${act.title}`}
                        fill
                        sizes="(min-width: 1024px) 42vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-warm-900 text-xs font-bold px-3 py-1.5 rounded-full border border-warm-100 shadow-sm flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-secondary-500 fill-secondary-100" />
                        {t.activeProgram}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 blob-3 ${look.bg} flex items-center justify-center`}>
                        <look.icon className={`w-6 h-6 ${look.color}`} />
                      </div>
                      <h2 className="font-display font-black text-2xl md:text-3xl text-warm-900">
                        {act.title}
                      </h2>
                    </div>

                    <p className="text-warm-600 leading-relaxed">{act.desc}</p>

                    <div className="grid grid-cols-3 gap-4 border-t border-warm-100 pt-6">
                      {act.stats.map((st) => (
                        <div key={st.label}>
                          <div className="text-2xl font-black font-display text-primary-500 leading-none mb-1">
                            {st.value}
                          </div>
                          <div className="text-xs font-medium text-warm-500 leading-tight">
                            {st.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <Link href={supportPath}>
                        <Button variant="outline" size="sm" className="font-bold">
                          {t.supportProgram}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Chiffres */}
      <section className="section bg-warm-50 border-y border-warm-100">
        <div className="container-custom text-center max-w-4xl mx-auto">
          <h2 className="font-display font-black text-3xl text-warm-900 mb-6">{t.impactTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {t.impactStats.map((stat) => (
              <div key={stat.label} className="p-6 bg-white rounded-2xl shadow-sm border border-warm-100">
                <div className="text-4xl font-black font-display text-primary-500 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-warm-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
