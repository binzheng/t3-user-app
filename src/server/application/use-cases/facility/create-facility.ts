import type { Facility } from "@/domain/entities/facility";
import type { CreateFacilityInput, FacilityRepository } from "../../ports/facility-repository";

export class CreateFacilityUseCase {
  constructor(private readonly facilityRepo: FacilityRepository) {}

  async execute(input: CreateFacilityInput): Promise<Facility> {
    return this.facilityRepo.create(input);
  }
}
