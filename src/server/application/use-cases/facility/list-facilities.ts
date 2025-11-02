import type { Facility } from "@/domain/entities/facility";
import type { FacilityRepository } from "../../ports/facility-repository";

export class ListFacilitiesUseCase {
  constructor(private readonly facilityRepo: FacilityRepository) {}

  async execute(): Promise<Facility[]> {
    return this.facilityRepo.findAll();
  }
}
