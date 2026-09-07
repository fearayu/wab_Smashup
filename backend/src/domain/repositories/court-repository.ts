import type { Court, CreateCourtInput, UpdateCourtInput } from '../entities/court'

export interface CourtRepository {
  findAllByVenueId(venueId: string): Promise<Court[]>
  findById(id: string): Promise<Court | null>
  create(input: CreateCourtInput & { venueId: string }): Promise<Court>
  update(id: string, input: UpdateCourtInput): Promise<Court | null>
  softDelete(id: string): Promise<boolean>
}
