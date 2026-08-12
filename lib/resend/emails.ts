import { Resend } from 'resend'
import { escapeHtml } from '@/lib/utils'
import { ASSOCIATION_ADDRESS, ASSOCIATION_LEGAL_FORM_SHORT } from '@/lib/association'
import { APPOINTMENT_TYPE_LABELS, libelleCategorie } from '@/lib/rendez-vous'

export const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`

// ─── Welcome Email ─────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(params: {
  to: string
  firstName: string
  formulaLabel: string
  amount: number
  frequency: 'once' | 'monthly'
}) {
  return resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Bienvenue dans l'association Afrique de l'Est et ses amis ! 🌍`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#FEFAF5;font-family:system-ui,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
          <div style="background:#E8702A;padding:24px;border-radius:16px 16px 0 0;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">🌍 Association Afrique de l'Est</h1>
            <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;">et ses amis</p>
          </div>
          <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <h2 style="color:#1A1A1A;font-size:20px;">Merci, ${escapeHtml(params.firstName)} ! 💚</h2>
            <p style="color:#4A4A4A;line-height:1.6;">
              Votre ${params.frequency === 'monthly' ? 'don mensuel' : 'don ponctuel'} de 
              <strong>${params.amount}€${params.frequency === 'monthly' ? '/mois' : ''}</strong> 
              (${params.formulaLabel}) est bien enregistré.
            </p>
            <p style="color:#4A4A4A;line-height:1.6;">
              Grâce à votre soutien, nous pouvons continuer à accompagner les familles 
              d'Afrique de l'Est dans leur intégration en France : cours de français (FLE), 
              aide à la jeunesse, accompagnement à l'emploi, et traduction.
            </p>
            <div style="background:#F5F0E8;padding:16px;border-radius:8px;margin:24px 0;">
              <p style="margin:0;color:#666;font-size:14px;">
                📄 Votre reçu fiscal (CERFA 11580*03) vous est envoyé par HelloAsso,
                à l'adresse email utilisée lors de votre paiement.
              </p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/espace-adherent" 
               style="display:inline-block;background:#E8702A;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px;">
              Accéder à mon espace adhérent →
            </a>
          </div>
          <p style="text-align:center;color:#999;font-size:12px;margin-top:16px;">
            ${ASSOCIATION_LEGAL_FORM_SHORT} — ${ASSOCIATION_ADDRESS}<br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/legal/confidentialite" style="color:#E8702A;">Politique de confidentialité</a>
          </p>
        </div>
      </body>
      </html>
    `,
  })
}

// Les reçus fiscaux CERFA sont édités et envoyés directement par HelloAsso,
// qui encaisse les paiements. L'association n'en émet pas en parallèle : deux
// reçus pour un même don exposeraient le donateur à une double déduction.

// ─── Appointment Confirmation Email ─────────────────────────────────────────────

export async function sendAppointmentConfirmation(params: {
  to: string
  name: string
  type: string
  startAt: string
}) {
  const typeLabel = APPOINTMENT_TYPE_LABELS[params.type] || params.type
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(params.startAt))

  return resend.emails.send({
    from: FROM,
    to: params.to,
    reply_to: process.env.NEXT_PUBLIC_ASSOCIATION_EMAIL || 'asso.afrique.est.et.ses.amis@outlook.fr',
    subject: `Confirmation de votre rendez-vous — Association Afrique de l'Est et ses amis`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#FEFAF5;font-family:system-ui,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
          <div style="background:#E8702A;padding:24px;border-radius:16px 16px 0 0;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;">📅 Rendez-vous confirmé</h1>
          </div>
          <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;">
            <p>Bonjour ${escapeHtml(params.name)},</p>
            <p>Votre rendez-vous est bien confirmé :</p>
            <div style="background:#F5F0E8;padding:16px;border-radius:8px;margin:16px 0;">
              <p style="margin:0 0 4px;color:#1A1A1A;"><strong>${escapeHtml(typeLabel)}</strong></p>
              <p style="margin:0;color:#4A4A4A;">${escapeHtml(formattedDate)}</p>
            </div>
            <p style="color:#666;font-size:14px;">
              Pour annuler ou modifier ce rendez-vous, répondez à cet email ou contactez-nous directement.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

// ─── Rappels de rendez-vous (la veille) ─────────────────────────────────────

const rappelDateFmt = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
})

/** Rappel d'un rendez-vous avec l'association. */
export async function sendAppointmentReminder(params: {
  to: string
  name: string
  type: string
  startAt: string
}) {
  const typeLabel = APPOINTMENT_TYPE_LABELS[params.type] || params.type

  return resend.emails.send({
    from: FROM,
    to: params.to,
    reply_to: process.env.NEXT_PUBLIC_ASSOCIATION_EMAIL || 'asso.afrique.est.et.ses.amis@outlook.fr',
    subject: `Rappel : votre rendez-vous demain`,
    html: `
      <p>Bonjour ${escapeHtml(params.name)},</p>
      <p>Petit rappel : vous avez rendez-vous avec nous demain.</p>
      <div style="background:#F5F0E8;padding:16px;border-radius:8px;margin:16px 0;">
        <p style="margin:0 0 4px;"><strong>${escapeHtml(typeLabel)}</strong></p>
        <p style="margin:0;color:#4A4A4A;">${escapeHtml(rappelDateFmt.format(new Date(params.startAt)))}</p>
      </div>
      <p style="color:#666;font-size:14px;">
        Si vous ne pouvez pas venir, prévenez-nous en répondant à cet email.
      </p>
    `,
  })
}

/**
 * Rappel d'un rendez-vous extérieur, enregistré par l'association.
 *
 * Ce message ne mentionne **jamais** la catégorie du rendez-vous : elle porte
 * la sensibilité (santé, préfecture), et un email reste lisible sur un écran
 * de téléphone posé sur une table. L'intitulé et la liste des pièces à
 * apporter suffisent — c'est d'ailleurs tout ce dont la personne a besoin.
 */
export async function sendExternalAppointmentReminder(params: {
  to: string
  name: string
  title: string
  startAt: string
  location?: string | null
  preparation?: string | null
}) {
  const preparationBloc = params.preparation
    ? `<div style="background:#FFF7ED;border:1px solid #FED7AA;padding:16px;border-radius:8px;margin:16px 0;">
         <p style="margin:0 0 6px;font-weight:600;color:#9A3412;">À apporter</p>
         <p style="margin:0;color:#7C2D12;white-space:pre-line;">${escapeHtml(params.preparation)}</p>
       </div>`
    : ''

  return resend.emails.send({
    from: FROM,
    to: params.to,
    reply_to: process.env.NEXT_PUBLIC_ASSOCIATION_EMAIL || 'asso.afrique.est.et.ses.amis@outlook.fr',
    subject: `Rappel : ${params.title} demain`,
    html: `
      <p>Bonjour ${escapeHtml(params.name)},</p>
      <p>Petit rappel de votre rendez-vous de demain :</p>
      <div style="background:#F5F0E8;padding:16px;border-radius:8px;margin:16px 0;">
        <p style="margin:0 0 4px;"><strong>${escapeHtml(params.title)}</strong></p>
        <p style="margin:0;color:#4A4A4A;">${escapeHtml(rappelDateFmt.format(new Date(params.startAt)))}</p>
        ${params.location ? `<p style="margin:4px 0 0;color:#4A4A4A;">${escapeHtml(params.location)}</p>` : ''}
      </div>
      ${preparationBloc}
      <p style="color:#666;font-size:14px;">
        Une question avant d'y aller ? Répondez à cet email, nous sommes là.
      </p>
      <p style="color:#999;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:16px;">
        Vous recevez ce rappel parce que vous avez autorisé l'association à suivre
        vos rendez-vous. Vous pouvez retirer cette autorisation à tout moment depuis
        votre espace adhérent.
      </p>
    `,
  })
}

// ─── Contact Confirmation Email ─────────────────────────────────────────────────

export async function sendContactConfirmation(params: {
  to: string
  name: string
  subject: string
}) {
  return resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Votre message a bien été reçu — Association Afrique de l'Est`,
    html: `
      <p>Bonjour ${escapeHtml(params.name)},</p>
      <p>Nous avons bien reçu votre message concernant : <strong>"${escapeHtml(params.subject)}"</strong>.</p>
      <p>Notre équipe vous répondra dans les meilleurs délais.</p>
      <p>Cordialement,<br>L'équipe de l'Association Afrique de l'Est et ses amis</p>
    `,
  })
}

// ─── Newsletter : désinscription ────────────────────────────────────────────

/**
 * Tout email de newsletter doit porter un moyen de se désinscrire (art. 21
 * RGPD, art. L34-5 CPCE). Le jeton est celui de l'inscription : il identifie la
 * ligne sans révéler l'adresse dans l'URL.
 */
export function buildUnsubscribeUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/api/newsletter/unsubscribe?token=${token}`
}

/**
 * En-têtes RFC 2369 / 8058 : ils font apparaître le bouton natif « Se
 * désabonner » de Gmail, Outlook et Apple Mail, en haut du message. C'est le
 * chemin que la plupart des destinataires empruntent réellement — et son
 * absence pousse à signaler le message comme spam.
 */
function unsubscribeHeaders(token: string) {
  return {
    'List-Unsubscribe': `<${buildUnsubscribeUrl(token)}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  }
}

/** Pied de page HTML rappelant le lien de désinscription. */
function unsubscribeFooter(token: string): string {
  return `
      <p style="color:#999;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:16px;">
        Vous recevez cet email parce que vous avez confirmé votre inscription à
        notre newsletter.
        <a href="${buildUnsubscribeUrl(token)}" style="color:#666;">Se désinscrire</a> ·
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/legal/confidentialite" style="color:#666;">Politique de confidentialité</a>
      </p>
  `
}

// ─── Newsletter Welcome ─────────────────────────────────────────────────────────

export async function sendNewsletterWelcome(params: {
  to: string
  firstName?: string
  unsubscribeToken: string
}) {
  return resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Bienvenue dans notre newsletter ! 🌍`,
    headers: unsubscribeHeaders(params.unsubscribeToken),
    html: `
      <p>Bonjour${params.firstName ? ` ${escapeHtml(params.firstName)}` : ''} !</p>
      <p>Votre inscription à la newsletter de l'Association Afrique de l'Est et ses amis est confirmée.</p>
      <p>Vous recevrez régulièrement nos actualités, nos événements et les témoignages de nos bénéficiaires.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}">Découvrir notre site →</a></p>
      ${unsubscribeFooter(params.unsubscribeToken)}
    `,
  })
}

// ─── Newsletter Confirmation (double opt-in) ────────────────────────────────

/**
 * Demande de confirmation d'inscription. Tant que le lien n'est pas cliqué,
 * l'adresse ne reçoit rien d'autre : c'est ce qui empêche d'abonner un tiers
 * à son insu et constitue la preuve de consentement attendue par le RGPD.
 */
export async function sendNewsletterConfirmation(params: {
  to: string
  firstName?: string
  confirmUrl: string
}) {
  return resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Confirmez votre inscription à notre newsletter`,
    html: `
      <p>Bonjour${params.firstName ? ` ${escapeHtml(params.firstName)}` : ''} !</p>
      <p>Une inscription à la newsletter de l'Association Afrique de l'Est et ses amis
      a été demandée avec cette adresse email.</p>
      <p>Pour la valider, cliquez sur le lien ci-dessous :</p>
      <p>
        <a href="${params.confirmUrl}"
           style="display:inline-block;background:#E8702A;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
          Confirmer mon inscription
        </a>
      </p>
      <p style="color:#666;font-size:14px;">
        Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce
        message : sans confirmation de votre part, aucune newsletter ne vous sera envoyée.
      </p>
    `,
  })
}
