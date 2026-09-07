import type { CreateOwnerInput, Owner, UpdateOwnerInput } from '../../domain/entities/owner'
import type { OwnerRepository, OwnerRole } from '../../domain/repositories/owner-repository'

export class MemoryOwnerRepository implements OwnerRepository {
  private readonly owners = new Map<string, Owner & { passwordHash: string }>()

  async findById(id: string): Promise<Owner | null> {
    const row = this.owners.get(id)
    if (!row) return null
    const { passwordHash: _, ...owner } = row
    return owner
  }

  async findByEmail(email: string): Promise<Owner | null> {
    const row = [...this.owners.values()].find((o) => o.email === email)
    if (!row) return null
    const { passwordHash: _, ...owner } = row
    return owner
  }

  async findAll(): Promise<Owner[]> {
    return [...this.owners.values()].map(({ passwordHash: _, ...owner }) => owner)
  }

  async getPasswordHash(id: string): Promise<string | null> {
    return this.owners.get(id)?.passwordHash ?? null
  }

  async create(input: Omit<CreateOwnerInput, 'password'> & { passwordHash: string }): Promise<Owner> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const owner: Owner & { passwordHash: string } = {
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
      passwordHash: input.passwordHash,
    }
    this.owners.set(id, owner)
    const { passwordHash: _, ...result } = owner
    return result
  }

  async update(id: string, input: UpdateOwnerInput): Promise<Owner | null> {
    const existing = this.owners.get(id)
    if (!existing) return null
    const updated = { ...existing, ...input, updatedAt: new Date().toISOString() }
    if (input.onboardingCompleted !== undefined) updated.onboardingCompleted = input.onboardingCompleted
    this.owners.set(id, updated)
    const { passwordHash: _, ...result } = updated
    return result
  }

  async updateRole(id: string, role: OwnerRole): Promise<Owner | null> {
    const existing = this.owners.get(id)
    if (!existing) return null
    existing.role = role
    existing.updatedAt = new Date().toISOString()
    const { passwordHash: _, ...result } = existing
    return result
  }

  async delete(id: string): Promise<boolean> {
    return this.owners.delete(id)
  }
}
