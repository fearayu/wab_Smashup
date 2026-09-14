import type { CreateUserInput, UpdateProfileInput, UpdateUserInput, User } from '../domain/entities/user'
import { ConflictError, NotFoundError, ValidationError } from '../domain/errors'
import type { CacheRepository } from '../domain/repositories/cache-repository'
import type { UserRepository } from '../domain/repositories/user-repository'

const CACHE_TTL_SECONDS = 300
const cacheKey = (id: string) => `user:${id}`

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cache: CacheRepository
  ) {}

  async listUsers(): Promise<User[]> {
    return this.userRepository.findAll()
  }

  async getUser(id: string): Promise<User> {
    const cached = await this.cache.get<User>(cacheKey(id))
    if (cached) return cached

    const user = await this.userRepository.findById(id)
    if (!user) throw new NotFoundError('User')

    await this.cache.set(cacheKey(id), user, CACHE_TTL_SECONDS)
    return user
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const email = input.email.trim().toLowerCase()
    this.validateEmail(email)
    if (!input.name?.trim()) throw new ValidationError('name is required')

    const existing = await this.userRepository.findByEmail(email)
    if (existing) throw new ConflictError('Email is already registered')

    return this.userRepository.create({ email, name: input.name.trim() })
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const email = input.email !== undefined ? input.email.trim().toLowerCase() : undefined
    if (email !== undefined) this.validateEmail(email)

    const updateInput: UpdateUserInput = { ...input }
    if (email !== undefined) updateInput.email = email

    const updated = await this.userRepository.update(id, updateInput)
    if (!updated) throw new NotFoundError('User')

    await this.cache.delete(cacheKey(id))
    return updated
  }

  async deleteUser(id: string): Promise<void> {
    const deleted = await this.userRepository.delete(id)
    if (!deleted) throw new NotFoundError('User')
    await this.cache.delete(cacheKey(id))
  }

  /** Update profile-editable fields (displayName, phone, level, avatarUrl). */
  async updateProfile(id: string, input: UpdateProfileInput): Promise<User> {
    if (input.displayName !== undefined && !input.displayName.trim()) {
      throw new ValidationError('displayName cannot be empty')
    }

    const updated = await this.userRepository.updateProfile(id, input)
    if (!updated) throw new NotFoundError('User')
    await this.cache.delete(cacheKey(id))
    return updated
  }

  /**
   * Get the user profile for an authenticated owner, auto-creating one
   * on first access. This bridges the Owner ↔ User identity gap: auth
   * creates Owners with a UUID, and profiles live in the User table.
   */
  async getOrCreateProfile(ownerId: string, email: string): Promise<User> {
    const existing = await this.userRepository.findById(ownerId)
    if (existing) return existing

    return this.userRepository.create({
      id: ownerId,
      email,
      name: 'Player',
    })
  }

  private validateEmail(email: string): void {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ValidationError('email is invalid')
    }
  }
}
