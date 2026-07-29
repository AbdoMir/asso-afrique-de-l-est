import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireStaff } from '@/lib/admin-guard'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireStaff()
  if (error) return error

  const { id } = await params
  const supabase = createAdminClient()

  const { error: updateError } = await supabase
    .from('appointment_bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
