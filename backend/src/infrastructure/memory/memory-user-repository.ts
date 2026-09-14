import type { CreateUserInput, UpdateProfileInput, UpdateUserInput, User } from '../../domain/entities/user'
import type { UserRepository } from '../../domain/repositories/user-repository'

// Reference implementation for runtimes without D1 (AWS Lambda, local tests).
// Swap for a DynamoDB/RDS-backed repository in production Lambda deployments.
export class MemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>()

  async findAll(): Promise<User[]> {
    return [...this.users.values()]
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    return [...this.users.values()].find((u) => u.email === email) ?? null
  }

  async create(input: CreateUserInput): Promise<User> {
    const now = new Date().toISOString()
    const user: User = {
      id: input.id ?? crypto.randomUUID(),
      email: input.email,
      name: input.name,
      createdAt: now,
      updatedAt: now,
    }
    this.users.set(user.id, user)
    return user
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const existing = this.users.get(id)
    if (!existing) return null
    const updated: User = {
      ...existing,
      email: input.email ?? existing.email,
      name: input.name ?? existing.name,
      updatedAt: new Date().toISOString(),
    }
    this.users.set(id, updated)
    return updated
  }

  async updateProfile(id: string, input: UpdateProfileInput): Promise<User | null> {
    const existing = this.users.get(id)
    if (!existing) return null
    const updated: User = {
      ...existing,
      displayName: input.displayName ?? existing.displayName ?? existing.name,
      phone: input.phone !== undefined ? input.phone : existing.phone,
      level: input.level !== undefined ? input.level : existing.level,
      avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : existing.avatarUrl,
      updatedAt: new Date().toISOString(),
    }
    this.users.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id)
  }
}
