import type { Facility, FacilityCategory, FacilityStatus } from "@/domain/entities/facility";

export interface FacilityRepository {
  findById(id: string): Promise<Facility | null>;
  findAll(): Promise<Facility[]>;
  create(data: CreateFacilityInput): Promise<Facility>;
  update(id: string, data: UpdateFacilityInput): Promise<Facility>;
  deactivate(id: string, endDate?: Date | null): Promise<Facility>;
}

export const FACILITY_REPOSITORY = Symbol("FACILITY_REPOSITORY");

export interface CreateFacilityInput {
  code: string;
  name: string;
  nameKana?: string | null;
  category: FacilityCategory;
  status: FacilityStatus;
  startDate?: Date | null;
  endDate?: Date | null;
  country?: string | null;
  prefecture?: string | null;
  city?: string | null;
  addressLine1?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phoneNumber?: string | null;
  email?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  capacity?: number | null;
  note?: string | null;
  imageUrl?: string | null;
  syncedAt?: Date | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  isIntegrated?: boolean;
  displayOrder?: number | null;
  billingCode?: string | null;
}

export interface UpdateFacilityInput {
  name?: string;
  nameKana?: string | null;
  category?: FacilityCategory;
  status?: FacilityStatus;
  startDate?: Date | null;
  endDate?: Date | null;
  country?: string | null;
  prefecture?: string | null;
  city?: string | null;
  addressLine1?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phoneNumber?: string | null;
  email?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  capacity?: number | null;
  note?: string | null;
  imageUrl?: string | null;
  syncedAt?: Date | null;
  updatedBy?: string | null;
  isIntegrated?: boolean;
  displayOrder?: number | null;
  billingCode?: string | null;
}
