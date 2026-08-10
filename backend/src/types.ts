import type { Container } from './di/container'

// Cloudflare Workers bindings (declared in wrangler.jsonc)
export interface Bindings {
  DB: D1Database
  KV: KVNamespace
  JWT_SECRET: string
  ENVIRONMENT?: string
}

export interface Variables {
  container: Container
  ownerId: string
  ownerRole: 'admin' | 'member' | 'user'
}

export type AppEnv = {
  Bindings: Bindings
  Variables: Variables
}
