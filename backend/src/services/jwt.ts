import type { OwnerRole } from '../domain/repositories/owner-repository'
import { UnauthorizedError } from '../domain/errors'

export interface AuthTokenPayload {
  sub: string
  email: string
  role: OwnerRole
  iat: number
  exp: number
}

const encoder = new TextEncoder()

function base64UrlEncode(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=')
  return atob(padded)
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function base64UrlToBytes(input: string): Uint8Array {
  const binary = base64UrlDecode(input)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

// Constant-time byte comparison (length leaks, contents do not)
export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!
  return diff === 0
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
}

export async function signJwt(payload: AuthTokenPayload, secret: string): Promise<string> {
  if (!secret) throw new Error('JWT_SECRET is not configured')
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64UrlEncode(JSON.stringify(payload))
  const signingInput = `${header}.${body}`
  const key = await hmacKey(secret)
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signingInput))
  return `${signingInput}.${bytesToBase64Url(new Uint8Array(signature))}`
}

export async function verifyJwt(token: string, secret: string): Promise<AuthTokenPayload> {
  if (!secret) throw new UnauthorizedError('Invalid token')
  const parts = token.split('.')
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) throw new UnauthorizedError('Invalid token')

  try {
    const expected = await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(`${parts[0]}.${parts[1]}`))
    if (!timingSafeEqual(new Uint8Array(expected), base64UrlToBytes(parts[2]))) {
      throw new UnauthorizedError('Invalid token')
    }

    const payload = JSON.parse(base64UrlDecode(parts[1])) as AuthTokenPayload
    const now = Math.floor(Date.now() / 1000)
    if (typeof payload.sub !== 'string' || typeof payload.iat !== 'number' || typeof payload.exp !== 'number') {
      throw new UnauthorizedError('Invalid token')
    }
    if (typeof payload.email !== 'string' || typeof payload.role !== 'string') {
      throw new UnauthorizedError('Invalid token: missing email or role')
    }
    if (payload.exp < now) throw new UnauthorizedError('Token expired')
    if (payload.iat > now + 60) throw new UnauthorizedError('Invalid token')

    return payload
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err
    throw new UnauthorizedError('Invalid token')
  }
}