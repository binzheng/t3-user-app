import type { Facility } from "@/domain/entities/facility";
import type { FacilityRepository } from "../../ports/facility-repository";

export class DeactivateFacilityUseCase {
  constructor(private readonly facilityRepo: FacilityRepository) {}

  async execute(id: string, endDate?: Date | null): Promise<Facility> {
    return this.facilityRepo.deactivate(id, endDate ?? null);
  }
}
