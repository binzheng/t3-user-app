import type { User } from "@/domain/entities/user";
import type { UpdateUserInput, UserRepository } from "../../ports/user-repository";

export class UpdateUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(id: string, input: UpdateUserInput): Promise<User> {
    return this.userRepo.update(id, input);
  }
}
