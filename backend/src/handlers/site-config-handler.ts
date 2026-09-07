import type { Context } from 'hono'
import type { UpdateSiteConfigInput } from '../domain/entities/site-config'
import { ValidationError } from '../domain/errors'
import type { SiteConfigService } from '../services/site-config-service'
import { getJsonBody, param } from './http-utils'

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
    const body = await getJsonBody<UpdateSiteConfigInput>(c)
    const config = await this.siteConfigService.update(param(c, 'venue_id'), body, ownerId)
    return c.json({ data: config })
  }
}
