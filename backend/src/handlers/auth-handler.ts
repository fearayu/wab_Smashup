import type { Context } from 'hono'
import type { CreateOwnerInput } from '../domain/entities/owner'
import { ValidationError } from '../domain/errors'
import type { AuthService } from '../services/auth-service'

export class AuthHandler {
  constructor(private readonly authService: AuthService) {}

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

  private async parseJson<T>(c: Context): Promise<T> {
    try {
      return await c.req.json<T>()
    } catch {
      throw new ValidationError('Invalid JSON body')
    }
  }
}
