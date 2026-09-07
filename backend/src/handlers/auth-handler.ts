import type { Context } from 'hono'
import type { CreateOwnerInput } from '../domain/entities/owner'
import type { OwnerRole } from '../domain/repositories/owner-repository'
import { ValidationError } from '../domain/errors'
import type { AuthService } from '../services/auth-service'
import { getJsonBody, param } from './http-utils'

export class AuthHandler {
  constructor(private readonly authService: AuthService) {}

  register = async (c: Context) => {
    const body = await getJsonBody<CreateOwnerInput>(c)
    const { owner, token } = await this.authService.register(body)
    return c.json({ data: { token, owner } }, 201)
  }

  login = async (c: Context) => {
    const body = await getJsonBody<{ email: string; password: string }>(c)
    const { owner, token } = await this.authService.login(body.email, body.password)
    return c.json({ data: { token, owner } })
  }

  me = async (c: Context) => {
    const ownerId = c.get('ownerId')
    if (!ownerId) throw new ValidationError('ownerId not set')
    const owner = await this.authService.me(ownerId)
    return c.json({ data: owner })
  }

  // Admin: list all owners
  listOwners = async (c: Context) => {
    const owners = await this.authService.listOwners()
    return c.json({ data: owners })
  }

  // Admin: update owner role
  updateRole = async (c: Context) => {
    const id = param(c, 'id')
    const body = await getJsonBody<{ role: OwnerRole }>(c)
    const owner = await this.authService.updateRole(id, body.role)
    return c.json({ data: owner })
  }
}
