import type { Facility } from "@/domain/entities/facility";
import type { FacilityRepository, UpdateFacilityInput } from "../../ports/facility-repository";

export class UpdateFacilityUseCase {
  constructor(private readonly facilityRepo: FacilityRepository) {}

  async execute(id: string, input: UpdateFacilityInput): Promise<Facility> {
    return this.facilityRepo.update(id, input);
  }
}
