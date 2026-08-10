import { Hono } from 'hono'
import { describeRoute, resolver, validator } from 'hono-openapi'
import { authMiddleware, requireRole } from '../middleware/auth'
import {
  errorResponseSchema,
  loginResponseSchema,
  loginSchema,
  ownerListResponseSchema,
  ownerResponseSchema,
  registerSchema,
  updateRoleSchema,
} from '../schemas/auth-schemas'
import type { AppEnv } from '../types'

const jsonContent = (schema: Parameters<typeof resolver>[0]) => ({
  'application/json': { schema: resolver(schema) },
})

export function createAuthRouter() {
  const router = new Hono<AppEnv>()

  router.post(
    '/register',
    describeRoute({
      tags: ['Auth'],
      summary: 'Register a new owner',
      responses: {
        201: { description: 'Owner registered', content: jsonContent(loginResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        409: { description: 'Email already registered', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('json', registerSchema),
    (c) => c.get('container').authHandler.register(c)
  )

  router.post(
    '/login',
    describeRoute({
      tags: ['Auth'],
      summary: 'Login owner',
      responses: {
        200: { description: 'Login successful', content: jsonContent(loginResponseSchema) },
        401: { description: 'Invalid credentials', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('json', loginSchema),
    (c) => c.get('container').authHandler.login(c)
  )

  router.get(
    '/me',
    describeRoute({
      tags: ['Auth'],
      summary: 'Get current owner',
      responses: {
        200: { description: 'Current owner', content: jsonContent(ownerResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    (c) => c.get('container').authHandler.me(c)
  )

  // Admin routes — require 'admin' role
  const admin = new Hono<AppEnv>()
  admin.use('*', authMiddleware, requireRole('admin'))

  admin.get(
    '/owners',
    describeRoute({
      tags: ['Auth'],
      summary: 'List all owners (admin only)',
      responses: {
        200: { description: 'Owner list', content: jsonContent(ownerListResponseSchema) },
        403: { description: 'Forbidden', content: jsonContent(errorResponseSchema) },
      },
    }),
    (c) => c.get('container').authHandler.listOwners(c)
  )

  admin.patch(
    '/owners/:id/role',
    describeRoute({
      tags: ['Auth'],
      summary: 'Update owner role (admin only)',
      responses: {
        200: { description: 'Role updated', content: jsonContent(ownerResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        403: { description: 'Forbidden', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('json', updateRoleSchema),
    (c) => c.get('container').authHandler.updateRole(c)
  )

  router.route('/admin', admin)

  return router
}
