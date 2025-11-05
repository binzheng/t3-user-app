import type { User, UserRole } from "@/domain/entities/user";
import type { UserRepository } from "../../ports/user-repository";

export interface ListUsersInput {
  keyword?: string;
  role?: UserRole;
}

export class ListUsersUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input?: ListUsersInput): Promise<User[]> {
    if (!input || (!input.keyword && !input.role)) {
      return this.userRepo.findAll();
    }
    
    return this.userRepo.search(input);
  }
}
