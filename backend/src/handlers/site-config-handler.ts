import type { Context } from 'hono'
import type { UpdateSiteConfigInput } from '../domain/entities/site-config'
import { ValidationError } from '../domain/errors'
import type { SiteConfigService } from '../services/site-config-service'

export class SiteConfigHandler {
  constructor(private readonly siteConfigService: SiteConfigService) {}

  getPublic = async (c: Context) => {
    const slug = c.req.param('slug')
    if (!slug) throw new ValidationError('slug param is required')
    const result = await this.siteConfigService.getBySlug(slug)
    return c.json({ data: result })
  }

  update = async (c: Context) => {
    const ownerId = c.get('ownerId')
    if (!ownerId) throw new ValidationError('ownerId not set')
    const body = await this.parseJson<UpdateSiteConfigInput>(c)
    const config = await this.siteConfigService.update(this.param(c, 'venue_id'), body, ownerId)
    return c.json({ data: config })
  }

  private param(c: Context, name: string): string {
    const value = c.req.param(name)
    if (!value) throw new ValidationError(`${name} param is required`)
    return value
  }

  private async parseJson<T>(c: Context): Promise<T> {
    try {
      return await c.req.json<T>()
    } catch {
      throw new ValidationError('Invalid JSON body')
    }
  }
}
