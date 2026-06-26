import type { Metadata } from 'next'
import { ChevronRight, Landmark } from 'lucide-react'
import { DownloadButton } from './DownloadButton'

export const metadata: Metadata = {
  title: 'Statuts de l\'association',
  description: 'Statuts officiels déposés en préfecture de l\'Association Afrique de l\'Est et ses amis.',
}

export default function StatutsPage() {
  return (
    <div className="min-h-screen bg-warm-50 py-12">
      <div className="container-custom max-w-4xl">
        
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-warm-500">
            <li><a href="/" className="hover:text-primary-500 transition-colors">Accueil</a></li>
            <li><ChevronRight className="w-4 h-4" /></li>
            <li className="text-warm-700 font-medium">Statuts de l&apos;association</li>
          </ol>
        </nav>

        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-card border border-warm-100 space-y-6">
          <div className="flex items-center justify-between border-b border-warm-100 pb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Landmark className="w-8 h-8 text-primary-500" />
              <h1 className="font-display font-black text-3xl text-warm-900">Statuts de l&apos;association</h1>
            </div>
            
            {/* Simulation of statute file download */}
            <DownloadButton />
          </div>

          <p className="text-warm-500 text-sm leading-relaxed">
            Statuts révisés adoptés par l’Assemblée Générale Extraordinaire du 12 février 2024. 
            L’association est régie par la loi du 1er juillet 1901 et le décret du 16 août 1901.
          </p>

          <div className="space-y-6 pt-4 text-sm leading-relaxed text-warm-700">
            <section className="space-y-2">
              <h2 className="font-bold text-warm-900 text-base">ARTICLE 1 : Titre / Nom</h2>
              <p>
                Il est fondé entre les adhérents aux présents statuts une association régie par la loi du 1er juillet 1901 
                et le décret du 16 août 1901, ayant pour titre : <strong>Association Afrique de l&apos;Est et ses amis</strong>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-warm-900 text-base">ARTICLE 2 : Objet / But</h2>
              <p>
                Cette association a pour but d&apos;accompagner et d&apos;orienter les familles d&apos;Afrique de l&apos;Est (notamment issues de la Corne 
                de l&apos;Afrique) primo-arrivantes ou résidant en France. Ses actions visent à faciliter leur insertion sociale, 
                linguistique, scolaire et professionnelle par des cours de français, de la médiation, du soutien scolaire, de la traduction 
                et de l&apos;aide à la recherche d&apos;emploi.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-warm-900 text-base">ARTICLE 3 : Siège social</h2>
              <p>
                Le siège social est fixé au {process.env.NEXT_PUBLIC_ASSOCIATION_ADDRESS || '1 rue de Graffenstaden, 67380 Lingolsheim'}.
                Il pourra être transféré sur simple décision du Conseil d&apos;Administration.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-warm-900 text-base">ARTICLE 4 : Membres & Cotisation</h2>
              <p>
                L&apos;association se compose de membres adhérents, de membres bienfaiteurs et de membres d&apos;honneur. 
                Le montant annuel de la cotisation d&apos;adhésion simple est fixé par l&apos;Assemblée Générale (établi actuellement à 10€ / an).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-warm-900 text-base">ARTICLE 5 : Ressources de l&apos;association</h2>
              <p>
                Les ressources de l&apos;association se composent : des cotisations de ses membres, des dons ponctuels ou réguliers, 
                des subventions de l&apos;État, des départements, des communes et des établissements publics, ainsi que de toute ressource 
                autorisée par les lois et règlements en vigueur.
              </p>
            </section>
          </div>
        </div>

      </div>
    </div>
  )
}
