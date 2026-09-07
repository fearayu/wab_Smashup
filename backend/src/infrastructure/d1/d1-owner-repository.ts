import type { CreateOwnerInput, Owner, UpdateOwnerInput } from '../../domain/entities/owner'
import type { OwnerRepository } from '../../domain/repositories/owner-repository'

interface OwnerRow {
  id: string
  email: string
  password_hash: string
  name: string
  phone: string | null
  plan: string
  plan_expires_at: string | null
  onboarding_completed: number
  role: string
  created_at: string
  updated_at: string
}

function toOwner(row: OwnerRow): Owner {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    plan: row.plan as 'free' | 'pro',
    planExpiresAt: row.plan_expires_at,
    onboardingCompleted: row.onboarding_completed === 1,
    role: (row.role as 'admin' | 'member' | 'user') || 'member',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export class D1OwnerRepository implements OwnerRepository {
  constructor(private readonly db: D1Database) {}

  async findById(id: string): Promise<Owner | null> {
    const row = await this.db
      .prepare('SELECT id, email, password_hash, name, phone, plan, plan_expires_at, onboarding_completed, role, created_at, updated_at FROM owners WHERE id = ?')
      .bind(id)
      .first<OwnerRow>()
    return row ? toOwner(row) : null
  }

  async findByEmail(email: string): Promise<Owner | null> {
    const row = await this.db
      .prepare('SELECT id, email, password_hash, name, phone, plan, plan_expires_at, onboarding_completed, role, created_at, updated_at FROM owners WHERE email = ?')
      .bind(email)
      .first<OwnerRow>()
    return row ? toOwner(row) : null
  }

  async create(input: Omit<CreateOwnerInput, 'password'> & { passwordHash: string }): Promise<Owner> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    await this.db
      .prepare('INSERT INTO owners (id, email, password_hash, name, phone, plan, onboarding_completed, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.email, input.passwordHash, input.name, input.phone ?? null, 'free', 0, 'member', now, now)
      .run()
    return {
      id,
      email: input.email,
      name: input.name,
      phone: input.phone ?? null,
      plan: 'free',
      planExpiresAt: null,
      onboardingCompleted: false,
      role: 'member',
      createdAt: now,
      updatedAt: now,
    }
  }

  async update(id: string, input: UpdateOwnerInput): Promise<Owner | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const name = input.name ?? existing.name
    const phone = input.phone !== undefined ? input.phone : existing.phone
    const plan = input.plan ?? existing.plan
    const planExpiresAt = input.planExpiresAt !== undefined ? input.planExpiresAt : existing.planExpiresAt
    const onboardingCompleted = input.onboardingCompleted !== undefined ? (input.onboardingCompleted ? 1 : 0) : (existing.onboardingCompleted ? 1 : 0)
    const now = new Date().toISOString()

    await this.db
      .prepare('UPDATE owners SET name = ?, phone = ?, plan = ?, plan_expires_at = ?, onboarding_completed = ?, updated_at = ? WHERE id = ?')
      .bind(name, phone, plan, planExpiresAt, onboardingCompleted, now, id)
      .run()

    return { ...existing, name, phone, plan, planExpiresAt, onboardingCompleted: onboardingCompleted === 1, updatedAt: now }
  }

  async getPasswordHash(id: string): Promise<string | null> {
    const row = await this.db
      .prepare('SELECT password_hash FROM owners WHERE id = ?')
      .bind(id)
      .first<{ password_hash: string }>()
    return row?.password_hash ?? null
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM owners WHERE id = ?').bind(id).run()
    return result.meta.changes > 0
  }

  async findAll(): Promise<Owner[]> {
    const result = await this.db
      .prepare('SELECT id, email, password_hash, name, phone, plan, plan_expires_at, onboarding_completed, role, created_at, updated_at FROM owners ORDER BY created_at DESC')
      .all<OwnerRow>()
    return (result.results ?? []).map(toOwner)
  }

  async updateRole(id: string, role: 'admin' | 'member' | 'user'): Promise<Owner | null> {
    const existing = await this.findById(id)
    if (!existing) return null
    const now = new Date().toISOString()
    await this.db
      .prepare('UPDATE owners SET role = ?, updated_at = ? WHERE id = ?')
      .bind(role, now, id)
      .run()
    return { ...existing, role, updatedAt: now }
  }
}
