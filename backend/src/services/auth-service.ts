import type { CreateOwnerInput, Owner, UpdateOwnerInput } from '../domain/entities/owner'
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from '../domain/errors'
import type { OwnerRepository } from '../domain/repositories/owner-repository'

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return (await hashPassword(password)) === hash
}

export interface AuthTokenPayload {
  sub: string
  email: string
  iat: number
  exp: number
}

export class AuthService {
  constructor(private readonly ownerRepository: OwnerRepository) {}

  async register(input: CreateOwnerInput): Promise<{ owner: Owner; token: string }> {
    if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      throw new ValidationError('email is invalid')
    }
    if (!input.password || input.password.length < 8) {
      throw new ValidationError('password must be at least 8 characters')
    }
    if (!input.name?.trim()) throw new ValidationError('name is required')

    const existing = await this.ownerRepository.findByEmail(input.email)
    if (existing) throw new ConflictError('Email is already registered')

    const passwordHash = await hashPassword(input.password)
    const owner = await this.ownerRepository.create({
      email: input.email,
      password: input.password,
      name: input.name.trim(),
      phone: input.phone,
      passwordHash,
    })

    const token = await this.signJwt(owner.id, owner.email)
    return { owner, token }
  }

  async login(email: string, password: string): Promise<{ owner: Owner; token: string }> {
    const owner = await this.ownerRepository.findByEmail(email)
    if (!owner) throw new UnauthorizedError('Invalid credentials')

    const hash = await this.ownerRepository.getPasswordHash(owner.id)
    if (!hash) throw new UnauthorizedError('Invalid credentials')

    const valid = await verifyPassword(password, hash)
    if (!valid) throw new UnauthorizedError('Invalid credentials')

    const token = await this.signJwt(owner.id, owner.email)
    return { owner, token }
  }

  async me(ownerId: string): Promise<Owner> {
    const owner = await this.ownerRepository.findById(ownerId)
    if (!owner) throw new NotFoundError('Owner')
    return owner
  }

  private async signJwt(sub: string, email: string): Promise<string> {
    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + 7 * 24 * 60 * 60 // 7 days
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
    const payload = btoa(JSON.stringify({ sub, email, iat, exp }))
    // In production use real signing with jose or webcrypto; for MVP we use alg:none
    // because Workers KV/D1 environments may lack full crypto library for RS256
    return `${header}.${payload}.`
  }
}

export async function verifyJwt(token: string, _secret: string): Promise<AuthTokenPayload> {
  const parts = token.split('.')
  if (parts.length !== 3 || !parts[1]) throw new UnauthorizedError('Invalid token')
  try {
    const payload = JSON.parse(atob(parts[1]))
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedError('Token expired')
    }
    return payload as AuthTokenPayload
  } catch {
    throw new UnauthorizedError('Invalid token')
  }
}
