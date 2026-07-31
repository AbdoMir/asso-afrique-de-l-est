import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { NextRequest } from 'next/server'

// Le module lit les variables Upstash au chargement : on les neutralise pour
// forcer le limiteur en mémoire, celui qu'on veut éprouver ici.
delete process.env.UPSTASH_REDIS_REST_URL
delete process.env.UPSTASH_REDIS_REST_TOKEN

const { getClientIp, isRateLimited } = await import('@/lib/rate-limit')

/** Fabrique un objet compatible avec la lecture d'en-têtes de NextRequest. */
function requestWith(headers: Record<string, string>): NextRequest {
  return {
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
  } as unknown as NextRequest
}

describe('getClientIp', () => {
  it('retient la première adresse de x-forwarded-for', () => {
    const ip = getClientIp(requestWith({ 'x-forwarded-for': '203.0.113.7, 70.41.3.18' }))
    expect(ip).toBe('203.0.113.7')
  })

  it('ignore les espaces autour de l\'adresse', () => {
    expect(getClientIp(requestWith({ 'x-forwarded-for': '  203.0.113.7  ' }))).toBe('203.0.113.7')
  })

  it('retombe sur x-real-ip puis sur « unknown »', () => {
    expect(getClientIp(requestWith({ 'x-real-ip': '198.51.100.4' }))).toBe('198.51.100.4')
    expect(getClientIp(requestWith({}))).toBe('unknown')
  })
})

describe('isRateLimited (repli en mémoire)', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  it('laisse passer jusqu\'à la limite puis bloque', async () => {
    const key = `test-limite-${Math.random()}`

    for (let i = 0; i < 3; i++) {
      expect(await isRateLimited(key, 3, 60_000)).toBe(false)
    }

    expect(await isRateLimited(key, 3, 60_000)).toBe(true)
  })

  it('compte séparément deux clés distinctes', async () => {
    // Sans cette isolation, une seule adresse IP bloquerait tout le site.
    const a = `test-a-${Math.random()}`
    const b = `test-b-${Math.random()}`

    expect(await isRateLimited(a, 1, 60_000)).toBe(false)
    expect(await isRateLimited(a, 1, 60_000)).toBe(true)

    expect(await isRateLimited(b, 1, 60_000)).toBe(false)
  })

  it('rouvre l\'accès une fois la fenêtre écoulée', async () => {
    const key = `test-fenetre-${Math.random()}`

    expect(await isRateLimited(key, 1, 50)).toBe(false)
    expect(await isRateLimited(key, 1, 50)).toBe(true)

    await new Promise((resolve) => setTimeout(resolve, 60))

    expect(await isRateLimited(key, 1, 50)).toBe(false)
  })
})
