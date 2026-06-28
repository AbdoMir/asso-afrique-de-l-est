import type { Metadata } from 'next'
import { Languages, Users, Briefcase, ChevronRight, HelpCircle, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Nos focus',
  description:
    "Découvrez nos trois piliers d'intégration : Traduction, Jeunesse et Emploi. Comment nous aidons concrètement les familles d'Afrique de l'Est.",
}

const focuses = [
  {
    id: 'traduction',
    title: 'Traduction & Interprétariat',
    icon: Languages,
    desc: 'Lever les barrières linguistiques pour un accès digne aux droits.',
    details: [
      'Aide à l’interprétariat médical pour garantir un suivi de santé de qualité et sécurisé.',
      'Traduction certifiée ou d’usage de documents officiels, courriers administratifs et scolaires.',
      'Sensibilisation des administrations publiques aux spécificités culturelles de la Corne de l’Afrique.'
    ],
    testimonial: {
      text: '“La barrière de la langue était un mur infranchissable à mon arrivée. Les traducteurs de l’association m’ont accompagnée chez le médecin et à la mairie, ce qui a tout débloqué.”',
      author: 'Kidane T., bénéficiaire'
    },
    color: 'text-primary-500',
    bg: 'bg-primary-50',
    border: 'border-primary-100',
  },
  {
    id: 'jeunesse',
    title: 'Jeunesse & Scolarité',
    icon: Users,
    desc: 'Accompagner la réussite scolaire et l’épanouissement culturel des enfants.',
    details: [
      'Aide aux devoirs et tutorat individuel hebdomadaire en français, mathématiques et anglais.',
      'Suivi de la relation parents-enseignants pour éviter le décrochage et favoriser le dialogue.',
      'Ateliers créatifs, d’expression orale, d’écriture et d’initiation à l’informatique.',
      'Sorties culturelles mensuelles (théâtres, musées, bibliothèques) et sorties nature pendant les vacances.'
    ],
    testimonial: {
      text: '“Grâce au soutien scolaire du mercredi, mon fils a repris confiance en lui en français. Ses notes se sont améliorées et il adore participer aux sorties culturelles.”',
      author: 'Rahma A., maman d’un élève'
    },
    color: 'text-secondary-500',
    bg: 'bg-secondary-50',
    border: 'border-secondary-100',
  },
  {
    id: 'emploi',
    title: 'Accompagnement Emploi',
    icon: Briefcase,
    desc: 'Favoriser l’autonomie par une insertion professionnelle durable.',
    details: [
      'Ateliers de rédaction de CV et de lettres de motivation adaptés aux codes du marché français.',
      'Simulations d’entretiens d’embauche avec des professionnels bénévoles.',
      'Identification et mise en avant des compétences acquises à l’étranger (VAE, équivalences).',
      'Mise en relation directe avec notre réseau d’entreprises inclusives partenaires.'
    ],
    testimonial: {
      text: '“L’association m’a aidé à refaire mon CV et à me préparer pour les entretiens. Aujourd’hui, j’ai signé mon premier CDI dans la logistique.”',
      author: 'Yusuf M., inséré professionnellement'
    },
    color: 'text-accent-600',
    bg: 'bg-accent-50',
    border: 'border-accent-100',
  }
]

export default function NosFocusPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="hero-bg py-16 md:py-24 relative overflow-hidden" aria-label="Nos focus hero">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-100/40 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="container-custom relative">
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-warm-500">
              <li><a href="/" className="hover:text-primary-500 transition-colors">Accueil</a></li>
              <li><ChevronRight className="w-4 h-4" /></li>
              <li className="text-warm-700 font-medium">Nos focus</li>
            </ol>
          </nav>
          
          <div className="max-w-3xl">
            <span className="section-badge bg-primary-50 text-primary-600">
              <UserCheck className="w-4 h-4 text-primary-500" />
              Nos Piliers Fondamentaux
            </span>
            <h1 className="font-display font-black text-warm-900 mb-6">
              Nos trois axes <span className="gradient-text">de réussite et d&apos;intégration</span>
            </h1>
            <p className="text-xl text-warm-600 leading-relaxed max-w-2xl">
              Nous concentrons nos actions autour de trois problématiques clés pour sécuriser le parcours des familles primo-arrivantes.
            </p>
          </div>
        </div>
      </section>

      {/* Focus Detailed Cards */}
      <section className="section bg-white">
        <div className="container-custom space-y-16">
          {focuses.map((focus) => (
            <div 
              key={focus.id} 
              id={focus.id}
              className={`scroll-mt-24 p-8 md:p-12 rounded-3xl bg-warm-50/50 border border-warm-100 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch`}
            >
              
              {/* Left detail side */}
              <div className="lg:col-span-8 space-y-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 blob-3 ${focus.bg} flex items-center justify-center`}>
                      <focus.icon className={`w-6 h-6 ${focus.color}`} />
                    </div>
                    <div>
                      <h2 className="font-display font-black text-2xl md:text-3xl text-warm-900">{focus.title}</h2>
                      <p className="text-primary-500 font-semibold text-sm">{focus.desc}</p>
                    </div>
                  </div>

                  <ul className="space-y-3 mt-8">
                    {focus.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-3 text-warm-700 text-base">
                        <span className="w-5 h-5 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                          ✓
                        </span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <Link href="/contact">
                    <Button variant="primary" size="sm">
                      Bénéficier de cet accompagnement
                    </Button>
                  </Link>
                  <Link href="/contact?subject=devenir-benevole">
                    <Button variant="outline" size="sm">
                      Devenir bénévole sur ce focus
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right testimonial block */}
              <div className="lg:col-span-4 bg-warm-900 text-white rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <HelpCircle className="w-8 h-8 text-primary-400 mb-6" />
                  <p className="italic text-warm-200 text-sm md:text-base leading-relaxed">
                    {focus.testimonial.text}
                  </p>
                </div>
                <div className="border-t border-warm-800 pt-4 mt-6">
                  <p className="font-bold text-sm text-warm-100">{focus.testimonial.author}</p>
                  <p className="text-xs text-warm-400">Témoignage vérifié</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
