import React from 'react'
import Link from 'next/link'
import {
  Globe, Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube,
  ArrowRight, Shield, FileText
} from 'lucide-react'

const footerLinks = {
  association: [
    { label: 'Qui sommes-nous', href: '/qui-sommes-nous' },
    { label: 'Nos actions', href: '/nos-actions' },
    { label: 'Nos focus', href: '/nos-focus' },
    { label: 'Partenaires & Gouvernance', href: '/partenaires' },
    { label: 'Contact', href: '/contact' },
  ],
  soutenir: [
    { label: 'Adhérer à l\'association', href: '/adherer-soutenir' },
    { label: 'Faire un don mensuel', href: '/adherer-soutenir#don-mensuel' },
    { label: 'Faire un don ponctuel', href: '/adherer-soutenir#don-ponctuel' },
    { label: 'Espace adhérent', href: '/espace-adherent' },
  ],
  legal: [
    { label: 'Mentions légales', href: '/legal/mentions-legales' },
    { label: 'Politique de confidentialité', href: '/legal/confidentialite' },
    { label: 'Statuts de l\'association', href: '/legal/statuts' },
    { label: 'Reçus fiscaux CERFA', href: '/espace-adherent/recus-fiscaux' },
  ],
}

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com', icon: Facebook },
  { label: 'Twitter', href: 'https://twitter.com', icon: Twitter },
  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
  { label: 'YouTube', href: 'https://youtube.com', icon: Youtube },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-warm-900 text-warm-200" role="contentinfo">
      {/* Main CTA banner */}
      <div className="bg-primary-500">
        <div className="container-custom py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white">
              Soutenez notre mission
            </h2>
            <p className="text-white/85 mt-1">
              Chaque don mensuel finance directement l&apos;intégration d&apos;une famille.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/adherer-soutenir#don-mensuel"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-semibold rounded-full hover:bg-warm-50 transition-colors shadow-sm"
            >
              <Heart className="w-4 h-4" />
              Faire un don mensuel
            </Link>
            <Link
              href="/adherer-soutenir"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 text-white font-semibold rounded-full hover:bg-white/25 transition-colors border border-white/30"
            >
              Adhérer à l&apos;association
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer content */}
      <div className="container-custom py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 group mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-display font-bold text-white text-sm leading-tight">
                  Afrique de l&apos;Est
                </p>
                <p className="text-primary-400 text-xs font-medium">et ses amis</p>
              </div>
            </Link>

            <p className="text-warm-400 text-sm leading-relaxed mb-6">
              Association loi 1901 accompagnant les familles d&apos;Afrique de l&apos;Est
              dans leur intégration en France depuis 2018.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-warm-800 hover:bg-primary-500 flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 text-warm-300" />
                </a>
              ))}
            </div>

            {/* Contact info */}
            <div className="mt-6 space-y-2">
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_ASSOCIATION_EMAIL || 'asso.afrique.est.et.ses.amis@outlook.fr'}`}
                className="flex items-center gap-2 text-sm text-warm-400 hover:text-primary-400 transition-colors"
              >
                <Mail className="w-4 h-4 shrink-0" />
                {process.env.NEXT_PUBLIC_ASSOCIATION_EMAIL || 'asso.afrique.est.et.ses.amis@outlook.fr'}
              </a>
              <a
                href="tel:+33605675911"
                className="flex items-center gap-2 text-sm text-warm-400 hover:text-primary-400 transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" />
                {process.env.NEXT_PUBLIC_ASSOCIATION_PHONE || '06 05 67 59 11'}
              </a>
              <div className="flex items-start gap-2 text-sm text-warm-400">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{process.env.NEXT_PUBLIC_ASSOCIATION_ADDRESS || '1 rue de Graffenstaden, 67380 Lingolsheim'}</span>
              </div>
            </div>
          </div>

          {/* L'association */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">
              L&apos;association
            </h3>
            <ul className="space-y-3">
              {footerLinks.association.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-warm-400 hover:text-primary-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Nous soutenir */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">
              Nous soutenir
            </h3>
            <ul className="space-y-3">
              {footerLinks.soutenir.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-warm-400 hover:text-primary-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* HelloAsso badge */}
            <div className="mt-6 p-3 bg-warm-800 rounded-xl">
              <p className="text-xs text-warm-400 mb-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-secondary-400" />
                Paiement sécurisé via
              </p>
              <p className="text-sm font-semibold text-white">HelloAsso & Stripe</p>
              <p className="text-xs text-warm-500 mt-1">
                Reçu fiscal automatique chaque janvier
              </p>
            </div>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">
              Informations légales
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-warm-400 hover:text-primary-400 text-sm transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Tax deduction info */}
            <div className="mt-6 p-3 bg-warm-800 border-2 border-secondary-500 rounded-xl">
              <p className="text-xs text-secondary-400 font-bold mb-1 uppercase tracking-wide">
                Déduction fiscale
              </p>
              <p className="text-xs text-warm-400 leading-relaxed">
                Vos dons sont déductibles à <strong className="text-white">66%</strong> de
                votre impôt sur le revenu (art. 200 du CGI).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-warm-800">
        <div className="container-custom py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-warm-500 text-sm text-center sm:text-left">
            © {currentYear} Association Afrique de l&apos;Est et ses amis — 
            Association loi 1901 • RNA : {process.env.NEXT_PUBLIC_RNA || 'WXXXXXXXXXX'}
          </p>
          <p className="text-warm-600 text-xs">
            Fait en France • Données hébergées en Europe
          </p>
        </div>
      </div>
    </footer>
  )
}
