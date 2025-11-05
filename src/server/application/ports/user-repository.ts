import type { User, UserRole } from "@/domain/entities/user";

export interface SearchUsersInput {
  keyword?: string;
  role?: UserRole;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  search(input: SearchUsersInput): Promise<User[]>;
  create(data: CreateUserInput): Promise<User>;
  update(id: string, data: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface CreateUserInput {
  email: string;
  name: string;
  nameKana?: string | null;
  role: User["role"];
  status: User["status"];
  phoneNumber?: string | null;
  department?: string | null;
  title?: string | null;
  image?: string | null;
  note?: string | null;
  lastLoginAt?: Date | null;
  mfaEnabled?: boolean;
  isLocked?: boolean;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface UpdateUserInput {
  name?: string;
  nameKana?: string | null;
  role?: User["role"];
  status?: User["status"];
  phoneNumber?: string | null;
  department?: string | null;
  title?: string | null;
  image?: string | null;
  note?: string | null;
  lastLoginAt?: Date | null;
  mfaEnabled?: boolean;
  isLocked?: boolean;
  updatedBy?: string | null;
}
