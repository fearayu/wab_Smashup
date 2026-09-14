import type { Context } from 'hono'
import type { CreateUserInput, UpdateProfileInput, UpdateUserInput } from '../domain/entities/user'
import { ValidationError } from '../domain/errors'
import type { UserService } from '../services/user-service'
import { getJsonBody, param } from './http-utils'

export class UserHandler {
  constructor(private readonly userService: UserService) {}

  list = async (c: Context) => {
    const users = await this.userService.listUsers()
    return c.json({ data: users })
  }

  get = async (c: Context) => {
    const user = await this.userService.getUser(param(c, 'id'))
    return c.json({ data: user })
  }

  create = async (c: Context) => {
    const body = await getJsonBody<CreateUserInput>(c)
    const user = await this.userService.createUser(body)
    return c.json({ data: user }, 201)
  }

  update = async (c: Context) => {
    const body = await getJsonBody<UpdateUserInput>(c)
    const user = await this.userService.updateUser(param(c, 'id'), body)
    return c.json({ data: user })
  }

  delete = async (c: Context) => {
    await this.userService.deleteUser(param(c, 'id'))
    return c.body(null, 204)
  }

  // ── Profile endpoints ──────────────────────────────────────────────

  /** GET /profiles/me — full own profile. */
  getMe = async (c: Context) => {
    const userId = c.get('ownerId')
    const email = c.get('ownerEmail') ?? 'unknown@smashup.local'
    if (!userId) throw new ValidationError('ownerId not set')
    const user = await this.userService.getOrCreateProfile(userId, email)
    return c.json({ data: user })
  }

  /** PUT /profiles/me — update own profile fields. */
  updateMe = async (c: Context) => {
    const userId = c.get('ownerId')
    const email = c.get('ownerEmail') ?? 'unknown@smashup.local'
    if (!userId) throw new ValidationError('ownerId not set')
    await this.userService.getOrCreateProfile(userId, email)
    const body = await getJsonBody<UpdateProfileInput>(c)
    const user = await this.userService.updateProfile(userId, body)
    return c.json({ data: user })
  }

  /** GET /profiles/:id — public profile (limited fields). */
  getPublicProfile = async (c: Context) => {
    const user = await this.userService.getUser(param(c, 'id'))
    return c.json({
      data: {
        id: user.id,
        displayName: user.displayName ?? user.name,
        level: user.level,
        avatarUrl: user.avatarUrl,
      },
    })
  }

  /** GET /profiles — list all users as profiles (admin only). */
  listProfiles = async (c: Context) => {
    const users = await this.userService.listUsers()
    return c.json({
      data: users.map((u) => ({
        id: u.id,
        displayName: u.displayName ?? u.name,
        level: u.level,
        role: u.role,
        createdAt: u.createdAt,
      })),
    })
  }
}
