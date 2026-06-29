// Signatures binaires (magic bytes) — on ne fait jamais confiance à
// l'extension du fichier ou au Content-Type envoyé par le client.
const SIGNATURES: { mime: string; bytes: number[]; offset?: number }[] = [
  { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF (WEBP vérifié séparément)
]

export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024 // 10 Mo

export function detectMimeType(buffer: Buffer): string | null {
  for (const sig of SIGNATURES) {
    const start = sig.offset || 0
    const matches = sig.bytes.every((b, i) => buffer[start + i] === b)
    if (matches) {
      if (sig.mime === 'image/webp') {
        // RIFF????WEBP : vérifie la marque WEBP après la taille du chunk
        const isWebp = buffer.slice(8, 12).toString('ascii') === 'WEBP'
        if (!isWebp) continue
      }
      return sig.mime
    }
  }
  return null
}

export function isAllowedDocument(buffer: Buffer): { valid: boolean; mimeType: string | null } {
  const mimeType = detectMimeType(buffer)
  return { valid: !!mimeType && ALLOWED_DOCUMENT_TYPES.includes(mimeType), mimeType }
}
