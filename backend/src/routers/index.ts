import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { createUserRouter } from './user-router'

export function createApiRouter() {
  const api = new Hono<AppEnv>()

  api.route('/users', createUserRouter())

  return api
}
