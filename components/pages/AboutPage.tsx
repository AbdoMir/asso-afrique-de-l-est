import Link from 'next/link'
import Image from 'next/image'
import { Heart, Compass, Users, Award, Sparkles, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbJsonLd } from '@/lib/seo'
import { getDictionary } from '@/lib/dictionaries'
import { pathFor, type Locale } from '@/lib/i18n'

const VALUE_LOOK = [
  { icon: Heart, color: 'text-primary-500', bg: 'bg-primary-50' },
  { icon: Compass, color: 'text-secondary-500', bg: 'bg-secondary-50' },
  { icon: Users, color: 'text-accent-600', bg: 'bg-accent-50' },
  { icon: Award, color: 'text-red-500', bg: 'bg-red-50' },
]

/**
 * Les noms des membres du bureau ne se traduisent pas : ils restent ici, hors
 * dictionnaire, appariés par position aux fonctions et biographies traduites.
 */
const TEAM = [
  {
    name: 'Ismael Ali Moussa',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400',
  },
  {
    name: 'Safia Hassan',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400',
  },
  {
    name: 'Dzenita Ibrahimovic',
    image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400&h=400',
  },
]

export function AboutPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const t = dict.pages.about
  const homePath = pathFor('home', locale)

  return (
    <div className="min-h-screen">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: dict.nav.home, path: homePath },
          { name: t.breadcrumb, path: pathFor('about', locale) },
        ])}
      />

      <section className="hero-bg py-16 md:py-24 relative overflow-hidden" aria-labelledby="about-title">
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
              <Sparkles className="w-4 h-4 text-primary-500" />
              {t.badge}
            </span>
            <h1 id="about-title" className="font-display font-black text-warm-900 mb-6">
              {t.titleBefore} <span className="gradient-text">{t.titleHighlight}</span>
            </h1>
            <p className="text-xl text-warm-600 leading-relaxed max-w-2xl">{t.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Histoire & mission */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title">{t.historyTitle}</h2>
              <p className="text-warm-600 leading-relaxed mb-6">{t.historyP1}</p>
              <p className="text-warm-600 leading-relaxed mb-6">{t.historyP2}</p>
              <div className="bg-warm-50 border-s-4 border-primary-500 p-5 rounded-e-2xl italic text-warm-700 mb-6">
                {t.quote}
                <p className="text-sm font-semibold text-warm-900 mt-2 not-italic">{t.quoteAuthor}</p>
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-card border border-warm-100">
                <Image
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800"
                  alt={t.photoAlt}
                  fill
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-secondary-500 text-white p-6 rounded-2xl hidden md:block max-w-xs shadow-warm">
                <p className="font-display font-black text-3xl">{t.yearsValue}</p>
                <p className="text-sm text-white/90 font-medium">{t.yearsLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="section bg-warm-50">
        <div className="container-custom text-center">
          <span className="section-badge">{t.valuesBadge}</span>
          <h2 className="section-title">{t.valuesTitle}</h2>
          <p className="section-subtitle mb-12">{t.valuesSubtitle}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-start">
            {t.values.map((value, index) => {
              const look = VALUE_LOOK[index]
              return (
                <div
                  key={value.title}
                  className="card-hover p-6 bg-white rounded-2xl border border-warm-100 flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-12 h-12 blob-3 ${look.bg} flex items-center justify-center mb-5 shrink-0`}>
                      <look.icon className={`w-6 h-6 ${look.color}`} />
                    </div>
                    <h3 className="font-display font-bold text-lg text-warm-900 mb-2">{value.title}</h3>
                    <p className="text-warm-500 text-sm leading-relaxed">{value.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Équipe */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="section-badge">{t.teamBadge}</span>
            <h2 className="section-title">{t.teamTitle}</h2>
            <p className="section-subtitle">{t.teamSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TEAM.map((member, index) => {
              const person = t.team[index]
              return (
                <div
                  key={member.name}
                  className="card overflow-hidden flex flex-col h-full bg-white border border-warm-100 group"
                >
                  <div className="aspect-square w-full overflow-hidden bg-warm-100 relative">
                    <Image
                      src={member.image}
                      alt={`${t.photoOf} ${member.name}`}
                      fill
                      sizes="(min-width: 768px) 30vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-warm-900 text-lg leading-tight mb-1">
                        {member.name}
                      </h3>
                      <p className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-3">
                        {person.role}
                      </p>
                      <p className="text-warm-500 text-sm leading-relaxed">{person.bio}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-10 p-5 rounded-2xl bg-secondary-50 border border-secondary-100 text-center">
            <p className="text-secondary-700 font-semibold text-sm">{t.recruiting}</p>
          </div>
        </div>
      </section>

      {/* Appel à rejoindre */}
      <section className="section bg-warm-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />
        <div className="container-custom relative z-10 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-display font-black mb-6">{t.ctaTitle}</h2>
          <p className="text-warm-300 text-lg mb-8 leading-relaxed">{t.ctaText}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={pathFor('support', locale)}>
              <Button variant="primary" size="md">
                {t.ctaPrimary}
              </Button>
            </Link>
            <Link href={pathFor('contact', locale)}>
              <Button variant="outline" size="md" className="border-white text-white hover:bg-white/10">
                {t.ctaSecondary}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
