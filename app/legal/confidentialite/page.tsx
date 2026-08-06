import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité',
  description: 'Politique de confidentialité et gestion des données personnelles (RGPD) de l\'Association.',
}

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_ASSOCIATION_EMAIL || 'asso.afrique.est.et.ses.amis@outlook.fr'

/**
 * Les durées annoncées ici doivent correspondre à lib/retention.ts, appliqué
 * chaque nuit par /api/cron/purge. Annoncer une durée qu'on n'applique pas est
 * un manquement à l'art. 13 du RGPD.
 */
const RETENTIONS = [
  ['Compte adhérent et profil', 'Durée de l\'adhésion, puis 3 ans'],
  ['Adhésions, dons et reçus fiscaux', '6 ans (obligation comptable et fiscale)'],
  ['Messages envoyés via le formulaire de contact', '12 mois'],
  ['Rendez-vous et précisions associées', '12 mois après le rendez-vous'],
  ['Documents déposés dans l\'espace adhérent', '24 mois'],
  ['Inscription à la newsletter', 'Jusqu\'à votre désinscription'],
  ['Inscription newsletter jamais confirmée', '7 jours'],
]

const PROCESSORS = [
  ['Supabase', 'Base de données, comptes et stockage des documents', '🇪🇺 Suède'],
  ['HelloAsso', 'Paiement des adhésions et dons, édition des reçus CERFA', '🇫🇷 France'],
  ['Vercel', 'Hébergement du site et mesure d\'audience', '🇺🇸 États-Unis'],
  ['Resend', 'Envoi des emails (confirmations, notifications)', '🇺🇸 États-Unis'],
  ['Upstash', 'Compteurs anti-abus (adresse IP, 10 minutes)', '🇺🇸 États-Unis'],
]

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-warm-50 py-12">
      <div className="container-custom max-w-4xl">

        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-warm-500">
            <li><Link href="/" className="hover:text-primary-500 transition-colors">Accueil</Link></li>
            <li><ChevronRight className="w-4 h-4" /></li>
            <li className="text-warm-700 font-medium">Politique de Confidentialité</li>
          </ol>
        </nav>

        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-card border border-warm-100 space-y-8">
          <div className="flex items-center gap-3 border-b border-warm-100 pb-6">
            <ShieldCheck className="w-8 h-8 text-primary-500" />
            <h1 className="font-display font-black text-3xl text-warm-900">Politique de Confidentialité</h1>
          </div>

          <p className="text-warm-500 text-xs italic">Dernière mise à jour : 6 août 2026</p>

          <section className="space-y-3">
            <h2 className="font-bold text-warm-900 text-lg">1. Qui traite vos données</h2>
            <p className="text-warm-600 text-sm leading-relaxed">
              Le responsable de traitement est l&apos;<strong>Association Afrique de l&apos;Est
              et ses amis</strong>, association déclarée régie par la loi du 1<sup>er</sup> juillet 1901,
              représentée par son président. Pour toute question relative à vos données
              personnelles, écrivez-nous à <strong>{CONTACT_EMAIL}</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-bold text-warm-900 text-lg">2. Les données que nous collectons</h2>
            <p className="text-warm-600 text-sm leading-relaxed">
              Nous ne collectons que ce dont nous avons besoin, et uniquement lorsque vous
              nous le transmettez :
            </p>
            <ul className="text-warm-600 text-sm list-disc pl-5 space-y-1.5">
              <li>
                <strong>Adhésion et dons</strong> : nom, prénom, email, téléphone, adresse
                postale, montants et dates. Les paiements sont traités par HelloAsso :
                nous ne voyons ni ne stockons aucun numéro de carte ni coordonnée bancaire.
              </li>
              <li>
                <strong>Formulaire de contact</strong> : nom, email, téléphone facultatif,
                sujet et contenu du message.
              </li>
              <li>
                <strong>Prise de rendez-vous</strong> : nom, email, téléphone facultatif, et
                les précisions que vous choisissez de nous communiquer avant l&apos;entretien.
              </li>
              <li>
                <strong>Espace adhérent</strong> : les documents que vous y déposez
                vous-même dans le cadre de votre accompagnement administratif. Vous seul et
                l&apos;équipe de l&apos;association y avez accès.
              </li>
              <li>
                <strong>Newsletter</strong> : adresse email, prénom facultatif, et la preuve
                horodatée de votre consentement.
              </li>
            </ul>
            <p className="text-warm-600 text-sm leading-relaxed">
              Certaines de ces informations peuvent révéler des éléments sensibles de votre
              situation. Nous ne les demandons jamais sans raison, ne les partageons avec
              personne en dehors de l&apos;équipe qui vous accompagne, et vous pouvez à tout
              moment demander leur suppression.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-bold text-warm-900 text-lg">3. Pourquoi, et sur quelle base légale</h2>
            <ul className="text-warm-600 text-sm list-disc pl-5 space-y-1.5">
              <li><strong>Gérer votre adhésion et vos dons</strong> — exécution de notre engagement mutuel.</li>
              <li><strong>Éditer et transmettre vos reçus fiscaux CERFA</strong> — obligation légale.</li>
              <li><strong>Répondre à vos demandes et organiser vos rendez-vous</strong> — intérêt légitime de l&apos;association à mener sa mission d&apos;accompagnement.</li>
              <li><strong>Vous accompagner dans vos démarches administratives</strong> — votre consentement, que vous pouvez retirer à tout moment.</li>
              <li><strong>Vous envoyer notre newsletter</strong> — votre consentement, recueilli par une case à cocher puis confirmé par email.</li>
              <li><strong>Protéger le site des abus</strong> — intérêt légitime à la sécurité de nos services.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-bold text-warm-900 text-lg">4. Combien de temps nous les conservons</h2>
            <p className="text-warm-600 text-sm leading-relaxed">
              Une tâche automatique supprime chaque nuit les données arrivées au terme de
              leur durée de conservation. Ces durées ne sont pas indicatives : elles sont
              appliquées par le système.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-warm-200">
                    <th className="py-2 pr-4 font-semibold text-warm-900">Donnée</th>
                    <th className="py-2 font-semibold text-warm-900">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  {RETENTIONS.map(([data, duration]) => (
                    <tr key={data} className="border-b border-warm-100">
                      <td className="py-2 pr-4 text-warm-600">{data}</td>
                      <td className="py-2 text-warm-600">{duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-bold text-warm-900 text-lg">5. Qui a accès à vos données</h2>
            <p className="text-warm-600 text-sm leading-relaxed">
              Vos données sont accessibles aux membres habilités de l&apos;association, et à
              nos prestataires techniques, qui agissent uniquement sur nos instructions.
              <strong> Nous ne vendons ni ne louons vos données à personne.</strong>
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-warm-200">
                    <th className="py-2 pr-4 font-semibold text-warm-900">Prestataire</th>
                    <th className="py-2 pr-4 font-semibold text-warm-900">Rôle</th>
                    <th className="py-2 font-semibold text-warm-900">Hébergement</th>
                  </tr>
                </thead>
                <tbody>
                  {PROCESSORS.map(([name, role, location]) => (
                    <tr key={name} className="border-b border-warm-100">
                      <td className="py-2 pr-4 text-warm-900 font-medium">{name}</td>
                      <td className="py-2 pr-4 text-warm-600">{role}</td>
                      <td className="py-2 text-warm-600 whitespace-nowrap">{location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-warm-600 text-sm leading-relaxed">
              <strong>Transferts hors Union européenne.</strong> Votre compte, vos documents
              et l&apos;ensemble de vos données d&apos;adhérent sont hébergés en Suède, au sein
              de l&apos;Union européenne. Certains prestataires techniques sont établis aux
              États-Unis : ces transferts sont encadrés par les clauses contractuelles types
              adoptées par la Commission européenne.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-bold text-warm-900 text-lg">6. Mesure d&apos;audience et cookies</h2>
            <p className="text-warm-600 text-sm leading-relaxed">
              Ce site utilise <strong>Vercel Web Analytics</strong> pour mesurer sa
              fréquentation. Cet outil ne dépose aucun cookie, ne crée aucun identifiant
              persistant et ne permet ni de vous reconnaître d&apos;une visite à l&apos;autre,
              ni de vous suivre sur d&apos;autres sites. Les statistiques produites sont
              agrégées : nombre de visites, pages consultées, provenance générale. Aucun
              profilage publicitaire n&apos;est réalisé.
            </p>
            <p className="text-warm-600 text-sm leading-relaxed">
              Les seuls cookies déposés sont ceux qui maintiennent votre session lorsque
              vous vous connectez à l&apos;espace adhérent. Ils sont strictement nécessaires
              au fonctionnement du service et, à ce titre, dispensés de consentement
              préalable. Aucun cookie publicitaire ni de suivi n&apos;est utilisé — c&apos;est
              pourquoi ce site n&apos;affiche pas de bandeau.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-bold text-warm-900 text-lg">7. Vos droits</h2>
            <p className="text-warm-600 text-sm leading-relaxed">
              Le RGPD vous reconnaît un droit d&apos;<strong>accès</strong>, de{' '}
              <strong>rectification</strong>, d&apos;<strong>effacement</strong>, de{' '}
              <strong>portabilité</strong>, d&apos;<strong>opposition</strong> et de{' '}
              <strong>limitation</strong> du traitement de vos données. Vous pouvez
              également retirer à tout moment un consentement que vous nous avez donné.
            </p>
            <p className="text-warm-600 text-sm leading-relaxed">
              La plupart de ces droits s&apos;exercent directement, sans passer par nous :
            </p>
            <ul className="text-warm-600 text-sm list-disc pl-5 space-y-1.5">
              <li>
                <strong>Consulter et corriger vos informations</strong> : onglet Profil de
                votre <Link href="/espace-adherent" className="underline hover:text-primary-500">espace adhérent</Link>.
              </li>
              <li>
                <strong>Récupérer une copie de vos données</strong> : bouton « Exporter » du
                même onglet, qui produit un fichier lisible et réutilisable.
              </li>
              <li>
                <strong>Supprimer votre compte</strong> : même onglet. Vos dons et reçus
                fiscaux sont alors conservés 6 ans comme la loi comptable nous y oblige,
                mais détachés de votre identité de compte.
              </li>
              <li>
                <strong>Ne plus recevoir la newsletter</strong> : lien de désinscription
                présent au bas de chaque email.
              </li>
            </ul>
            <p className="text-warm-600 text-sm leading-relaxed">
              Pour tout le reste, écrivez-nous à <strong>{CONTACT_EMAIL}</strong>. Nous vous
              répondons dans un délai maximum d&apos;un mois.
            </p>
            <p className="text-warm-600 text-sm leading-relaxed">
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire
              une réclamation auprès de la <strong>Commission Nationale de l&apos;Informatique
              et des Libertés (CNIL)</strong> — 3 place de Fontenoy, TSA 80715, 75334 Paris
              Cedex 07, ou en ligne sur{' '}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-500">
                www.cnil.fr
              </a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-bold text-warm-900 text-lg">8. Sécurité et décisions automatisées</h2>
            <p className="text-warm-600 text-sm leading-relaxed">
              Vos données sont protégées par un cloisonnement strict au niveau de la base
              (chaque personne n&apos;accède qu&apos;aux siennes), un stockage privé des
              documents, une double authentification obligatoire pour l&apos;équipe de
              l&apos;association et un chiffrement des échanges.
            </p>
            <p className="text-warm-600 text-sm leading-relaxed">
              <strong>Aucune décision automatisée</strong> n&apos;est prise à votre sujet :
              nous ne faisons ni profilage, ni scoring, et aucune de nos réponses
              n&apos;est produite par un traitement algorithmique.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-bold text-warm-900 text-lg">9. Évolution de cette politique</h2>
            <p className="text-warm-600 text-sm leading-relaxed">
              Cette politique peut être modifiée pour refléter une évolution du site ou de
              la réglementation. La date de dernière mise à jour figure en haut de cette
              page. En cas de changement substantiel touchant vos droits, nous en
              informerons les adhérents par email.
            </p>
          </section>
        </div>

      </div>
    </div>
  )
}
