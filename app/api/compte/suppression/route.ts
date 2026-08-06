import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'

/** Le client doit renvoyer ce mot exact : la suppression est irréversible. */
const CONFIRMATION_PHRASE = 'SUPPRIMER'

/**
 * Suppression du compte à la demande de l'adhérent (art. 17).
 *
 * L'effacement n'est volontairement pas total, et c'est l'art. 17.3.b qui
 * l'autorise : les dons et les reçus fiscaux CERFA relèvent d'une obligation
 * comptable de 6 ans. Ils sont donc conservés, mais **détachés** du compte —
 * `donations.user_id` et `fiscal_receipts.user_id` passent à NULL, et l'identité
 * strictement nécessaire au reçu est figée dans `archived_identity`.
 *
 * Tout le reste disparaît : compte d'authentification, profil, adhésions
 * (par cascade), documents et leurs fichiers, réservations, newsletter.
 */
export async function POST(request: NextRequest) {
  if (await isRateLimited(`compte-suppression:${getClientIp(request)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
      { status: 429 }
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)

  if (body?.confirmation !== CONFIRMATION_PHRASE) {
    return NextResponse.json(
      { error: 'Confirmation manquante ou incorrecte.' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  try {
    // 1. Figer l'identité sur les reçus fiscaux, avant de perdre le profil.
    const { data: receipts } = await admin
      .from('fiscal_receipts')
      .select('id')
      .eq('user_id', user.id)

    if (receipts && receipts.length > 0) {
      const { data: profile } = await admin
        .from('profiles')
        .select('first_name, last_name, email, address, zip_code, city, country')
        .eq('id', user.id)
        .maybeSingle()

      const archivedIdentity = {
        prenom: profile?.first_name ?? null,
        nom: profile?.last_name ?? null,
        email: profile?.email ?? user.email ?? null,
        adresse: profile?.address ?? null,
        code_postal: profile?.zip_code ?? null,
        ville: profile?.city ?? null,
        pays: profile?.country ?? null,
        archive_le: new Date().toISOString(),
        motif: 'Suppression du compte à la demande de la personne (art. 17 RGPD)',
      }

      const { error: archiveError } = await admin
        .from('fiscal_receipts')
        .update({ archived_identity: archivedIdentity })
        .eq('user_id', user.id)

      // Sans cet archivage, la suppression rendrait des pièces comptables
      // obligatoires inexploitables : on interrompt plutôt que de continuer.
      if (archiveError) throw archiveError
    }

    // 2. Fichiers déposés : les lignes tomberaient en cascade, mais les objets
    //    de stockage, eux, survivraient au compte.
    const { data: documents } = await admin
      .from('member_documents')
      .select('storage_path')
      .eq('user_id', user.id)

    if (documents && documents.length > 0) {
      const { error: storageError } = await admin.storage
        .from('member-documents')
        .remove(documents.map((doc) => doc.storage_path))

      if (storageError) throw storageError
    }

    // 3. Réservations de rendez-vous : leur FK est en `set null`, elles
    //    resteraient sinon en base sans rattachement ni utilité.
    const { error: bookingsError } = await admin
      .from('appointment_bookings')
      .delete()
      .eq('user_id', user.id)

    if (bookingsError) throw bookingsError

    // 4. Newsletter : rattachée à l'email, pas au compte.
    if (user.email) {
      const { error: newsletterError } = await admin
        .from('newsletter_subscribers')
        .delete()
        .eq('email', user.email)

      if (newsletterError) throw newsletterError
    }

    // 5. Le compte d'authentification. La cascade emporte le profil, les
    //    adhésions et les lignes de documents ; les dons et reçus fiscaux
    //    passent en `user_id NULL` et sont conservés (obligation comptable).
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)

    if (deleteError) throw deleteError
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'La suppression a échoué. Aucune donnée n\'a été perdue, contactez-nous.' },
      { status: 500 }
    )
  }

  // Le compte n'existe plus : la session restante doit être invalidée côté
  // navigateur, sinon l'interface continue d'afficher un espace adhérent vide.
  await supabase.auth.signOut()

  return NextResponse.json({ success: true })
}
