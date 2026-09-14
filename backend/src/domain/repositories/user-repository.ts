import type { CreateUserInput, UpdateProfileInput, UpdateUserInput, User } from '../entities/user'

export interface UserRepository {
  findAll(): Promise<User[]>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(input: CreateUserInput): Promise<User>
  update(id: string, input: UpdateUserInput): Promise<User | null>
  updateProfile(id: string, input: UpdateProfileInput): Promise<User | null>
  delete(id: string): Promise<boolean>
}
