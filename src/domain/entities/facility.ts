export const FACILITY_STATUSES = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
  CLOSED: "CLOSED"
} as const;

export const FACILITY_CATEGORIES = {
  HEAD: "HEAD",
  BRANCH: "BRANCH",
  WAREHOUSE: "WAREHOUSE",
  STORE: "STORE",
  OTHER: "OTHER"
} as const;

export type FacilityStatus = (typeof FACILITY_STATUSES)[keyof typeof FACILITY_STATUSES];
export type FacilityCategory = (typeof FACILITY_CATEGORIES)[keyof typeof FACILITY_CATEGORIES];

export interface Facility {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
  isIntegrated: boolean;
  displayOrder?: number | null;
  billingCode?: string | null;
}
