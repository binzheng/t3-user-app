import type { Facility, FacilityCategory, FacilityStatus } from "@/domain/entities/facility";
import type { FacilityRepository } from "../../ports/facility-repository";

export interface ListFacilitiesInput {
  keyword?: string;
  category?: FacilityCategory;
  status?: FacilityStatus;
}

export class ListFacilitiesUseCase {
  constructor(private readonly facilityRepo: FacilityRepository) {}

  async execute(input?: ListFacilitiesInput): Promise<Facility[]> {
    if (!input || (!input.keyword && !input.category && !input.status)) {
      return this.facilityRepo.findAll();
    }
    
    return this.facilityRepo.search(input);
  }
}
