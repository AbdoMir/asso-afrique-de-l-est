import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/admin-guard'
import { logAccess } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/**
 * Rendez-vous extérieurs des adhérents, saisis par le personnel.
 *
 * Ces données relèvent de l'art. 9 : un rendez-vous médical est une donnée de
 * santé, un rendez-vous en préfecture révèle une situation administrative. Deux
 * conséquences dans ce fichier — chaque accès est journalisé, et aucune saisie
 * n'est possible sans le consentement explicite de la personne, vérifié ici
 * puis à nouveau par un trigger en base.
 */

const creationSchema = z.object({
  userId: z.string().uuid(),
  category: z.enum([
    'prefecture',
    'sante',
    'caf',
    'france_travail',
    'logement',
    'ecole',
    'justice',
    'autre',
  ]),
  title: z.string().trim().min(2).max(120),
  startsAt: z.string().datetime({ offset: true }),
  location: z.string().trim().max(200).optional(),
  preparation: z.string().trim().max(1000).optional(),
})

/**
 * Recherche un adhérent par email, ou liste ses rendez-vous extérieurs.
 *
 * La recherche est volontairement exacte : une recherche partielle
 * transformerait cette route en annuaire des adhérents.
 */
export async function GET(request: NextRequest) {
  const { error, user } = await requireStaff(request)
  if (error) return error

  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase()
  const userId = request.nextUrl.searchParams.get('userId')

  const supabase = createAdminClient()

  if (email) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, external_appointments_consent, external_appointments_consent_at')
      .eq('email', email)
      .maybeSingle()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    if (!profile) {
      return NextResponse.json({ profile: null, appointments: [] })
    }

    const { data: appointments } = await supabase
      .from('external_appointments')
      .select('*')
      .eq('user_id', profile.id)
      .order('starts_at', { ascending: true })

    await logAccess({
      actorId: user?.id,
      actorEmail: user?.email,
      actorRole: 'staff',
      action: 'external_appointment.list',
      resourceType: 'profiles',
      resourceId: profile.id,
      metadata: { nombre: appointments?.length ?? 0 },
      request,
    })

    return NextResponse.json({ profile, appointments: appointments ?? [] })
  }

  if (userId) {
    const { data: appointments, error: listError } = await supabase
      .from('external_appointments')
      .select('*')
      .eq('user_id', userId)
      .order('starts_at', { ascending: true })

    if (listError) return NextResponse.json({ error: listError.message }, { status: 500 })

    // Journalisé au même titre que la recherche par email : les deux branches
    // renvoient des données de l'art. 9, et un chemin de lecture qui ne laisse
    // pas de trace vaut, pour un contrôle, comme s'il n'existait pas.
    await logAccess({
      actorId: user?.id,
      actorEmail: user?.email,
      actorRole: 'staff',
      action: 'external_appointment.list',
      resourceType: 'profiles',
      resourceId: userId,
      metadata: { nombre: appointments?.length ?? 0 },
      request,
    })

    return NextResponse.json({ appointments: appointments ?? [] })
  }

  return NextResponse.json({ error: 'Précisez un email ou un identifiant.' }, { status: 400 })
}

export async function POST(request: NextRequest) {
  const { error, user } = await requireStaff(request)
  if (error) return error

  const body = await request.json().catch(() => null)
  const validated = creationSchema.safeParse(body)

  if (!validated.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: validated.error.flatten() },
      { status: 400 }
    )
  }

  const { userId, category, title, startsAt, location, preparation } = validated.data
  const supabase = createAdminClient()

  // Première barrière : on veut un message clair pour le personnel plutôt que
  // l'erreur brute du trigger. La seconde barrière, elle, est en base.
  const { data: profile } = await supabase
    .from('profiles')
    .select('external_appointments_consent')
    .eq('id', userId)
    .maybeSingle()

  if (!profile) {
    return NextResponse.json({ error: 'Adhérent introuvable.' }, { status: 404 })
  }

  if (!profile.external_appointments_consent) {
    return NextResponse.json(
      {
        error:
          "Cet adhérent n'a pas encore autorisé le suivi de ses rendez-vous. " +
          'Il peut le faire depuis son espace adhérent, onglet Profil.',
      },
      { status: 403 }
    )
  }

  const { data: appointment, error: insertError } = await supabase
    .from('external_appointments')
    .insert({
      user_id: userId,
      category,
      title,
      starts_at: startsAt,
      location: location || null,
      preparation: preparation || null,
      created_by: user?.id ?? null,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Création de rendez-vous extérieur impossible:', insertError)
    return NextResponse.json(
      { error: "Impossible d'enregistrer ce rendez-vous." },
      { status: 500 }
    )
  }

  // La catégorie est journalisée, jamais le titre ni la préparation : un
  // journal qui recopierait le contenu qu'il surveille doublerait l'exposition.
  await logAccess({
    actorId: user?.id,
    actorEmail: user?.email,
    actorRole: 'staff',
    action: 'external_appointment.create',
    resourceType: 'external_appointments',
    resourceId: appointment.id,
    metadata: { category, pour_adherent: userId },
    request,
  })

  return NextResponse.json({ success: true, appointment })
}
