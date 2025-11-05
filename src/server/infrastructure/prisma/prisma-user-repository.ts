import { Prisma, type PrismaClient, type User as PrismaUser } from "@prisma/client";
import type { User, UserRole, UserStatus } from "@/domain/entities/user";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserRepository,
  SearchUsersInput
} from "../../application/ports/user-repository";

const toDomain = (user: PrismaUser): User => ({
  id: user.id,
  email: user.email,
  name: user.name,
  nameKana: user.nameKana,
  role: user.role as UserRole,
  status: user.status as UserStatus,
  phoneNumber: user.phoneNumber,
  department: user.department,
  title: user.title,
  image: user.image,
  note: user.note,
  lastLoginAt: user.lastLoginAt,
  mfaEnabled: user.mfaEnabled,
  isLocked: user.isLocked,
  createdBy: user.createdBy,
  updatedBy: user.updatedBy,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? toDomain(user) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return users.map(toDomain);
  }

  async search(input: SearchUsersInput): Promise<User[]> {
    const where: Prisma.UserWhereInput = {};

    if (input.keyword) {
      where.OR = [
        { name: { contains: input.keyword, mode: "insensitive" } },
        { email: { contains: input.keyword, mode: "insensitive" } },
        { department: { contains: input.keyword, mode: "insensitive" } }
      ];
    }

    if (input.role) {
      where.role = input.role;
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });
    
    return users.map(toDomain);
  }

  async create(data: CreateUserInput): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data: {
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
          updatedBy: data.updatedBy ?? null
        }
      });
      return toDomain(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("EMAIL_ALREADY_EXISTS");
      }
      throw error;
    }
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          name: data.name,
          nameKana: data.nameKana === undefined ? undefined : data.nameKana,
          role: data.role,
          status: data.status,
          phoneNumber: data.phoneNumber === undefined ? undefined : data.phoneNumber,
          department: data.department === undefined ? undefined : data.department,
          title: data.title === undefined ? undefined : data.title,
          image: data.image === undefined ? undefined : data.image,
          note: data.note === undefined ? undefined : data.note,
          lastLoginAt: data.lastLoginAt === undefined ? undefined : data.lastLoginAt,
          mfaEnabled: data.mfaEnabled === undefined ? undefined : data.mfaEnabled,
          isLocked: data.isLocked === undefined ? undefined : data.isLocked,
          updatedBy: data.updatedBy === undefined ? undefined : data.updatedBy
        }
      });
      return toDomain(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new Error("USER_NOT_FOUND");
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new Error("USER_NOT_FOUND");
      }
      throw error;
    }
  }
}
