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
                📄 Votre reçu fiscal (CERFA 11580*03) vous sera envoyé chaque janvier pour 
                l'ensemble de vos dons de l'année.
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

// ─── Fiscal Receipt Email ───────────────────────────────────────────────────────

export async function sendFiscalReceiptEmail(params: {
  to: string
  firstName: string
  year: number
  totalAmount: number
  pdfUrl: string
}) {
  return resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Votre reçu fiscal ${params.year} — Association Afrique de l'Est et ses amis`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#FEFAF5;font-family:system-ui,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
          <div style="background:#2D7D46;padding:24px;border-radius:16px 16px 0 0;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;">📄 Reçu fiscal ${params.year}</h1>
          </div>
          <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;">
            <p>Bonjour ${escapeHtml(params.firstName)},</p>
            <p>Vous trouverez ci-joint votre reçu fiscal (CERFA 11580*03) pour vos dons
            effectués en ${params.year}, soit un total de <strong>${params.totalAmount}€</strong>.</p>
            <p>Ce document vous permet de déduire <strong>66% de vos dons</strong> de votre 
            impôt sur le revenu (dans la limite de 20% du revenu imposable).</p>
            <a href="${params.pdfUrl}" 
               style="display:inline-block;background:#2D7D46;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
              📥 Télécharger le reçu CERFA
            </a>
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
      <p>Vous êtes maintenant inscrit(e) à la newsletter de l'Association Afrique de l'Est et ses amis.</p>
      <p>Vous recevrez régulièrement nos actualités, nos événements et les témoignages de nos bénéficiaires.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}">Découvrir notre site →</a></p>
    `,
  })
}
