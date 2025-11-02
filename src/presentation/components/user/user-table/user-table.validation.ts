import { z } from "zod";
import { USER_ROLES, USER_STATUSES, type User, type UserRole, type UserStatus } from "@/domain/entities/user";

const roleEnum = z.enum(Object.values(USER_ROLES) as [UserRole, ...UserRole[]]);
const statusEnum = z.enum(Object.values(USER_STATUSES) as [UserStatus, ...UserStatus[]]);

const optionalCreateString = (max: number) =>
  z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed === "" ? undefined : trimmed;
      }
      return value;
    },
    z.string().max(max).optional()
  );

const optionalEditString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional();

export const createUserFormSchema = z.object({
  email: z.string().trim().min(1, "メールアドレスは必須です").email("有効なメールアドレスを入力してください"),
  name: z.string().trim().min(1, "氏名は必須です"),
  nameKana: optionalCreateString(100),
  role: roleEnum,
  status: statusEnum,
  department: optionalCreateString(100),
  title: optionalCreateString(100),
  phoneNumber: optionalCreateString(50),
  image: optionalCreateString(200),
  note: optionalCreateString(500)
});

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>;

export const editUserFormSchema = z.object({
  name: z.string().trim().min(1, "氏名は必須です"),
  nameKana: optionalEditString(100),
  role: roleEnum,
  status: statusEnum,
  department: optionalEditString(100),
  title: optionalEditString(100),
  phoneNumber: optionalEditString(50),
  image: optionalEditString(200),
  note: optionalEditString(500)
});

export type EditUserFormValues = z.infer<typeof editUserFormSchema>;

export const roleOptions = Object.values(USER_ROLES);
export const statusOptions = Object.values(USER_STATUSES);

export const createDefaultValues: Partial<CreateUserFormValues> = {
  email: "",
  name: "",
  nameKana: "",
  role: USER_ROLES.USER,
  status: USER_STATUSES.INVITED,
  department: "",
  title: "",
  phoneNumber: "",
  image: "",
  note: ""
};

export const toEditFormValues = (user: User) => ({
  name: user.name,
  nameKana: user.nameKana ?? "",
  role: user.role,
  status: user.status,
  department: user.department ?? "",
  title: user.title ?? "",
  phoneNumber: user.phoneNumber ?? "",
  image: user.image ?? "",
  note: user.note ?? ""
});

export const editDefaultValues = {
  name: "",
  nameKana: "",
  role: USER_ROLES.USER,
  status: USER_STATUSES.INVITED,
  department: "",
  title: "",
  phoneNumber: "",
  image: "",
  note: ""
} satisfies EditUserFormValues;
