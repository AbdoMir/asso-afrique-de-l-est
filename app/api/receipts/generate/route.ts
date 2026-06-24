import { NextRequest, NextResponse } from 'next/server'
import { generateReceiptPdf } from '@/lib/receipts'
import { createClient } from '@/lib/supabase/server'
import { generateCerfaNumber } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const yearStr = searchParams.get('year')
  
  if (!yearStr) {
    return NextResponse.json({ success: false, error: 'Année requise' }, { status: 400 })
  }

  const year = parseInt(yearStr, 10)
  if (isNaN(year)) {
    return NextResponse.json({ success: false, error: 'Année invalide' }, { status: 400 })
  }

  // 1. Attempt to get Supabase client and authenticating user
  let isMock = true
  let user: any = null
  let profile: any = null
  let totalAmount = 0
  let donationIds: string[] = []

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient()
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      if (supabaseUser) {
        user = supabaseUser
        isMock = false
        
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        profile = profileData

        // Fetch user donations for the specified year
        const startDate = `${year}-01-01T00:00:00Z`
        const endDate = `${year}-12-31T23:59:59Z`

        const { data: donations } = await supabase
          .from('donations')
          .select('id, amount')
          .eq('user_id', user.id)
          .eq('status', 'succeeded')
          .gte('created_at', startDate)
          .lte('created_at', endDate)

        if (donations && donations.length > 0) {
          totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0)
          donationIds = donations.map((d) => d.id)
        }
      }
    }
  } catch (err) {
    console.error('Supabase fetch failed in receipt API, falling back to mock:', err)
  }

  // 2. Mock mode if user not authenticated or database not configured
  if (isMock) {
    // We try to read mock user info if any, otherwise default
    profile = {
      first_name: 'Abdoulaye',
      last_name: 'Diallo',
      address: '15 Rue de la Solidarité',
      city: 'Paris',
      zip_code: '75019',
      country: 'FR',
      email: 'member.demo@example.com'
    }
    // Hardcoded mock amounts based on year
    totalAmount = year === 2026 ? 120.0 : year === 2025 ? 240.0 : 60.0
    donationIds = ['mock-don-1', 'mock-don-2']
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
