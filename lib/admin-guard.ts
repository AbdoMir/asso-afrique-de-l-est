import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function requireStaff() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_staff')
    .eq('id', user.id)
    .single()

  if (!profile?.is_staff) {
    return { error: NextResponse.json({ error: 'Accès refusé' }, { status: 403 }) }
  }

  return { user }
}
