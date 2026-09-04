import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { genererRecuCerfa } from '@/lib/cerfa/receipt'

/**
 * Téléchargement d'un reçu fiscal depuis l'espace adhérent.
 *
 * Le PDF n'est pas récupéré : il est **reconstruit**. Le bureau a supprimé
 * tout dépôt de fichiers en août 2026 (migration 014), au motif qu'une donnée
 * non détenue ne peut ni fuiter, ni être réclamée, ni traîner dans une
 * sauvegarde. Le rendu étant déterministe — mêmes données, même document —
 * conserver le fichier n'apporterait qu'un risque.
 *
 * L'identité qui figure sur le reçu vient des dons qu'il agrège, jamais du
 * profil courant : une pièce comptable ne doit pas changer parce que la
 * personne a déménagé depuis.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type LigneDon = {
  donor_name: string | null
  donor_address: string | null
  donor_city: string | null
  donor_zip_code: string | null
  created_at: string
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // La politique RLS de `fiscal_receipts` limite déjà la lecture aux reçus de
  // la personne connectée : un identifiant deviné ne renvoie rien.
  const { data: recu } = await supabase
    .from('fiscal_receipts')
    .select('id, cerfa_number, year, total_amount, donation_ids, created_at')
    .eq('id', id)
    .maybeSingle()

  if (!recu) {
    return NextResponse.json({ error: 'Reçu introuvable' }, { status: 404 })
  }

  // Identité au moment des versements, reprise du don le plus récent de
  // l'exercice — c'est celle qui figurait sur le reçu à son émission.
  const { data: dons } = await supabase
    .from('donations')
    .select('donor_name, donor_address, donor_city, donor_zip_code, created_at')
    .in('id', recu.donation_ids)
    .order('created_at', { ascending: false })

  const dernier = (dons ?? [])[0] as unknown as LigneDon | undefined

  const { data: profil } = await supabase
    .from('profiles')
    .select('first_name, last_name, address, city, zip_code')
    .eq('id', user.id)
    .maybeSingle()

  const nom =
    dernier?.donor_name ||
    [profil?.first_name, profil?.last_name].filter(Boolean).join(' ') ||
    'Donateur'

  const adresse =
    [
      dernier?.donor_address ?? profil?.address,
      [dernier?.donor_zip_code ?? profil?.zip_code, dernier?.donor_city ?? profil?.city]
        .filter(Boolean)
        .join(' '),
    ]
      .filter((partie) => partie && String(partie).trim())
      .join(', ') || 'Adresse non renseignée'

  const pdf = await genererRecuCerfa({
    receiptNumber: recu.cerfa_number,
    donorName: nom,
    donorAddress: adresse,
    fiscalYear: recu.year,
    totalAmount: Number(recu.total_amount),
    issuedAt: new Date(recu.created_at),
  })

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="recu-fiscal-${recu.cerfa_number}.pdf"`,
      // Un reçu fiscal ne doit pas traîner dans un cache partagé.
      'Cache-Control': 'private, no-store',
    },
  })
}
