import { randomUUID } from "node:crypto";
import { describe, it, expect, beforeEach } from "vitest";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserRepository,
  SearchUsersInput
} from "@/server/application/ports/user-repository";
import type { User } from "@/domain/entities/user";
import { USER_ROLES, USER_STATUSES } from "@/domain/entities/user";
import { CreateUserUseCase } from "@/server/application/use-cases/user/create-user";
import { UpdateUserUseCase } from "@/server/application/use-cases/user/update-user";
import { DeleteUserUseCase } from "@/server/application/use-cases/user/delete-user";
import { ListUsersUseCase } from "@/server/application/use-cases/user/list-users";

class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  constructor(initialUsers: User[] = []) {
    this.users = [...initialUsers];
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async search(input: SearchUsersInput): Promise<User[]> {
    let results = [...this.users];

    if (input.keyword) {
      const keyword = input.keyword.toLowerCase();
      results = results.filter(
        (user) =>
          user.name.toLowerCase().includes(keyword) ||
          user.email.toLowerCase().includes(keyword) ||
          (user.department && user.department.toLowerCase().includes(keyword))
      );
    }

    if (input.role) {
      results = results.filter((user) => user.role === input.role);
    }

    return results;
  }

  async create(data: CreateUserInput): Promise<User> {
    const exists = this.users.some((user) => user.email === data.email);
    if (exists) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const user: User = {
      id: randomUUID(),
      email: data.email,
      name: data.name,
      nameKana: data.nameKana ?? null,
      role: data.role,
      status: data.status,
      phoneNumber: data.phoneNumber ?? null,
      department: data.department ?? null,
      title: data.title ?? null,
      image: data.image ?? null,
      note: data.note ?? null,
      lastLoginAt: data.lastLoginAt ?? null,
      mfaEnabled: data.mfaEnabled ?? false,
      isLocked: data.isLocked ?? false,
      createdBy: data.createdBy ?? null,
      updatedBy: data.updatedBy ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.push(user);
    return user;
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const target = this.users.find((user) => user.id === id);
    if (!target) {
      throw new Error("USER_NOT_FOUND");
    }

    const updated: User = {
      ...target,
      name: data.name ?? target.name,
      nameKana: data.nameKana === undefined ? target.nameKana ?? null : data.nameKana,
      role: data.role ?? target.role,
      status: data.status ?? target.status,
      phoneNumber: data.phoneNumber === undefined ? target.phoneNumber ?? null : data.phoneNumber,
      department: data.department === undefined ? target.department ?? null : data.department,
      title: data.title === undefined ? target.title ?? null : data.title,
      image: data.image === undefined ? target.image ?? null : data.image,
      note: data.note === undefined ? target.note ?? null : data.note,
      lastLoginAt: data.lastLoginAt === undefined ? target.lastLoginAt ?? null : data.lastLoginAt,
      mfaEnabled: data.mfaEnabled ?? target.mfaEnabled,
      isLocked: data.isLocked ?? target.isLocked,
      updatedBy: data.updatedBy === undefined ? target.updatedBy ?? null : data.updatedBy,
      updatedAt: new Date()
    };

    this.users = this.users.map((user) => (user.id === id ? updated : user));
    return updated;
  }

  async delete(id: string): Promise<void> {
    const exists = this.users.some((user) => user.id === id);
    if (!exists) {
      throw new Error("USER_NOT_FOUND");
    }

    this.users = this.users.filter((user) => user.id !== id);
  }
}

describe("User use cases", () => {
  let repo: InMemoryUserRepository;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
  });

  it("creates a user successfully", async () => {
    const useCase = new CreateUserUseCase(repo);

    const user = await useCase.execute({
      email: "test@example.com",
      name: "テストユーザー",
      role: USER_ROLES.MANAGER,
      status: USER_STATUSES.ACTIVE,
      image: null
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe("test@example.com");
    expect(await repo.findAll()).toHaveLength(1);
  });

  it("throws when creating a user with duplicate email", async () => {
    const useCase = new CreateUserUseCase(repo);

    await useCase.execute({
      email: "duplicate@example.com",
      name: "ユーザーA",
      role: USER_ROLES.USER,
      status: USER_STATUSES.INVITED,
      image: null
    });

    await expect(
      useCase.execute({
        email: "duplicate@example.com",
        name: "ユーザーB",
        role: USER_ROLES.ADMIN,
        status: USER_STATUSES.ACTIVE,
        image: null
      })
    ).rejects.toThrowError(/EMAIL_ALREADY_EXISTS/);
  });

  it("lists all users", async () => {
    const createUseCase = new CreateUserUseCase(repo);
    await createUseCase.execute({
      email: "one@example.com",
      name: "ユーザー1",
      role: USER_ROLES.ADMIN,
      status: USER_STATUSES.ACTIVE,
      image: null
    });
    await createUseCase.execute({
      email: "two@example.com",
      name: "ユーザー2",
      role: USER_ROLES.USER,
      status: USER_STATUSES.INVITED,
      image: null
    });

    const listUseCase = new ListUsersUseCase(repo);
    const users = await listUseCase.execute();

    expect(users).toHaveLength(2);
    expect(users.map((user) => user.email)).toEqual([
      "one@example.com",
      "two@example.com"
    ]);
  });

  it("updates an existing user", async () => {
    const createUseCase = new CreateUserUseCase(repo);
    const created = await createUseCase.execute({
      email: "update@example.com",
      name: "ユーザー",
      role: USER_ROLES.USER,
      status: USER_STATUSES.ACTIVE,
      image: null
    });

    const updateUseCase = new UpdateUserUseCase(repo);
    const updated = await updateUseCase.execute(created.id, {
      name: "更新済みユーザー",
      role: USER_ROLES.MANAGER
    });

    expect(updated.name).toBe("更新済みユーザー");
    expect(updated.role).toBe(USER_ROLES.MANAGER);
  });

  it("throws when updating non-existing user", async () => {
    const updateUseCase = new UpdateUserUseCase(repo);

    await expect(
      updateUseCase.execute(randomUUID(), {
        name: "not found"
      })
    ).rejects.toThrowError(/USER_NOT_FOUND/);
  });

  it("deletes a user", async () => {
    const createUseCase = new CreateUserUseCase(repo);
    const created = await createUseCase.execute({
      email: "delete@example.com",
      name: "削除対象",
      role: USER_ROLES.USER,
      status: USER_STATUSES.ACTIVE,
      image: null
    });

    const deleteUseCase = new DeleteUserUseCase(repo);
    await deleteUseCase.execute(created.id);

    expect(await repo.findAll()).toHaveLength(0);
  });

  it("throws when deleting non-existing user", async () => {
    const deleteUseCase = new DeleteUserUseCase(repo);

    await expect(deleteUseCase.execute(randomUUID())).rejects.toThrowError(/USER_NOT_FOUND/);
  });

  describe("search functionality", () => {
    beforeEach(async () => {
      const createUseCase = new CreateUserUseCase(repo);
      await createUseCase.execute({
        email: "alice@example.com",
        name: "Alice Smith",
        role: USER_ROLES.ADMIN,
        status: USER_STATUSES.ACTIVE,
        department: "Engineering",
        image: null
      });
      await createUseCase.execute({
        email: "bob@example.com",
        name: "Bob Jones",
        role: USER_ROLES.USER,
        status: USER_STATUSES.ACTIVE,
        department: "Sales",
        image: null
      });
      await createUseCase.execute({
        email: "charlie@example.com",
        name: "Charlie Brown",
        role: USER_ROLES.MANAGER,
        status: USER_STATUSES.ACTIVE,
        department: "Engineering",
        image: null
      });
    });

    it("searches users by keyword (name)", async () => {
      const listUseCase = new ListUsersUseCase(repo);
      const users = await listUseCase.execute({ keyword: "alice" });

      expect(users).toHaveLength(1);
      expect(users[0]?.name).toBe("Alice Smith");
    });

    it("searches users by keyword (email)", async () => {
      const listUseCase = new ListUsersUseCase(repo);
      const users = await listUseCase.execute({ keyword: "bob@" });

      expect(users).toHaveLength(1);
      expect(users[0]?.email).toBe("bob@example.com");
    });

    it("searches users by keyword (department)", async () => {
      const listUseCase = new ListUsersUseCase(repo);
      const users = await listUseCase.execute({ keyword: "engineering" });

      expect(users).toHaveLength(2);
      expect(users.map(u => u.name).sort()).toEqual(["Alice Smith", "Charlie Brown"]);
    });

    it("filters users by role", async () => {
      const listUseCase = new ListUsersUseCase(repo);
      const users = await listUseCase.execute({ role: USER_ROLES.ADMIN });

      expect(users).toHaveLength(1);
      expect(users[0]?.role).toBe(USER_ROLES.ADMIN);
    });

    it("combines keyword and role filters", async () => {
      const listUseCase = new ListUsersUseCase(repo);
      const users = await listUseCase.execute({ 
        keyword: "engineering",
        role: USER_ROLES.MANAGER
      });

      expect(users).toHaveLength(1);
      expect(users[0]?.name).toBe("Charlie Brown");
    });

    it("returns all users when no filters provided", async () => {
      const listUseCase = new ListUsersUseCase(repo);
      const users = await listUseCase.execute();

      expect(users).toHaveLength(3);
    });
  });
});
