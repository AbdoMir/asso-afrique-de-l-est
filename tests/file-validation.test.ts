import { describe, it, expect } from 'vitest'
import {
  detectMimeType,
  isAllowedDocument,
  MAX_DOCUMENT_SIZE_BYTES,
} from '@/lib/file-validation'

/** Construit un tampon commençant par les octets donnés, complété de zéros. */
function fileStartingWith(bytes: number[], length = 64): Buffer {
  const buf = Buffer.alloc(length)
  Buffer.from(bytes).copy(buf)
  return buf
}

const PDF = fileStartingWith([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37])
const JPEG = fileStartingWith([0xff, 0xd8, 0xff, 0xe0])
const PNG = fileStartingWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

function webp(marque = 'WEBP'): Buffer {
  const buf = Buffer.alloc(64)
  buf.write('RIFF', 0, 'ascii')
  buf.writeUInt32LE(56, 4)
  buf.write(marque, 8, 'ascii')
  return buf
}

describe('detectMimeType', () => {
  it('reconnaît les formats autorisés à leur signature binaire', () => {
    expect(detectMimeType(PDF)).toBe('application/pdf')
    expect(detectMimeType(JPEG)).toBe('image/jpeg')
    expect(detectMimeType(PNG)).toBe('image/png')
    expect(detectMimeType(webp())).toBe('image/webp')
  })

  it('rejette un RIFF qui n\'est pas un WEBP (ex. fichier WAV)', () => {
    // RIFF sert à plusieurs formats : la marque WEBP doit être vérifiée.
    expect(detectMimeType(webp('WAVE'))).toBeNull()
  })

  it('rejette un exécutable et un contenu quelconque', () => {
    expect(detectMimeType(fileStartingWith([0x4d, 0x5a]))).toBeNull() // MZ (.exe)
    expect(detectMimeType(Buffer.from('<?php system($_GET[0]); ?>'))).toBeNull()
    expect(detectMimeType(Buffer.alloc(0))).toBeNull()
  })
})

describe('isAllowedDocument', () => {
  it('accepte les quatre formats prévus', () => {
    for (const buf of [PDF, JPEG, PNG, webp()]) {
      expect(isAllowedDocument(buf).valid).toBe(true)
    }
  })

  it('refuse un fichier dont seule l\'extension prétendrait être valide', () => {
    // L'upload ne se fie ni au nom ni au Content-Type : un script renommé
    // « facture.pdf » ne doit pas passer.
    const script = Buffer.from('#!/bin/sh\nrm -rf /\n')
    const { valid, mimeType } = isAllowedDocument(script)
    expect(valid).toBe(false)
    expect(mimeType).toBeNull()
  })

  it('reste sous la limite de corps de requête de Vercel', () => {
    // Au-delà de 4,5 Mo, Vercel rejette la requête avant d'atteindre le code.
    expect(MAX_DOCUMENT_SIZE_BYTES).toBeLessThan(4.5 * 1024 * 1024)
  })
})
