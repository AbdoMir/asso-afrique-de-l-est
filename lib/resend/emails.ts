import { Resend } from 'resend'
import { escapeHtml } from '@/lib/utils'

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
            Association loi 1901 — ${process.env.NEXT_PUBLIC_ASSOCIATION_ADDRESS}<br>
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

const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  administratif: 'Accompagnement administratif',
  fle_atelier: 'Cours de FLE / Atelier',
  autre: 'Rendez-vous général',
}

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

// ─── Newsletter Welcome ─────────────────────────────────────────────────────────

export async function sendNewsletterWelcome(params: {
  to: string
  firstName?: string
}) {
  return resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Bienvenue dans notre newsletter ! 🌍`,
    html: `
      <p>Bonjour${params.firstName ? ` ${escapeHtml(params.firstName)}` : ''} !</p>
      <p>Votre inscription à la newsletter de l'Association Afrique de l'Est et ses amis est confirmée.</p>
      <p>Vous recevrez régulièrement nos actualités, nos événements et les témoignages de nos bénéficiaires.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}">Découvrir notre site →</a></p>
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
