import type { CreateOwnerInput, Owner, UpdateOwnerInput } from '../domain/entities/owner'
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from '../domain/errors'
import type { OwnerRepository, OwnerRole } from '../domain/repositories/owner-repository'
import { base64UrlToBytes, bytesToBase64Url, signJwt, timingSafeEqual } from './jwt'

const encoder = new TextEncoder()
const PBKDF2_ITERATIONS = 100_000
const KEY_LENGTH_BYTES = 32 // SHA-256 output

function bytesToStandardBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
  return btoa(binary)
}

function randomSalt(): Uint8Array {
  const salt = new Uint8Array(16)
  crypto.getRandomValues(salt)
  return salt
}

async function deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    keyMaterial,
    KEY_LENGTH_BYTES * 8
  )
  return new Uint8Array(bits)
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomSalt()
  const hash = await deriveKey(password, salt, PBKDF2_ITERATIONS)
  return `pbkdf2$${PBKDF2_ITERATIONS}$${bytesToBase64Url(salt)}$${bytesToBase64Url(hash)}`
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length === 4 && parts[0] === 'pbkdf2') {
    const iterations = Number(parts[1])
    if (!Number.isInteger(iterations) || iterations <= 0) return false
    try {
      const derived = await deriveKey(password, base64UrlToBytes(parts[2]!), iterations)
      return timingSafeEqual(derived, base64UrlToBytes(parts[3]!))
    } catch {
      return false
    }
  }

  // Legacy pre-PBKDF2 hash: unsalted SHA-256 stored as standard base64.
  // Verify comparably so existing accounts keep working; new hashes use PBKDF2.
  const legacyHash = await crypto.subtle.digest('SHA-256', encoder.encode(password))
  const computed = bytesToStandardBase64(new Uint8Array(legacyHash))
  return timingSafeEqual(encoder.encode(computed), encoder.encode(stored))
}

export class AuthService {
  constructor(
    private readonly ownerRepository: OwnerRepository,
    private readonly jwtSecret: string,
  ) {}

  async register(input: CreateOwnerInput): Promise<{ owner: Owner; token: string }> {
    if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      throw new ValidationError('email is invalid')
    }
    if (!input.password || input.password.length < 8) {
      throw new ValidationError('password must be at least 8 characters')
    }
    if (!input.name?.trim()) throw new ValidationError('name is required')

    const email = input.email.trim().toLowerCase()
    const existing = await this.ownerRepository.findByEmail(email)
    if (existing) throw new ConflictError('Email is already registered')

    const passwordHash = await hashPassword(input.password)
    const owner = await this.ownerRepository.create({
      email,
      name: input.name.trim(),
      phone: input.phone,
      passwordHash,
    })

    const token = await this.buildToken(owner)
    return { owner, token }
  }

  async login(email: string, password: string): Promise<{ owner: Owner; token: string }> {
    const owner = await this.ownerRepository.findByEmail(email.trim().toLowerCase())
    if (!owner) throw new UnauthorizedError('Invalid credentials')

    const hash = await this.ownerRepository.getPasswordHash(owner.id)
    if (!hash) throw new UnauthorizedError('Invalid credentials')

    const valid = await verifyPassword(password, hash)
    if (!valid) throw new UnauthorizedError('Invalid credentials')

    const token = await this.buildToken(owner)
    return { owner, token }
  }

  async me(ownerId: string): Promise<Owner> {
    const owner = await this.ownerRepository.findById(ownerId)
    if (!owner) throw new NotFoundError('Owner')
    return owner
  }

  async listOwners(): Promise<Owner[]> {
    return this.ownerRepository.findAll()
  }

  async updateRole(id: string, role: OwnerRole): Promise<Owner> {
    const owner = await this.ownerRepository.updateRole(id, role)
    if (!owner) throw new NotFoundError('Owner')
    return owner
  }

  private buildToken(owner: Pick<Owner, 'id' | 'email' | 'role'>): Promise<string> {
    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + 7 * 24 * 60 * 60 // 7 days
    return signJwt({ sub: owner.id, email: owner.email, role: owner.role, iat, exp }, this.jwtSecret)
  }
}
