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
  documents_adherents: number
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
    documents_adherents: 0,
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

    // ─── Documents adhérents ────────────────────────────────────────────────
    // Les plus sensibles du lot. Les fichiers sont retirés du stockage avant
    // les lignes : l'inverse laisserait des objets orphelins que plus rien ne
    // référence, donc que plus rien ne viendrait supprimer.
    const documentsCutoff = cutoffMonthsAgo(RETENTION_MONTHS.memberDocuments).toISOString()

    const { data: expiredDocuments, error: documentsSelectError } = await supabase
      .from('member_documents')
      .select('id, storage_path')
      .lt('created_at', documentsCutoff)

    if (documentsSelectError) throw documentsSelectError

    if (expiredDocuments && expiredDocuments.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('member-documents')
        .remove(expiredDocuments.map((doc) => doc.storage_path))

      if (storageError) throw storageError

      const { error: documentsDeleteError } = await supabase
        .from('member_documents')
        .delete()
        .in('id', expiredDocuments.map((doc) => doc.id))

      if (documentsDeleteError) throw documentsDeleteError

      report.documents_adherents = expiredDocuments.length
    }
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
