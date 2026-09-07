import type { Context, HonoRequest } from 'hono'
import { ValidationError } from '../domain/errors'

export async function getJsonBody<T>(c: Context): Promise<T> {
  const validated = (c.req as unknown as HonoRequest<'/', { json: T }>).valid('json')
  if (validated !== undefined) return validated as T
  try {
    return (await c.req.json()) as T
  } catch {
    throw new ValidationError('Invalid JSON body')
  }
}

export function param(c: Context, name: string): string {
  const value = c.req.param(name)
  if (!value) throw new ValidationError(`${name} param is required`)
  return value
}