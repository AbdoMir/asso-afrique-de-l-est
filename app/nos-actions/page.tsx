import type { Metadata } from 'next'
import { BookOpen, GraduationCap, Briefcase, Languages, ChevronRight, CheckCircle2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Nos actions',
  description:
    "Découvrez les projets de l'Association Afrique de l'Est et ses amis. Cours de FLE, accompagnement à l'emploi, soutien scolaire jeunesse et traduction.",
}

const actions = [
  {
    title: 'Français Langue Étrangère (FLE)',
    icon: Languages,
    status: 'Actif',
    desc: 'Des ateliers hebdomadaires d’apprentissage du français par petits groupes de niveau, animés par des formateurs bénévoles qualifiés. L’objectif est de donner l’autonomie de communication indispensable au quotidien.',
    stats: [
      { label: 'Heures dispensées / an', value: '450h' },
      { label: 'Bénéficiaires actifs', value: '82 personnes' },
      { label: 'Groupes de niveau', value: '4 niveaux' }
    ],
    image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=600&h=400',
    color: 'text-primary-500',
    bg: 'bg-primary-50',
  },
  {
    title: 'Accompagnement Vers l’Emploi',
    icon: Briefcase,
    status: 'Actif',
    desc: 'Un parcours personnalisé pour aider les adultes à définir un projet professionnel, rédiger leur CV, préparer leurs entretiens et entrer en relation avec des entreprises partenaires prêtes à donner leur chance.',
    stats: [
      { label: 'Personnes insérées / an', value: '18 actifs' },
      { label: 'Ateliers de coaching', value: '2 par mois' },
      { label: 'Entreprises partenaires', value: '9 structures' }
    ],
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600&h=400',
    color: 'text-secondary-500',
    bg: 'bg-secondary-50',
  },
  {
    title: 'Soutien Scolaire & Jeunesse',
    icon: GraduationCap,
    status: 'Actif',
    desc: 'Aide aux devoirs et tutorat pour les enfants du primaire au lycée. Nous organisons également des sorties culturelles (musées, parcs, théâtres) pour favoriser l’ouverture culturelle et l’épanouissement des jeunes.',
    stats: [
      { label: 'Enfants accompagnés', value: '45 élèves' },
      { label: 'Tuteurs bénévoles', value: '15 étudiants' },
      { label: 'Sorties culturelles', value: '6 par an' }
    ],
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600&h=400',
    color: 'text-accent-600',
    bg: 'bg-accent-50',
  },
  {
    title: 'Traduction & Interprétariat Social',
    icon: BookOpen,
    status: 'Actif',
    desc: 'Assistance linguistique lors des rendez-vous médicaux, administratifs ou scolaires. Traduction de courriers officiels pour garantir l’accès effectif aux droits et éviter les ruptures de parcours liées à la barrière de la langue.',
    stats: [
      { label: 'Dossiers traduits / an', value: '150 dossiers' },
      { label: 'Interventions physiques', value: '60 rendez-vous' },
      { label: 'Langues couvertes', value: 'Amharique, Tigrigna, Somali...' }
    ],
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=600&h=400',
    color: 'text-red-500',
    bg: 'bg-red-50',
  },
]

export default function NosActionsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="hero-bg py-16 md:py-24 relative overflow-hidden" aria-label="Nos actions hero">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-100/40 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="container-custom relative">
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-warm-500">
              <li><a href="/" className="hover:text-primary-500 transition-colors">Accueil</a></li>
              <li><ChevronRight className="w-4 h-4" /></li>
              <li className="text-warm-700 font-medium">Nos actions</li>
            </ol>
          </nav>
          
          <div className="max-w-3xl">
            <span className="section-badge bg-primary-50 text-primary-600">
              <Calendar className="w-4 h-4 text-primary-500" />
              Actions sur le terrain
            </span>
            <h1 className="font-display font-black text-warm-900 mb-6">
              Nos projets pour <span className="gradient-text">accompagner le quotidien</span>
            </h1>
            <p className="text-xl text-warm-600 leading-relaxed max-w-2xl">
              De l&apos;apprentissage de la langue à l&apos;insertion professionnelle, nous développons des programmes 
              concrets pour répondre aux besoins fondamentaux des familles.
            </p>
          </div>
        </div>
      </section>

      {/* Action Cards List */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="space-y-16">
            {actions.map((act, index) => (
              <div 
                key={act.title} 
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-warm-100 pb-16 last:border-0 last:pb-0`}
              >
                
                {/* Image (order changes on alternation) */}
                <div className={`lg:col-span-5 ${index % 2 === 1 ? 'lg:order-last' : ''}`}>
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-card border border-warm-100 relative group">
                    <img 
                      src={act.image} 
                      alt={`Illustration pour ${act.title}`} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-warm-900 text-xs font-bold px-3 py-1.5 rounded-full border border-warm-100 shadow-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-secondary-500 fill-secondary-100" />
                      Programme actif
                    </div>
                  </div>
                </div>

                {/* Text content */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${act.bg} flex items-center justify-center`}>
                      <act.icon className={`w-6 h-6 ${act.color}`} />
                    </div>
                    <h2 className="font-display font-black text-2xl md:text-3xl text-warm-900">{act.title}</h2>
                  </div>

                  <p className="text-warm-600 leading-relaxed">
                    {act.desc}
                  </p>

                  {/* Program stats */}
                  <div className="grid grid-cols-3 gap-4 border-t border-warm-100 pt-6">
                    {act.stats.map((st) => (
                      <div key={st.label}>
                        <div className="text-2xl font-black font-display text-primary-500 leading-none mb-1">{st.value}</div>
                        <div className="text-xs font-medium text-warm-500 leading-tight">{st.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link href="/adherer-soutenir">
                      <Button variant="outline" size="sm" className="font-bold">
                        Soutenir ce programme
                      </Button>
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Block */}
      <section className="section bg-warm-50 border-y border-warm-100">
        <div className="container-custom text-center max-w-4xl mx-auto">
          <h2 className="font-display font-black text-3xl text-warm-900 mb-6">Notre Impact en 2025</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '248', label: 'Familles aidées' },
              { value: '450h', label: 'Cours de FLE' },
              { value: '18', label: 'Emplois stables' },
              { value: '150', label: 'Traductions' }
            ].map((stat) => (
              <div key={stat.label} className="p-6 bg-white rounded-2xl shadow-sm border border-warm-100">
                <div className="text-4xl font-black font-display text-primary-500 mb-1">{stat.value}</div>
                <div className="text-sm font-semibold text-warm-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
