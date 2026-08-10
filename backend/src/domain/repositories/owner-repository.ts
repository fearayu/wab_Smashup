import type { CreateOwnerInput, Owner, UpdateOwnerInput } from '../entities/owner'

export type OwnerRole = 'admin' | 'member' | 'user'

export interface OwnerRepository {
  findById(id: string): Promise<Owner | null>
  findByEmail(email: string): Promise<Owner | null>
  findAll(): Promise<Owner[]>
  getPasswordHash(id: string): Promise<string | null>
  create(input: CreateOwnerInput & { passwordHash: string }): Promise<Owner>
  update(id: string, input: UpdateOwnerInput): Promise<Owner | null>
  updateRole(id: string, role: OwnerRole): Promise<Owner | null>
  delete(id: string): Promise<boolean>
}
