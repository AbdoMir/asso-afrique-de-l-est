import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { genererRecuCerfa } from '@/lib/cerfa/receipt'
import { sendTaxReceipt } from '@/lib/resend/emails'

/**
 * Émission annuelle des reçus fiscaux.
 *
 * Un reçu par donateur et par exercice, couvrant le total de l'année — c'est
 * la pratique courante des associations, et c'est déjà ce que le site
 * annonce : « reçu fiscal automatique chaque janvier ». La contrainte
 * `unique (user_id, year)` de `fiscal_receipts` l'impose d'ailleurs en base.
 *
 * HelloAsso s'en chargeait auparavant. Depuis le passage à Stripe, qui
 * encaisse mais n'établit aucun document fiscal français, la tâche revient à
 * l'association : c'est ici qu'elle s'exécute.
 *
 * Déclenchée par le cron Vercel à la mi-janvier, bien avant la campagne de
 * déclaration des revenus. Rejouable sans risque : un reçu déjà émis n'est pas
 * réémis, sans quoi un donateur déduirait deux fois.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 300

type LigneDon = {
  id: string
  user_id: string | null
  amount: number
  donor_name: string | null
  donor_email: string | null
  donor_address: string | null
  donor_city: string | null
  donor_zip_code: string | null
  created_at: string
}

type Cumul = {
  userId: string
  donationIds: string[]
  total: number
  /** Identité portée par le versement le plus récent de l'exercice. */
  nom?: string
  email?: string
  adresse?: string
}

function composerAdresse(don: LigneDon): string | undefined {
  const parties = [
    don.donor_address,
    [don.donor_zip_code, don.donor_city].filter(Boolean).join(' '),
  ].filter((partie) => partie && partie.trim())

  return parties.length ? parties.join(', ') : undefined
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('CRON_SECRET absent : émission des reçus refusée.')
    return NextResponse.json({ error: 'Non configuré' }, { status: 503 })
  }

  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // L'exercice est l'année écoulée. Le paramètre `annee` permet de rejouer un
  // exercice antérieur à la main, sans attendre le janvier suivant.
  const parametreAnnee = request.nextUrl.searchParams.get('annee')
  const annee = parametreAnnee ? Number(parametreAnnee) : new Date().getFullYear() - 1

  if (!Number.isInteger(annee) || annee < 2025 || annee > new Date().getFullYear()) {
    return NextResponse.json({ error: 'Exercice invalide' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const rapport = { emis: 0, deja_emis: 0, sans_compte: 0, identite_incomplete: 0, echecs: 0 }

  try {
    const { data: dons, error } = await supabase
      .from('donations')
      .select(
        'id, user_id, amount, donor_name, donor_email, donor_address, donor_city, donor_zip_code, created_at'
      )
      .eq('status', 'succeeded')
      .gte('created_at', `${annee}-01-01T00:00:00Z`)
      .lt('created_at', `${annee + 1}-01-01T00:00:00Z`)
      .order('created_at', { ascending: true })

    if (error) throw error

    // ─── Cumul par donateur ──────────────────────────────────────────────────
    const cumuls = new Map<string, Cumul>()

    for (const don of (dons ?? []) as unknown as LigneDon[]) {
      // Un don non rattaché à un compte ne peut pas donner lieu à un reçu
      // automatique : ni destinataire fiable, ni espace où le consulter. Ils
      // sont comptés pour que l'association les traite à la main.
      if (!don.user_id) {
        rapport.sans_compte += 1
        continue
      }

      const cumul = cumuls.get(don.user_id) ?? {
        userId: don.user_id,
        donationIds: [],
        total: 0,
      }

      cumul.donationIds.push(don.id)
      cumul.total += Number(don.amount)

      // Les dons arrivent du plus ancien au plus récent : la dernière écriture
      // l'emporte, et le reçu porte donc l'adresse la plus récente de l'exercice.
      cumul.nom = don.donor_name ?? cumul.nom
      cumul.email = don.donor_email ?? cumul.email
      cumul.adresse = composerAdresse(don) ?? cumul.adresse

      cumuls.set(don.user_id, cumul)
    }

    if (cumuls.size === 0) {
      return NextResponse.json({ annee, ...rapport, message: 'Aucun don à traiter' })
    }

    // ─── Profils, pour compléter ce que les dons ne portent pas ──────────────
    const { data: profils } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, address, city, zip_code')
      .in('id', [...cumuls.keys()])

    const parId = new Map((profils ?? []).map((p) => [p.id, p]))

    // ─── Émission ────────────────────────────────────────────────────────────
    for (const cumul of cumuls.values()) {
      try {
        const { data: existant } = await supabase
          .from('fiscal_receipts')
          .select('id')
          .eq('user_id', cumul.userId)
          .eq('year', annee)
          .maybeSingle()

        if (existant) {
          rapport.deja_emis += 1
          continue
        }

        const profil = parId.get(cumul.userId)

        const nom =
          cumul.nom ||
          [profil?.first_name, profil?.last_name].filter(Boolean).join(' ') ||
          undefined

        const email = cumul.email || profil?.email || undefined

        const adresseProfil = [
          profil?.address,
          [profil?.zip_code, profil?.city].filter(Boolean).join(' '),
        ]
          .filter((partie) => partie && String(partie).trim())
          .join(', ')

        const adresse = cumul.adresse || adresseProfil || undefined

        // Un reçu sans identité ni adresse serait irrégulier : mieux vaut ne
        // pas l'émettre et le signaler que produire une pièce contestable.
        if (!nom || !email || !adresse) {
          rapport.identite_incomplete += 1
          console.warn(
            `Reçu ${annee} non émis pour ${cumul.userId} : identité ou adresse incomplète.`
          )
          continue
        }

        const { data: numero, error: numeroError } = await supabase.rpc('next_cerfa_number', {
          annee,
        })

        if (numeroError || !numero) throw numeroError ?? new Error('Numéro non attribué')

        const cerfaNumber = numero as unknown as string

        const { data: recu, error: insertError } = await supabase
          .from('fiscal_receipts')
          .insert({
            user_id: cumul.userId,
            donation_ids: cumul.donationIds,
            year: annee,
            total_amount: cumul.total,
            cerfa_number: cerfaNumber,
          })
          .select('id')
          .single()

        if (insertError) throw insertError

        const pdf = await genererRecuCerfa({
          receiptNumber: cerfaNumber,
          donorName: nom,
          donorAddress: adresse,
          fiscalYear: annee,
          totalAmount: cumul.total,
          issuedAt: new Date(),
        })

        const { error: emailError } = await sendTaxReceipt({
          to: email,
          firstName: profil?.first_name ?? undefined,
          year: annee,
          amount: cumul.total,
          cerfaNumber,
          pdf,
        })

        // Le reçu existe même si l'email échoue : il reste téléchargeable
        // depuis l'espace adhérent. `sent_at` distingue les deux cas, pour que
        // l'association sache à qui renvoyer.
        if (emailError) {
          console.error(`Envoi du reçu ${cerfaNumber} échoué :`, emailError)
        } else {
          await supabase
            .from('fiscal_receipts')
            .update({ sent_at: new Date().toISOString() })
            .eq('id', recu.id)
        }

        rapport.emis += 1
      } catch (err) {
        rapport.echecs += 1
        console.error(`Reçu ${annee} : échec pour ${cumul.userId}`, err)
      }
    }

    return NextResponse.json({ annee, ...rapport })
  } catch (error) {
    console.error('Émission des reçus fiscaux : échec global', error)
    return NextResponse.json({ error: 'Traitement impossible' }, { status: 500 })
  }
}
