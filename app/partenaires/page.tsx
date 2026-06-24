import type { Metadata } from 'next'
import { Building2, Landmark, Heart, FileText, ChevronRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Partenaires & Gouvernance',
  description:
    "Découvrez nos partenaires institutionnels, associatifs et d'entreprise, ainsi que notre modèle de gouvernance transparent et démocratique.",
}

const partners = [
  {
    category: 'Institutions',
    icon: Landmark,
    items: [
      { name: 'Préfecture du Bas-Rhin', desc: 'Accompagnement des démarches liées à la régularisation et à l’intégration.', logo: '🏛️' },
      { name: 'Services de l’État', desc: 'Coordination sur les dispositifs d’accueil des primo-arrivants.', logo: '🏛️' },
      { name: 'Organismes d’Intégration', desc: 'Partenariats sur les parcours d’intégration linguistique et sociale.', logo: '🏛️' },
    ],
  },
  {
    category: 'Ville & Région',
    icon: Building2,
    items: [
      { name: 'Ville de Strasbourg', desc: 'Soutien aux actions locales et mise à disposition d’espaces d’accueil.', logo: '🏙️' },
      { name: 'Eurométropole', desc: 'Passerelles avec les infrastructures sportives et sociales de quartier.', logo: '🏙️' },
      { name: 'Quartiers Prioritaires', desc: 'Actions ciblées en faveur des familles des quartiers prioritaires.', logo: '🏙️' },
    ],
  },
  {
    category: 'Local & Sport',
    icon: Heart,
    items: [
      { name: 'Clubs Sportifs Locaux', desc: 'Partenariats pour faciliter l’inscription et l’équipement des jeunes sportifs.', logo: '🤝' },
      { name: 'Associations de Quartier', desc: 'Collaboration sur les événements interculturels et le lien social.', logo: '🤝' },
      { name: 'Réseaux de Bénévoles', desc: 'Mobilisation de traducteurs et accompagnateurs bénévoles.', logo: '🤝' },
    ],
  },
]

export default function PartenairesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="hero-bg py-16 md:py-24 relative overflow-hidden" aria-label="Partenaires hero">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-100/40 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="container-custom relative">
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-warm-500">
              <li><a href="/" className="hover:text-primary-500 transition-colors">Accueil</a></li>
              <li><ChevronRight className="w-4 h-4" /></li>
              <li className="text-warm-700 font-medium">Partenaires & Gouvernance</li>
            </ol>
          </nav>
          
          <div className="max-w-3xl">
            <span className="section-badge bg-primary-50 text-primary-600">
              <ShieldCheck className="w-4 h-4 text-primary-500" />
              Confiance & Solidarité
            </span>
            <h1 className="font-display font-black text-warm-900 mb-6">
              Partenaires & <span className="gradient-text">transparence financière</span>
            </h1>
            <p className="text-xl text-warm-600 leading-relaxed max-w-2xl">
              Nous croyons en un modèle d&apos;action partenarial et transparent. Découvrez nos soutiens et notre gouvernance démocratique.
            </p>
          </div>
        </div>
      </section>

      {/* Governance & Model */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <h2 className="section-title">Une gouvernance transparente</h2>
              <p className="text-warm-600 leading-relaxed">
                L&apos;Association Afrique de l&apos;Est et ses amis est une structure à but non lucratif gérée selon les principes 
                de la loi 1901. Notre gouvernance est collégiale, démocratique et transparente.
              </p>
              
              <div className="space-y-4">
                {[
                  { title: 'Élections annuelles', desc: 'Le conseil d’administration et le bureau sont renouvelés chaque année par l’Assemblée Générale des adhérents.' },
                  { title: 'Transparence financière', desc: 'Nos comptes sont certifiés chaque année et présentés publiquement dans notre rapport financier disponible sur demande.' },
                  { title: 'Modération des frais', desc: 'Plus de 92% de nos ressources financières sont directement affectées aux actions de terrain pour les familles.' }
                ].map((item) => (
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
              <h3 className="font-display font-black text-2xl text-warm-100">Transparence financière : Emploi des ressources</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-warm-800 pb-3">
                  <span className="text-warm-300">Actions sociales (Cours, traduction, emploi)</span>
                  <span className="font-bold text-secondary-400">92.4 %</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-warm-800 pb-3">
                  <span className="text-warm-300">Frais de communication et collecte</span>
                  <span className="font-bold text-primary-400">4.8 %</span>
                </div>
                <div className="flex justify-between items-center text-sm pb-2">
                  <span className="text-warm-300">Frais administratifs de fonctionnement</span>
                  <span className="font-bold text-accent-400">2.8 %</span>
                </div>
              </div>

              <p className="text-xs text-warm-400 leading-normal">
                * Données certifiées sur l’exercice 2025. L’association est éligible aux réductions d’impôts 
                au titre d’organisme d’intérêt général (Articles 200 et 238 bis du CGI).
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Partners List */}
      <section className="section bg-warm-50 border-t border-warm-100">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="section-badge">Réseau de Confiance</span>
            <h2 className="section-title">Ils soutiennent notre action</h2>
            <p className="section-subtitle">
              Grâce aux subventions publiques, aux aides associatives et au mécénat privé, nous pérennisons nos actions.
            </p>
          </div>

          <div className="space-y-12">
            {partners.map((group) => (
              <div key={group.category} className="space-y-6">
                <div className="flex items-center gap-3 border-b border-warm-200 pb-4">
                  <group.icon className="w-5 h-5 text-primary-500" />
                  <h3 className="font-display font-black text-xl text-warm-900">{group.category}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.items.map((item) => (
                    <div key={item.name} className="p-6 bg-white rounded-2xl shadow-sm border border-warm-100 hover:shadow-card transition-shadow">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-3xl bg-warm-50 w-12 h-12 rounded-xl flex items-center justify-center border border-warm-100">
                          {item.logo}
                        </div>
                        <h4 className="font-bold text-warm-900 text-lg leading-tight">{item.name}</h4>
                      </div>
                      <p className="text-warm-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
