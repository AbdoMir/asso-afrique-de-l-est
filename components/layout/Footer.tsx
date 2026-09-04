import React from 'react'
import Link from 'next/link'
import {
  Globe, Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube,
  ArrowRight, Shield, FileText
} from 'lucide-react'
import {
  ASSOCIATION_ADDRESS,
  ASSOCIATION_LEGAL_FORM_SHORT,
  ASSOCIATION_SIRET,
} from '@/lib/association'
import { pathFor, type Locale } from '@/lib/i18n'
import type { Dictionary } from '@/lib/dictionaries'

/**
 * Les pages légales et l'espace adhérent n'existent qu'en français : on les
 * préfixe avec `localizeHref` pour rester dans la même arborescence, sans
 * prétendre qu'elles sont traduites.
 */
function buildFooterLinks(dict: Dictionary, locale: Locale) {
  const support = pathFor('support', locale)
  // Mentions légales, statuts et espace adhérent n'existent qu'en français :
  // leurs chemins restent sans préfixe, quelle que soit la langue de lecture.
  const memberArea = '/espace-adherent'
  const t = dict.footer.links

  return {
    association: [
      { label: dict.nav.about, href: pathFor('about', locale) },
      { label: dict.nav.actions, href: pathFor('actions', locale) },
      { label: dict.nav.focus, href: pathFor('focus', locale) },
      { label: t.partnersGovernance, href: pathFor('partners', locale) },
      { label: dict.nav.contact, href: pathFor('contact', locale) },
    ],
    soutenir: [
      { label: dict.nav.joinAssociation, href: `${support}?formula=simple#don-mensuel` },
      { label: dict.nav.donateMonthly, href: `${support}#don-mensuel` },
      { label: t.donateOnce, href: `${support}?formula=simple#don-mensuel` },
      { label: t.appointment, href: pathFor('appointment', locale) },
      { label: t.memberArea, href: memberArea },
    ],
    legal: [
      { label: t.legalNotice, href: '/legal/mentions-legales' },
      { label: t.privacy, href: '/legal/confidentialite' },
      { label: t.statutes, href: '/legal/statuts' },
      { label: t.receipts, href: memberArea },
    ],
  }
}
const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com', icon: Facebook },
  { label: 'Twitter', href: 'https://twitter.com', icon: Twitter },
  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
  { label: 'YouTube', href: 'https://youtube.com', icon: Youtube },
]

export function Footer({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const currentYear = new Date().getFullYear()
  const footerLinks = buildFooterLinks(dict, locale)
  const t = dict.footer
  const supportPath = pathFor('support', locale)

  return (
    <footer className="bg-warm-900 text-warm-200" role="contentinfo">
      {/* Main CTA banner */}
      <div className="bg-primary-500">
        <div className="container-custom py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white">
              {t.ctaTitle}
            </h2>
            <p className="text-white/85 mt-1">{t.ctaText}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`${supportPath}#don-mensuel`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-semibold rounded-full hover:bg-warm-50 transition-colors shadow-sm"
            >
              <Heart className="w-4 h-4" />
              {dict.nav.donateMonthly}
            </Link>
            <Link
              href={`${supportPath}?formula=simple#don-mensuel`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 text-white font-semibold rounded-full hover:bg-white/25 transition-colors border border-white/30"
            >
              {dict.nav.joinAssociation}
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
            <Link href={pathFor('home', locale)} className="flex items-center gap-3 group mb-5">
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
              {t.brandLine}
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
                <span>{ASSOCIATION_ADDRESS}</span>
              </div>
            </div>
          </div>

          {/* L'association */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">
              {t.associationTitle}
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
              {t.supportTitle}
            </h3>
            <ul className="space-y-3">
              {footerLinks.soutenir.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-warm-400 hover:text-primary-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Prestataire de paiement */}
            <div className="mt-6 p-3 bg-warm-800 rounded-xl">
              <p className="text-xs text-warm-400 mb-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-secondary-400" />
                {t.securePaymentVia}
              </p>
              <p className="text-sm font-semibold text-white">Stripe</p>
              <p className="text-xs text-warm-500 mt-1">
                {t.receiptNote}
              </p>
            </div>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">
              {t.legalTitle}
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
                {t.taxTitle}
              </p>
              <p className="text-xs text-warm-400 leading-relaxed">
                {t.taxTextBefore}
                <strong className="text-white">66%</strong>
                {t.taxTextAfter}
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
            {' '}{ASSOCIATION_LEGAL_FORM_SHORT} • SIRET : {ASSOCIATION_SIRET}
          </p>
          <p className="text-warm-600 text-xs">
            {t.madeIn}
          </p>
        </div>
      </div>
    </footer>
  )
}
