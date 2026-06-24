import type { Metadata } from 'next'
import { ChevronRight, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mentions Légales',
  description: 'Mentions légales de l\'Association Afrique de l\'Est et ses amis.',
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-warm-50 py-12">
      <div className="container-custom max-w-4xl">
        
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-warm-500">
            <li><a href="/" className="hover:text-primary-500 transition-colors">Accueil</a></li>
            <li><ChevronRight className="w-4 h-4" /></li>
            <li className="text-warm-700 font-medium">Mentions Légales</li>
          </ol>
        </nav>

        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-card border border-warm-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-warm-100 pb-6">
            <FileText className="w-8 h-8 text-primary-500" />
            <h1 className="font-display font-black text-3xl text-warm-900">Mentions Légales</h1>
          </div>

          <section className="space-y-3">
            <h2 className="font-bold text-warm-900 text-lg">1. Éditeur du site</h2>
            <p className="text-warm-600 text-sm leading-relaxed">
              Le présent site internet est édité par l&apos;<strong>Association Afrique de l&apos;Est et ses amis</strong>, 
              association déclarée régie par la loi du 1er juillet 1901 et le décret du 16 août 1901.
            </p>
            <ul className="text-warm-600 text-sm list-disc pl-5 space-y-1">
              <li><strong>RNA (Répertoire National des Associations) :</strong> {process.env.NEXT_PUBLIC_RNA || 'WXXXXXXXXXX'}</li>
              <li><strong>SIRET :</strong> {process.env.NEXT_PUBLIC_ASSOCIATION_SIRET || 'XXX XXX XXX XXXXX'}</li>
              <li><strong>Siège social :</strong> {process.env.NEXT_PUBLIC_ASSOCIATION_ADDRESS || 'XX rue XXXXX, 75XXX Paris'}</li>
              <li><strong>Email :</strong> {process.env.NEXT_PUBLIC_ASSOCIATION_EMAIL || 'contact@asso-aes.fr'}</li>
              <li><strong>Directeur de la publication :</strong> Amina Barreh, en sa qualité de Présidente de l&apos;association.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-bold text-warm-900 text-lg">2. Hébergeur</h2>
            <p className="text-warm-600 text-sm leading-relaxed">
              Le site est hébergé par la société <strong>Vercel Inc.</strong>, situé au :
            </p>
            <p className="text-warm-600 text-sm italic pl-5">
              Vercel Inc. — 340 S Lemon Ave #4133 Walnut, CA 91789, USA.
            </p>
            <p className="text-warm-600 text-sm leading-relaxed">
              Les serveurs physiques de Vercel pour l&apos;Europe sont situés dans des datacenters respectueux des normes 
              européennes de sécurité et de conformité RGPD (Irlande / Allemagne).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-bold text-warm-900 text-lg">3. Propriété intellectuelle</h2>
            <p className="text-warm-600 text-sm leading-relaxed">
              L&apos;ensemble des contenus (textes, graphismes, logos, images) présents sur ce site est, sauf mention contraire, 
              la propriété exclusive de l&apos;Association Afrique de l&apos;Est et ses amis. Toute reproduction, distribution ou 
              utilisation de ces éléments sans l&apos;accord écrit préalable de l&apos;association est strictement interdite.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-bold text-warm-900 text-lg">4. Limitation de responsabilité</h2>
            <p className="text-warm-600 text-sm leading-relaxed">
              L&apos;association s&apos;efforce de fournir des informations aussi précises que possible sur ce site. Cependant, 
              elle ne pourra être tenue responsable des omissions, des inexactitudes et des carences dans la mise à jour, 
              qu&apos;elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
            </p>
          </section>
        </div>

      </div>
    </div>
  )
}
