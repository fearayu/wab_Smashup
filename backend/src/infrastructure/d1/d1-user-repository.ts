import type { CreateUserInput, UpdateUserInput, UpdateProfileInput, User } from '../../domain/entities/user'
import type { UserRepository } from '../../domain/repositories/user-repository'

interface UserRow {
  id: string
  email: string
  name: string
  display_name: string | null
  phone: string | null
  level: string | null
  role: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string | null
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    displayName: row.display_name ?? undefined,
    phone: row.phone ?? undefined,
    level: row.level ?? undefined,
    role: row.role ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
  }
}

export class D1UserRepository implements UserRepository {
  constructor(private readonly db: D1Database) {}

  async findAll(): Promise<User[]> {
    const { results } = await this.db
      .prepare(
        'SELECT id, email, name, display_name, phone, level, role, avatar_url, created_at, updated_at FROM users ORDER BY created_at DESC'
      )
      .all<UserRow>()
    return results.map(toUser)
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.db
      .prepare(
        'SELECT id, email, name, display_name, phone, level, role, avatar_url, created_at, updated_at FROM users WHERE id = ?'
      )
      .bind(id)
      .first<UserRow>()
    return row ? toUser(row) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db
      .prepare(
        'SELECT id, email, name, display_name, phone, level, role, avatar_url, created_at, updated_at FROM users WHERE email = ?'
      )
      .bind(email)
      .first<UserRow>()
    return row ? toUser(row) : null
  }

  async create(input: CreateUserInput): Promise<User> {
    const id = input.id ?? crypto.randomUUID()
    const now = new Date().toISOString()
    await this.db
      .prepare(
        'INSERT INTO users (id, email, name, display_name, phone, level, role, avatar_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(id, input.email, input.name, null, null, null, null, null, now, now)
      .run()
    return { id, email: input.email, name: input.name, createdAt: now, updatedAt: now }
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const email = input.email ?? existing.email
    const name = input.name ?? existing.name
    const now = new Date().toISOString()
    await this.db
      .prepare('UPDATE users SET email = ?, name = ?, updated_at = ? WHERE id = ?')
      .bind(email, name, now, id)
      .run()
    return { ...existing, email, name, updatedAt: now }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM users WHERE id = ?').bind(id).run()
    return result.meta.changes > 0
  }

  /** Update only profile-editable fields (displayName, phone, level, avatarUrl). */
  async updateProfile(id: string, input: UpdateProfileInput): Promise<User | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const displayName = input.displayName ?? existing.displayName ?? existing.name
    const phone = input.phone !== undefined ? input.phone : existing.phone
    const level = input.level !== undefined ? input.level : existing.level
    const avatarUrl = input.avatarUrl !== undefined ? input.avatarUrl : existing.avatarUrl
    const now = new Date().toISOString()

    await this.db
      .prepare(
        'UPDATE users SET display_name = ?, phone = ?, level = ?, avatar_url = ?, updated_at = ? WHERE id = ?'
      )
      .bind(displayName ?? null, phone ?? null, level ?? null, avatarUrl ?? null, now, id)
      .run()

    return { ...existing, displayName, phone, level, avatarUrl, updatedAt: now }
  }
}
