import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // RLS limite déjà cette requête au document de l'utilisateur connecté.
  const { data: doc, error: fetchError } = await supabase
    .from('member_documents')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (fetchError || !doc) {
    return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })
  }

  await supabase.storage.from('member-documents').remove([doc.storage_path])

  const { error: deleteError } = await supabase
    .from('member_documents')
    .delete()
    .eq('id', id)

  if (deleteError) {
    console.error('Document delete error:', deleteError)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du document.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
