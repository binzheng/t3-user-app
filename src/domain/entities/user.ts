export const USER_STATUSES = {
  ACTIVE: "ACTIVE",
  INVITED: "INVITED",
  DISABLED: "DISABLED"
} as const;

export const USER_ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  USER: "USER"
} as const;

export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES];
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface User {
  id: string;
  email: string;
  name: string;
  nameKana?: string | null;
  role: UserRole;
  status: UserStatus;
  phoneNumber?: string | null;
  department?: string | null;
  title?: string | null;
  image?: string | null;
  note?: string | null;
  lastLoginAt?: Date | null;
  mfaEnabled: boolean;
  isLocked: boolean;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
