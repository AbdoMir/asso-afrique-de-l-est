import type { Metadata } from 'next'
import { Heart, Compass, Users, Award, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Qui sommes-nous',
  description:
    "Découvrez l'Association Afrique de l'Est et ses amis. Notre histoire, notre équipe et nos valeurs fondamentales pour accompagner l'intégration des familles.",
}

const values = [
  {
    icon: Heart,
    title: 'Solidarité active',
    desc: 'Nous offrons un soutien direct et concret aux familles à travers des actions de terrain quotidiennes.',
    color: 'text-primary-500',
    bg: 'bg-primary-50',
  },
  {
    icon: Compass,
    title: 'Intégration réussie',
    desc: 'Nous facilitons l’adaptation en France tout en valorisant la richesse culturelle de chacun.',
    color: 'text-secondary-500',
    bg: 'bg-secondary-50',
  },
  {
    icon: Users,
    title: 'Partage & Échange',
    desc: 'Nous créons des espaces de rencontre interculturels et conviviaux pour briser l’isolement.',
    color: 'text-accent-600',
    bg: 'bg-accent-50',
  },
  {
    icon: Award,
    title: 'Proximité & Écoute',
    desc: 'Notre accompagnement est personnalisé, adapté au parcours et aux besoins spécifiques de chaque famille.',
    color: 'text-red-500',
    bg: 'bg-red-50',
  },
]

const team = [
  {
    name: 'Ismael Ali Moussa',
    role: 'Président',
    bio: 'Porte la vision de l’association et représente l’association auprès des institutions strasbourgeoises.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400',
  },
  {
    name: 'Safia Hassan',
    role: 'Trésorière',
    bio: 'Veille à la saine gestion financière et à la transparence budgétaire de l’association.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400',
  },
  {
    name: 'Dzenita Ibrahimovic',
    role: 'Secrétaire',
    bio: 'Coordonne l’accueil des familles et organise les plannings des permanences et des cours de FLE.',
    image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400&h=400',
  },
]

export default function QuiSommesNousPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="hero-bg py-16 md:py-24 relative overflow-hidden" aria-label="Qui sommes-nous hero">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-100/40 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="container-custom relative">
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-warm-500">
              <li><a href="/" className="hover:text-primary-500 transition-colors">Accueil</a></li>
              <li><ChevronRight className="w-4 h-4" /></li>
              <li className="text-warm-700 font-medium">Qui sommes-nous</li>
            </ol>
          </nav>
          
          <div className="max-w-3xl">
            <span className="section-badge bg-primary-50 text-primary-600">
              <Sparkles className="w-4 h-4 text-primary-500" />
              Notre Association
            </span>
            <h1 className="font-display font-black text-warm-900 mb-6">
              Bâtir un pont vers <span className="gradient-text">une intégration harmonieuse</span>
            </h1>
            <p className="text-xl text-warm-600 leading-relaxed max-w-2xl">
              Depuis 2025, l&apos;Association Afrique de l&apos;Est et ses amis accompagne à Strasbourg les familles
              originaires de Somalie, du Somaliland, d&apos;Éthiopie, du Soudan, d&apos;Érythrée et de Djibouti dans
              leurs démarches d&apos;insertion en France.
            </p>
          </div>
        </div>
      </section>

      {/* History & Mission */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title">Notre histoire & notre mission</h2>
              <p className="text-warm-600 leading-relaxed mb-6">
                L’intégration des familles primo-arrivantes est un parcours complexe jalonné d’obstacles administratifs, 
                linguistiques et sociaux. C&apos;est de ce constat qu’est née l&apos;Association Afrique de l&apos;Est et ses amis en 2025.
              </p>
              <p className="text-warm-600 leading-relaxed mb-6">
                Notre action repose sur une conviction profonde : une intégration réussie passe par l’apprentissage de la langue, 
                le soutien à la réussite scolaire des enfants, l&apos;autonomisation économique des parents et la facilitation des démarches.
              </p>
              <div className="bg-warm-50 border-l-4 border-primary-500 p-5 rounded-r-2xl italic text-warm-700 mb-6">
                &ldquo;Faire de Strasbourg une terre d&apos;opportunités pour la Corne de l&apos;Afrique.&rdquo;
                <p className="text-sm font-semibold text-warm-900 mt-2 not-italic">— Ismael Ali Moussa, Président</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-card border border-warm-100">
                {/* Visual Image representing solidarity */}
                <img 
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800" 
                  alt="Réunion d'échange et de soutien entre membres de l'association"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-secondary-500 text-white p-6 rounded-2xl hidden md:block max-w-xs shadow-warm">
                <p className="font-display font-black text-3xl">8 ans</p>
                <p className="text-sm text-white/90 font-medium">d&apos;engagement continu et d&apos;accompagnement solidaire en France.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-warm-50">
        <div className="container-custom text-center">
          <span className="section-badge">Nos Fondations</span>
          <h2 className="section-title">Les valeurs qui nous guident</h2>
          <p className="section-subtitle mb-12">
            Notre projet associatif repose sur quatre principes directeurs partagés par tous nos bénévoles.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {values.map((v) => (
              <div key={v.title} className="card-hover p-6 bg-white rounded-2xl border border-warm-100 flex flex-col justify-between">
                <div>
                  <div className={`w-12 h-12 blob-3 ${v.bg} flex items-center justify-center mb-5 shrink-0`}>
                    <v.icon className={`w-6 h-6 ${v.color}`} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-warm-900 mb-2">{v.title}</h3>
                  <p className="text-warm-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="section-badge">Gouvernance</span>
            <h2 className="section-title">L&apos;équipe de l&apos;association</h2>
            <p className="section-subtitle">
              Des bénévoles et des professionnels engagés au service de la solidarité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.name} className="card overflow-hidden flex flex-col h-full bg-white border border-warm-100 group">
                <div className="aspect-square w-full overflow-hidden bg-warm-100 relative">
                  <img 
                    src={member.image} 
                    alt={`Photo de ${member.name}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-warm-900 text-lg leading-tight mb-1">{member.name}</h3>
                    <p className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-3">{member.role}</p>
                    <p className="text-warm-500 text-sm leading-relaxed">{member.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-5 rounded-2xl bg-secondary-50 border border-secondary-100 text-center">
            <p className="text-secondary-700 font-semibold text-sm">
              Nous recherchons des talents pour compléter notre équipe dirigeante et bâtir ce pont ensemble !
            </p>
          </div>
        </div>
      </section>

      {/* Support Call-to-action */}
      <section className="section bg-warm-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />
        <div className="container-custom relative z-10 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-display font-black mb-6">Rejoignez notre aventure solidaire</h2>
          <p className="text-warm-300 text-lg mb-8 leading-relaxed">
            Que ce soit en donnant de votre temps comme formateur de français, accompagnateur administratif, 
            ou en soutenant nos actions par un don mensuel, vous changez concrètement la vie de dizaines de familles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/adherer-soutenir">
              <Button variant="primary" size="md">
                Devenir adhérent ou donateur
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="md" className="border-white text-white hover:bg-white/10">
                Devenir bénévole
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
