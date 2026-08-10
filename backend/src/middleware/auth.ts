import { createMiddleware } from 'hono/factory'
import { UnauthorizedError, ForbiddenError } from '../domain/errors'
import { verifyJwt } from '../services/auth-service'
import type { AppEnv } from '../types'

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) throw new UnauthorizedError('Missing or invalid Authorization header')

  const token = header.slice(7)
  const secret = c.env.JWT_SECRET ?? 'smashup-dev-secret'
  const payload = await verifyJwt(token, secret)
  c.set('ownerId', payload.sub)
  c.set('ownerRole', payload.role)
  await next()
})

export function requireRole(...roles: string[]) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const role = c.get('ownerRole')
    if (!role || !roles.includes(role)) {
      throw new ForbiddenError(`ต้องเป็น ${roles.join(' หรือ ')} เท่านั้น`)
    }
    await next()
  })
}
