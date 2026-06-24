import { NextRequest } from 'next/server'

interface Bucket {
  count: number
  resetAt: number
}

// Limiteur en mémoire : suffisant pour une seule instance serveur, mais ne
// partage pas l'état entre plusieurs instances (Vercel/serverless multi-région).
// À remplacer par Upstash/Redis si le trafic ou le scaling horizontal l'exige.
const buckets = new Map<string, Bucket>()

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }

  bucket.count += 1
  return bucket.count > limit
}
