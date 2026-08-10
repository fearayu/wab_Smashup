import type { CacheRepository } from '../domain/repositories/cache-repository'
import type { UserRepository } from '../domain/repositories/user-repository'
import { UserHandler } from '../handlers/user-handler'
import { UserService } from '../services/user-service'

export interface Repositories {
  userRepository: UserRepository
  cacheRepository: CacheRepository
}

export interface Container {
  userHandler: UserHandler
}

export function createContainer(repos: Repositories): Container {
  const userService = new UserService(repos.userRepository, repos.cacheRepository)
  return {
    userHandler: new UserHandler(userService),
  }
}
