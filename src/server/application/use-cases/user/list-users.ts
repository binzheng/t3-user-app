import type { User } from "@/domain/entities/user";
import type { UserRepository } from "../../ports/user-repository";

export class ListUsersUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepo.findAll();
  }
}
