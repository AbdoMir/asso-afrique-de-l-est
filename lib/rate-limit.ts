import { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

// Upstash Redis : état partagé entre toutes les instances serverless Vercel.
// Si les variables ne sont pas configurées (ex. dev local sans compte créé),
// on retombe sur un limiteur en mémoire — moins fiable mais fonctionnel.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

const limiters = new Map<string, Ratelimit>()

function getLimiter(limit: number, windowMs: number): Ratelimit | null {
  if (!redis) return null

  const cacheKey = `${limit}:${windowMs}`
  let limiter = limiters.get(cacheKey)
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
    })
    limiters.set(cacheKey, limiter)
  }
  return limiter
}

interface Bucket {
  count: number
  resetAt: number
}
const memoryBuckets = new Map<string, Bucket>()

function isRateLimitedInMemory(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const bucket = memoryBuckets.get(key)

  if (!bucket || now > bucket.resetAt) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }

  bucket.count += 1
  return bucket.count > limit
}

export async function isRateLimited(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const limiter = getLimiter(limit, windowMs)
  if (!limiter) {
    return isRateLimitedInMemory(key, limit, windowMs)
  }

  const { success } = await limiter.limit(key)
  return !success
}
