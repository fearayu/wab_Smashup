import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { authMiddleware, requireRole } from '../middleware/auth'
import {
  createUserSchema,
  profileListResponseSchema,
  profileMeResponseSchema,
  publicProfileResponseSchema,
  updateMeSchema,
  updateUserSchema,
  userListResponseSchema,
  userResponseSchema,
} from '../schemas/user-schemas'
import { errorResponseSchema, idParamSchema } from '../schemas/common-schemas'
import type { AppEnv } from '../types'
import { jsonContent, v } from './route-utils'

export function createUserRouter() {
  const router = new Hono<AppEnv>()

  router.get(
    '/',
    describeRoute({
      tags: ['Users'],
      summary: 'List all users',
      responses: {
        200: { description: 'All users', content: jsonContent(userListResponseSchema) },
      },
    }),
    authMiddleware,
    (c) => c.get('container').userHandler.list(c)
  )

  router.post(
    '/',
    describeRoute({
      tags: ['Users'],
      summary: 'Create a user',
      responses: {
        201: { description: 'User created', content: jsonContent(userResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        409: { description: 'Email already registered', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('json', createUserSchema),
    (c) => c.get('container').userHandler.create(c)
  )

  router.get(
    '/:id',
    describeRoute({
      tags: ['Users'],
      summary: 'Get a user by id',
      description: 'Cached in KV for 5 minutes.',
      responses: {
        200: { description: 'User found', content: jsonContent(userResponseSchema) },
        404: { description: 'User not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('param', idParamSchema),
    (c) => c.get('container').userHandler.get(c)
  )

  router.patch(
    '/:id',
    describeRoute({
      tags: ['Users'],
      summary: 'Update a user',
      responses: {
        200: { description: 'User updated', content: jsonContent(userResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        404: { description: 'User not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('param', idParamSchema),
    v('json', updateUserSchema),
    (c) => c.get('container').userHandler.update(c)
  )

  router.delete(
    '/:id',
    describeRoute({
      tags: ['Users'],
      summary: 'Delete a user',
      responses: {
        204: { description: 'User deleted' },
        404: { description: 'User not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('param', idParamSchema),
    (c) => c.get('container').userHandler.delete(c)
  )

  return router
}

export function createProfileRouter() {
  const router = new Hono<AppEnv>()

  // ── GET /profiles/me ───────────────────────────────────────────────
  router.get(
    '/me',
    describeRoute({
      tags: ['Profiles'],
      summary: 'Get own profile',
      description: 'Returns the full profile of the authenticated user.',
      responses: {
        200: { description: 'Own profile', content: jsonContent(profileMeResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    (c) => c.get('container').userHandler.getMe(c)
  )

  // ── PUT /profiles/me ───────────────────────────────────────────────
  router.put(
    '/me',
    describeRoute({
      tags: ['Profiles'],
      summary: 'Update own profile',
      description: 'Update displayName, phone, level, or avatarUrl. Email and role cannot be changed.',
      responses: {
        200: { description: 'Profile updated', content: jsonContent(profileMeResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('json', updateMeSchema),
    (c) => c.get('container').userHandler.updateMe(c)
  )

  // ── GET /profiles ──────────────────────────────────────────────────
  // Admin only — list all user profiles.
  router.get(
    '/',
    describeRoute({
      tags: ['Profiles'],
      summary: 'List all user profiles (admin only)',
      description: 'Returns limited profile fields for every registered user.',
      responses: {
        200: { description: 'Profile list', content: jsonContent(profileListResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
        403: { description: 'Forbidden — requires admin role', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    requireRole('admin'),
    (c) => c.get('container').userHandler.listProfiles(c)
  )

  // ── GET /profiles/:id ──────────────────────────────────────────────
  // Public profile — limited fields.
  router.get(
    '/:id',
    describeRoute({
      tags: ['Profiles'],
      summary: 'Get public profile by id',
      description: 'Returns limited fields (id, displayName, level, avatarUrl). No email or phone.',
      responses: {
        200: { description: 'Public profile', content: jsonContent(publicProfileResponseSchema) },
        401: { description: 'Unauthorized', content: jsonContent(errorResponseSchema) },
        404: { description: 'User not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    authMiddleware,
    v('param', idParamSchema),
    (c) => c.get('container').userHandler.getPublicProfile(c)
  )

  return router
}
