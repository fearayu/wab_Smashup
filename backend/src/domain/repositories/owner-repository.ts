import type { CreateOwnerInput, Owner, UpdateOwnerInput } from '../entities/owner'

export interface OwnerRepository {
  findById(id: string): Promise<Owner | null>
  findByEmail(email: string): Promise<Owner | null>
  getPasswordHash(id: string): Promise<string | null>
  create(input: CreateOwnerInput & { passwordHash: string }): Promise<Owner>
  update(id: string, input: UpdateOwnerInput): Promise<Owner | null>
  delete(id: string): Promise<boolean>
}
