import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAllowedDocument, MAX_DOCUMENT_SIZE_BYTES } from '@/lib/file-validation'
import { getClientIp, isRateLimited } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  if (await isRateLimited(`documents-upload:${getClientIp(request)}`, 10, 10 * 60 * 1000)) {
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

  const formData = await request.formData()
  const file = formData.get('file')
  const label = formData.get('label')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
  }

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'Le fichier dépasse la taille maximale autorisée (10 Mo).' },
      { status: 400 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const { valid, mimeType } = isAllowedDocument(buffer)

  if (!valid || !mimeType) {
    return NextResponse.json(
      { error: 'Type de fichier non autorisé. Formats acceptés : PDF, JPEG, PNG, WEBP.' },
      { status: 400 }
    )
  }

  const extension = mimeType.split('/')[1]
  const storagePath = `${user.id}/${crypto.randomUUID()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from('member-documents')
    .upload(storagePath, buffer, { contentType: mimeType })

  if (uploadError) {
    console.error('Document upload error:', uploadError)
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du fichier." },
      { status: 500 }
    )
  }

  const { data: doc, error: dbError } = await supabase
    .from('member_documents')
    .insert({
      user_id: user.id,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: mimeType,
      size_bytes: file.size,
      label: typeof label === 'string' && label.trim() ? label.trim() : undefined,
    })
    .select()
    .single()

  if (dbError) {
    console.error('Document metadata insert error:', dbError)
    await supabase.storage.from('member-documents').remove([storagePath])
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement du document." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, document: doc })
}
