import z from 'zod'

// HTTP contract schemas — used by routers for validation (hono-openapi
// validator) and OpenAPI spec generation. Keep in sync with domain entities.

export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  createdAt: z.iso.datetime(),
})

export const createUserSchema = z.object({
  email: z.email(),
  name: z.string().min(1),
})

export const updateUserSchema = createUserSchema.partial()

export const userResponseSchema = z.object({ data: userSchema })
export const userListResponseSchema = z.object({ data: z.array(userSchema) })

// ── Profile schemas ────────────────────────────────────────────────────

/** Full own-profile response (all non-sensitive fields). */
export const profileMeSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  displayName: z.string().optional(),
  phone: z.string().optional(),
  level: z.string().optional(),
  role: z.string().optional(),
  avatarUrl: z.string().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime().optional(),
})

/** Body accepted by PUT /profiles/me — only profile-editable fields. */
export const updateMeSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional(),
  level: z.string().max(20).optional(),
  avatarUrl: z.string().max(2000).optional(),
})

/** Public profile (no email, no phone). */
export const publicProfileSchema = z.object({
  id: z.uuid(),
  displayName: z.string().optional(),
  level: z.string().optional(),
  avatarUrl: z.string().optional(),
})

/** Admin listing item (no email, no phone). */
export const profileListItemSchema = z.object({
  id: z.uuid(),
  displayName: z.string().optional(),
  level: z.string().optional(),
  role: z.string().optional(),
  createdAt: z.iso.datetime(),
})

// Response wrappers
export const profileMeResponseSchema = z.object({ data: profileMeSchema })
export const publicProfileResponseSchema = z.object({ data: publicProfileSchema })
export const profileListResponseSchema = z.object({ data: z.array(profileListItemSchema) })
