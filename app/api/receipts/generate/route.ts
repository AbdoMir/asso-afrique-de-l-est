import { NextRequest, NextResponse } from 'next/server'
import { generateReceiptPdf } from '@/lib/receipts'
import { createClient } from '@/lib/supabase/server'
import { generateCerfaNumber } from '@/lib/utils'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  if (await isRateLimited(`receipts-generate:${getClientIp(request)}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ success: false, error: 'Trop de requêtes. Veuillez réessayer plus tard.' }, { status: 429 })
  }

  const searchParams = request.nextUrl.searchParams
  const yearStr = searchParams.get('year')

  if (!yearStr) {
    return NextResponse.json({ success: false, error: 'Année requise' }, { status: 400 })
  }

  const year = parseInt(yearStr, 10)
  if (isNaN(year)) {
    return NextResponse.json({ success: false, error: 'Année invalide' }, { status: 400 })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ success: false, error: 'Service indisponible' }, { status: 503 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const startDate = `${year}-01-01T00:00:00Z`
  const endDate = `${year}-12-31T23:59:59Z`

  const { data: donations } = await supabase
    .from('donations')
    .select('id, amount')
    .eq('user_id', user.id)
    .eq('status', 'succeeded')
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  let totalAmount = 0
  if (donations && donations.length > 0) {
    totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0)
  }

  if (totalAmount <= 0) {
    return NextResponse.json({ 
      success: false, 
      error: `Aucun don enregistré en ${year} pour cet utilisateur.` 
    }, { status: 404 })
  }

  // 3. Generate receipt
  try {
    const cerfaNumber = generateCerfaNumber(year, Math.floor(Math.random() * 1000) + 1)
    const donorName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Donateur Anonyme'
    const donorAddress = `${profile?.address || ''}, ${profile?.zip_code || ''} ${profile?.city || ''}, ${profile?.country || 'FR'}`

    const pdfBytes = await generateReceiptPdf({
      cerfaNumber,
      donorName,
      donorAddress,
      totalAmount,
      year,
      date: new Date().toLocaleDateString('fr-FR'),
      associationName: process.env.NEXT_PUBLIC_ASSOCIATION_NAME,
      associationAddress: process.env.NEXT_PUBLIC_ASSOCIATION_ADDRESS,
      associationSiret: process.env.NEXT_PUBLIC_ASSOCIATION_SIRET,
      associationRna: process.env.NEXT_PUBLIC_RNA,
    })

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="recu_fiscal_${year}_aes.pdf"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (pdfErr: any) {
    console.error('PDF Generation failed:', pdfErr)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la génération du PDF' 
    }, { status: 500 })
  }
}
