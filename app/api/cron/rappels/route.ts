import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  sendAppointmentReminder,
  sendExternalAppointmentReminder,
} from '@/lib/resend/emails'

/**
 * Rappels de rendez-vous, envoyés la veille.
 *
 * C'est le service que l'association rend vraiment : les familles qu'elle
 * accompagne ne manquent pas leurs rendez-vous par négligence, mais parce que
 * les convocations arrivent en français administratif et se perdent.
 *
 * Déclenchée par le cron Vercel (vercel.json) le matin — un rappel se lit au
 * réveil, pas à 3 h.
 */

export const dynamic = 'force-dynamic'

/** Bornes de la journée de demain. */
function fenetreDemain() {
  const debut = new Date()
  debut.setDate(debut.getDate() + 1)
  debut.setHours(0, 0, 0, 0)

  const fin = new Date(debut)
  fin.setHours(23, 59, 59, 999)

  return { debut: debut.toISOString(), fin: fin.toISOString() }
}

type Destinataire = { prenom: string; email: string }

/**
 * Charge prénom et email des adhérents concernés.
 *
 * Les jointures Supabase ne sont pas typées ici — le type `Database` est écrit
 * à la main et ne déclare aucune relation. On récupère donc les profils en une
 * requête séparée, comme le fait déjà l'espace adhérent pour les créneaux.
 */
async function chargerProfils(
  supabase: ReturnType<typeof createAdminClient>,
  userIds: string[]
): Promise<Map<string, Destinataire>> {
  const identifiants = [...new Set(userIds)]
  if (identifiants.length === 0) return new Map()

  const { data } = await supabase
    .from('profiles')
    .select('id, first_name, email')
    .in('id', identifiants)

  return new Map(
    (data ?? []).map((p) => [p.id, { prenom: p.first_name || 'Bonjour', email: p.email }])
  )
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('CRON_SECRET absent : rappels refusés.')
    return NextResponse.json({ error: 'Non configuré' }, { status: 503 })
  }

  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { debut, fin } = fenetreDemain()
  const rapport = { association: 0, exterieurs: 0, echecs: 0 }

  try {
    // ─── Rendez-vous avec l'association ─────────────────────────────────────
    const { data: creneaux } = await supabase
      .from('appointment_slots')
      .select('id, type, start_at')
      .gte('start_at', debut)
      .lte('start_at', fin)

    if (creneaux && creneaux.length > 0) {
      const { data: reservations } = await supabase
        .from('appointment_bookings')
        .select('id, slot_id, user_id, guest_name, guest_email')
        .in('slot_id', creneaux.map((c) => c.id))
        .eq('status', 'confirmed')
        .is('reminder_sent_at', null)

      const creneauxParId = new Map(creneaux.map((c) => [c.id, c]))
      const profils = await chargerProfils(
        supabase,
        (reservations ?? []).map((r) => r.user_id).filter((id): id is string => Boolean(id))
      )

      for (const reservation of reservations ?? []) {
        const creneau = creneauxParId.get(reservation.slot_id)
        if (!creneau) continue

        const profil = reservation.user_id ? profils.get(reservation.user_id) : undefined
        const destinataire = profil?.email || reservation.guest_email
        const prenom = profil?.prenom || reservation.guest_name || 'Bonjour'

        if (!destinataire) continue

        const { error } = await sendAppointmentReminder({
          to: destinataire,
          name: prenom,
          type: creneau.type,
          startAt: creneau.start_at,
        })

        if (error) {
          console.error('Rappel association échoué:', error)
          rapport.echecs++
          continue
        }

        // Horodaté seulement après un envoi réussi : un échec réseau ne doit
        // pas priver définitivement la personne de son rappel.
        await supabase
          .from('appointment_bookings')
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq('id', reservation.id)

        rapport.association++
      }
    }

    // ─── Rendez-vous extérieurs ─────────────────────────────────────────────
    const { data: exterieurs } = await supabase
      .from('external_appointments')
      .select('id, user_id, title, starts_at, location, preparation')
      .gte('starts_at', debut)
      .lte('starts_at', fin)
      .is('reminder_sent_at', null)

    const profilsExterieurs = await chargerProfils(
      supabase,
      (exterieurs ?? []).map((r) => r.user_id)
    )

    for (const rdv of exterieurs ?? []) {
      const profil = profilsExterieurs.get(rdv.user_id)
      if (!profil?.email) continue

      const { error } = await sendExternalAppointmentReminder({
        to: profil.email,
        name: profil.prenom,
        title: rdv.title,
        startAt: rdv.starts_at,
        location: rdv.location,
        preparation: rdv.preparation,
      })

      if (error) {
        console.error('Rappel extérieur échoué:', error)
        rapport.echecs++
        continue
      }

      await supabase
        .from('external_appointments')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', rdv.id)

      rapport.exterieurs++
    }
  } catch (error) {
    console.error('Envoi des rappels échoué:', error)
    return NextResponse.json({ error: 'Envoi des rappels échoué', rapport }, { status: 500 })
  }

  console.log('Rappels envoyés:', rapport)

  return NextResponse.json({ success: true, execute_le: new Date().toISOString(), rapport })
}
