import { z } from "zod";
import { USER_ROLES, USER_STATUSES, type UserRole, type UserStatus } from "@/domain/entities/user";
import { CreateUserUseCase } from "@/server/application/use-cases/user/create-user";
import { ListUsersUseCase } from "@/server/application/use-cases/user/list-users";
import { UpdateUserUseCase } from "@/server/application/use-cases/user/update-user";
import { DeleteUserUseCase } from "@/server/application/use-cases/user/delete-user";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { handleUseCaseError } from "../utils/error-handler";

const roleEnum = z.enum(Object.values(USER_ROLES) as [UserRole, ...UserRole[]]);
const statusEnum = z.enum(Object.values(USER_STATUSES) as [UserStatus, ...UserStatus[]]);

const optionalCreateString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value))
    .optional();

const optionalUpdateString = (max: number) =>
  z
    .union([
      z.string().trim().max(max),
      z.literal(""),
      z.null()
    ])
    .transform((value) => {
      if (value === "") {
        return null;
      }
      return value;
    })
    .optional();

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, "氏名は必須です"),
  nameKana: optionalCreateString(100),
  role: roleEnum,
  status: statusEnum,
  phoneNumber: optionalCreateString(50),
  department: optionalCreateString(100),
  title: optionalCreateString(100),
  note: optionalCreateString(500),
  image: z
    .string()
    .trim()
    .url("有効な URL を入力してください")
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value))
    .optional(),
  mfaEnabled: z.boolean().optional(),
  isLocked: z.boolean().optional()
});

const updateUserSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1).optional(),
    nameKana: optionalUpdateString(100),
    role: roleEnum.optional(),
    status: statusEnum.optional(),
    phoneNumber: optionalUpdateString(50),
    department: optionalUpdateString(100),
    title: optionalUpdateString(100),
    image: z
      .string()
      .trim()
      .url("有効な URL を入力してください")
      .or(z.literal(""))
      .or(z.null())
      .transform((value) => {
        if (value === "") {
          return null;
        }
        return value;
      })
      .optional(),
    note: optionalUpdateString(500),
    mfaEnabled: z.boolean().optional(),
    isLocked: z.boolean().optional()
  })
  .refine(
    (data) =>
      !!(
        data.name ??
        data.nameKana ??
        data.role ??
        data.status ??
        data.phoneNumber ??
        data.department ??
        data.title ??
        data.image ??
        data.note ??
        data.mfaEnabled ??
        data.isLocked
      ),
    {
    message: "更新項目を少なくとも1つ指定してください",
    path: ["name"]
  });

const listUsersSchema = z.object({
  keyword: z.string().optional(),
  role: z.union([z.literal("ALL"), roleEnum]).optional()
});

export const userRouter = createTRPCRouter({
  list: publicProcedure.input(listUsersSchema).query(async ({ ctx, input }) => {
    const useCase = new ListUsersUseCase(ctx.userRepo);
    const users = await useCase.execute({
      keyword: input.keyword,
      role: input.role === "ALL" ? undefined : input.role
    });
    return users;
  }),

  create: publicProcedure.input(createUserSchema).mutation(async ({ ctx, input }) => {
    const useCase = new CreateUserUseCase(ctx.userRepo);
    try {
      return await useCase.execute({
        email: input.email,
        name: input.name,
        nameKana: input.nameKana ?? null,
        role: input.role,
        status: input.status,
        phoneNumber: input.phoneNumber ?? null,
        department: input.department ?? null,
        title: input.title ?? null,
        image: input.image ?? null,
        note: input.note ?? null,
        mfaEnabled: input.mfaEnabled ?? undefined,
        isLocked: input.isLocked ?? undefined
      });
    } catch (error) {
      handleUseCaseError(error);
    }
  }),

  update: publicProcedure.input(updateUserSchema).mutation(async ({ ctx, input }) => {
    const useCase = new UpdateUserUseCase(ctx.userRepo);
    try {
      return await useCase.execute(input.id, {
        name: input.name,
        nameKana: input.nameKana === undefined ? undefined : input.nameKana,
        role: input.role,
        status: input.status,
        phoneNumber: input.phoneNumber === undefined ? undefined : input.phoneNumber,
        department: input.department === undefined ? undefined : input.department,
        title: input.title === undefined ? undefined : input.title,
        image: input.image === undefined ? undefined : input.image,
        note: input.note === undefined ? undefined : input.note,
        mfaEnabled: input.mfaEnabled === undefined ? undefined : input.mfaEnabled,
        isLocked: input.isLocked === undefined ? undefined : input.isLocked
      });
    } catch (error) {
      handleUseCaseError(error);
    }
  }),

  delete: publicProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const useCase = new DeleteUserUseCase(ctx.userRepo);
    try {
      await useCase.execute(input.id);
      return { success: true } as const;
    } catch (error) {
      handleUseCaseError(error);
    }
  })
});
