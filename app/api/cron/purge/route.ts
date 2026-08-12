import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  RETENTION_MONTHS,
  RETENTION_DAYS,
  cutoffMonthsAgo,
  cutoffDaysAgo,
} from '@/lib/retention'

/**
 * Purge quotidienne des données arrivées au terme de leur conservation.
 *
 * Le RGPD n'impose pas seulement d'annoncer des durées (art. 13), il impose de
 * les appliquer (art. 5.1.e). Une politique de confidentialité qui promet une
 * suppression que rien n'exécute est un manquement à elle seule.
 *
 * Déclenchée par le cron Vercel défini dans vercel.json. Les durées viennent de
 * lib/retention.ts, qui fait foi.
 */

// La purge dépend de la date d'exécution : jamais de mise en cache.
export const dynamic = 'force-dynamic'

interface PurgeReport {
  messages_contact: number
  creneaux_rendez_vous: number
  inscriptions_non_confirmees: number
  journal_acces: number
  rendez_vous_exterieurs: number
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET

  // Sans secret configuré, la route resterait ouverte à tous : on préfère
  // qu'elle refuse tout plutôt que d'exposer une commande de suppression.
  if (!cronSecret) {
    console.error('CRON_SECRET absent : purge refusée.')
    return NextResponse.json({ error: 'Non configuré' }, { status: 503 })
  }

  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const report: PurgeReport = {
    messages_contact: 0,
    creneaux_rendez_vous: 0,
    inscriptions_non_confirmees: 0,
    journal_acces: 0,
    rendez_vous_exterieurs: 0,
  }

  try {
    // ─── Messages de contact ────────────────────────────────────────────────
    const { data: messages, error: messagesError } = await supabase
      .from('contact_messages')
      .delete()
      .lt('created_at', cutoffMonthsAgo(RETENTION_MONTHS.contactMessages).toISOString())
      .select('id')

    if (messagesError) throw messagesError
    report.messages_contact = messages?.length ?? 0

    // ─── Créneaux de rendez-vous passés ─────────────────────────────────────
    // La suppression cascade sur appointment_bookings : les réservations, et
    // donc les notes libres saisies par les personnes, partent avec.
    const { data: slots, error: slotsError } = await supabase
      .from('appointment_slots')
      .delete()
      .lt('start_at', cutoffMonthsAgo(RETENTION_MONTHS.appointmentSlots).toISOString())
      .select('id')

    if (slotsError) throw slotsError
    report.creneaux_rendez_vous = slots?.length ?? 0

    // ─── Inscriptions newsletter jamais confirmées ──────────────────────────
    // Sans clic sur le lien, aucun consentement n'a été donné : conserver
    // l'adresse plus longtemps n'aurait aucune base légale.
    const { data: pending, error: pendingError } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('confirmed', false)
      .lt('created_at', cutoffDaysAgo(RETENTION_DAYS.unconfirmedNewsletter).toISOString())
      .select('id')

    if (pendingError) throw pendingError
    report.inscriptions_non_confirmees = pending?.length ?? 0

    // ─── Journal des accès ──────────────────────────────────────────────────
    // Un journal conservé indéfiniment cesse d'être un outil de sécurité pour
    // devenir un fichier de surveillance des bénévoles.
    const { data: journal, error: journalError } = await supabase
      .from('audit_log')
      .delete()
      .lt('created_at', cutoffMonthsAgo(RETENTION_MONTHS.auditLog).toISOString())
      .select('id')

    if (journalError) throw journalError
    report.journal_acces = journal?.length ?? 0

    // ─── Rendez-vous extérieurs ─────────────────────────────────────────────
    // Données de l'art. 9 : passé le délai, l'association n'a plus de raison de
    // savoir que telle personne avait rendez-vous à l'hôpital tel jour.
    const { data: exterieurs, error: exterieursError } = await supabase
      .from('external_appointments')
      .delete()
      .lt('starts_at', cutoffMonthsAgo(RETENTION_MONTHS.externalAppointments).toISOString())
      .select('id')

    if (exterieursError) throw exterieursError
    report.rendez_vous_exterieurs = exterieurs?.length ?? 0
  } catch (error) {
    console.error('Purge error:', error)
    return NextResponse.json(
      { error: 'La purge a échoué', report },
      { status: 500 }
    )
  }

  console.log('Purge RGPD effectuée:', report)

  return NextResponse.json({
    success: true,
    execute_le: new Date().toISOString(),
    supprime: report,
  })
}
