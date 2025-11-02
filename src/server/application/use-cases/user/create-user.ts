import type { User } from "@/domain/entities/user";
import type { CreateUserInput, UserRepository } from "../../ports/user-repository";

export class CreateUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    return this.userRepo.create(input);
  }
}
