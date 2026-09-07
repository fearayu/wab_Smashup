import type { Context } from 'hono'
import { resolver, validator } from 'hono-openapi'

export const jsonContent = (schema: Parameters<typeof resolver>[0]) => ({
  'application/json': { schema: resolver(schema) },
})

type HookResult = { error?: Array<{ message?: string }> }

function validationHook(result: unknown, c: Context) {
  const error = (result as HookResult).error
  if (error && error.length > 0) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: error[0]?.message ?? 'Invalid input' } }, 400)
  }
}

export function v(target: Parameters<typeof validator>[0], schema: Parameters<typeof validator>[1]) {
  return validator(target, schema, validationHook as unknown as Parameters<typeof validator>[2])
}