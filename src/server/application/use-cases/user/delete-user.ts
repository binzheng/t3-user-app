import type { UserRepository } from "../../ports/user-repository";

export class DeleteUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(id: string): Promise<void> {
    await this.userRepo.delete(id);
  }
}
