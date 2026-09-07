import type { Context } from 'hono'
import type { CreateUserInput, UpdateUserInput } from '../domain/entities/user'
import type { UserService } from '../services/user-service'
import { getJsonBody, param } from './http-utils'

export class UserHandler {
  constructor(private readonly userService: UserService) {}

  list = async (c: Context) => {
    const users = await this.userService.listUsers()
    return c.json({ data: users })
  }

  get = async (c: Context) => {
    const user = await this.userService.getUser(param(c, 'id'))
    return c.json({ data: user })
  }

  create = async (c: Context) => {
    const body = await getJsonBody<CreateUserInput>(c)
    const user = await this.userService.createUser(body)
    return c.json({ data: user }, 201)
  }

  update = async (c: Context) => {
    const body = await getJsonBody<UpdateUserInput>(c)
    const user = await this.userService.updateUser(param(c, 'id'), body)
    return c.json({ data: user })
  }

  delete = async (c: Context) => {
    await this.userService.deleteUser(param(c, 'id'))
    return c.body(null, 204)
  }
}
