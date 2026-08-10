import type { Context } from 'hono'
import type { CreateOwnerInput } from '../domain/entities/owner'
import { ValidationError } from '../domain/errors'
import type { AuthService } from '../services/auth-service'
import type { OwnerRepository } from '../domain/repositories/owner-repository'

export class AuthHandler {
  constructor(
    private readonly authService: AuthService,
    private readonly ownerRepository: OwnerRepository,
  ) {}

  register = async (c: Context) => {
    const body = await this.parseJson<CreateOwnerInput>(c)
    const { owner, token } = await this.authService.register(body)
    return c.json({ data: { token, owner } }, 201)
  }

  login = async (c: Context) => {
    const body = await this.parseJson<{ email: string; password: string }>(c)
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
    const owners = await this.ownerRepository.findAll()
    return c.json({ data: owners })
  }

  // Admin: update owner role
  updateRole = async (c: Context) => {
    const id = c.req.param('id')
    const body = await this.parseJson<{ role: 'admin' | 'member' | 'user' }>(c)
    if (!['admin', 'member', 'user'].includes(body.role)) {
      throw new ValidationError('role ต้องเป็น admin, member หรือ user')
    }
    const owner = await this.ownerRepository.updateRole(id, body.role)
    if (!owner) throw new ValidationError('ไม่พบผู้ใช้')
    return c.json({ data: owner })
  }

  private async parseJson<T>(c: Context): Promise<T> {
    try {
      return await c.req.json<T>()
    } catch {
      throw new ValidationError('Invalid JSON body')
    }
  }
}
