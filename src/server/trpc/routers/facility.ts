import { z } from "zod";
import {
  FACILITY_CATEGORIES,
  FACILITY_STATUSES,
  type FacilityCategory,
  type FacilityStatus
} from "@/domain/entities/facility";
import { CreateFacilityUseCase } from "@/server/application/use-cases/facility/create-facility";
import { ListFacilitiesUseCase } from "@/server/application/use-cases/facility/list-facilities";
import { UpdateFacilityUseCase } from "@/server/application/use-cases/facility/update-facility";
import { DeactivateFacilityUseCase } from "@/server/application/use-cases/facility/deactivate-facility";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const categoryEnum = z.enum(Object.values(FACILITY_CATEGORIES) as [FacilityCategory, ...FacilityCategory[]]);
const statusEnum = z.enum(Object.values(FACILITY_STATUSES) as [FacilityStatus, ...FacilityStatus[]]);

const optionalString = (max: number) =>
  z.preprocess(
    (value) => {
      if (value === undefined) return undefined;
      if (value === null) return undefined;
      if (typeof value === "string" && value.trim() === "") {
        return undefined;
      }
      return value;
    },
    z.string().trim().max(max).optional()
  );

const optionalNullableString = (max: number) =>
  z.preprocess(
    (value) => {
      if (value === undefined) return undefined;
      if (value === null) return null;
      if (typeof value === "string" && value.trim() === "") {
        return null;
      }
      return value;
    },
    z.string().trim().max(max).nullable().optional()
  );

const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess(
    (value) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }
      if (typeof value === "string") {
        const parsed = Number(value);
        if (Number.isNaN(parsed)) {
          return value;
        }
        return parsed;
      }
      return value;
    },
    schema.optional()
  );

const optionalNullableNumber = (schema: z.ZodNumber) =>
  z.preprocess(
    (value) => {
      if (value === undefined) return undefined;
      if (value === null || value === "") {
        return null;
      }
      if (typeof value === "string") {
        const parsed = Number(value);
        if (Number.isNaN(parsed)) {
          return value;
        }
        return parsed;
      }
      return value;
    },
    schema.nullable().optional()
  );

const optionalDate = (allowNull = false) =>
  z.preprocess(
    (value) => {
      if (value === undefined) return undefined;
      if (value === null) return allowNull ? null : undefined;
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) {
          return allowNull ? null : undefined;
        }
        const normalized = /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? `${trimmed}T00:00:00Z` : trimmed;
        const date = new Date(normalized);
        if (Number.isNaN(date.getTime())) {
          return value;
        }
        return date;
      }
      if (value instanceof Date) {
        return value;
      }
      return value;
    },
    allowNull ? z.date().nullable().optional() : z.date().optional()
  );

const postalCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{3}-?\d{4}$/, "郵便番号は 123-4567 の形式で入力してください")
  .optional();

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9+\-() ]+$/, "電話番号の形式が不正です")
  .max(30)
  .optional();

const emailSchema = z.string().trim().email().optional();

const createFacilitySchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "施設コードは必須です")
    .max(16)
    .regex(/^[A-Za-z0-9-]+$/, "施設コードは英数字とハイフンのみ利用できます"),
  name: z.string().trim().min(1, "施設名称は必須です").max(100),
  nameKana: optionalString(100),
  category: categoryEnum,
  status: statusEnum,
  startDate: optionalDate(),
  endDate: optionalDate(),
  country: optionalString(2),
  prefecture: optionalString(100),
  city: optionalString(100),
  addressLine1: optionalString(200),
  postalCode: postalCodeSchema,
  latitude: optionalNumber(z.number().min(-90).max(90)),
  longitude: optionalNumber(z.number().min(-180).max(180)),
  phoneNumber: phoneSchema,
  email: emailSchema,
  contactName: optionalString(100),
  contactPhone: phoneSchema,
  contactEmail: emailSchema,
  capacity: optionalNumber(z.number().int().min(0)),
  note: optionalString(500),
  imageUrl: optionalString(200),
  syncedAt: optionalDate(),
  createdBy: optionalString(50),
  updatedBy: optionalString(50),
  isIntegrated: z.boolean().optional(),
  displayOrder: optionalNumber(z.number().int().min(0)),
  billingCode: optionalString(32)
});

const updateFacilitySchema = z
  .object({
    id: z.string().uuid(),
    name: optionalString(100),
    nameKana: optionalNullableString(100),
    category: categoryEnum.optional(),
    status: statusEnum.optional(),
    startDate: optionalDate(true),
    endDate: optionalDate(true),
    country: optionalNullableString(2),
    prefecture: optionalNullableString(100),
    city: optionalNullableString(100),
    addressLine1: optionalNullableString(200),
    postalCode: optionalNullableString(8),
    latitude: optionalNullableNumber(z.number().min(-90).max(90)),
    longitude: optionalNullableNumber(z.number().min(-180).max(180)),
    phoneNumber: optionalNullableString(30),
    email: optionalNullableString(100),
    contactName: optionalNullableString(100),
    contactPhone: optionalNullableString(30),
    contactEmail: optionalNullableString(100),
    capacity: optionalNullableNumber(z.number().int().min(0)),
    note: optionalNullableString(500),
    imageUrl: optionalNullableString(200),
    syncedAt: optionalDate(true),
    updatedBy: optionalNullableString(50),
    isIntegrated: z.boolean().optional(),
    displayOrder: optionalNullableNumber(z.number().int().min(0)),
    billingCode: optionalNullableString(32)
  })
  .refine(
    (data) =>
      Object.keys(data).some(
        (key) => key !== "id" && data[key as keyof typeof data] !== undefined
      ),
    {
      message: "更新項目を少なくとも1つ指定してください",
      path: ["id"]
    }
  );

const deactivateFacilitySchema = z.object({
  id: z.string().uuid(),
  endDate: optionalDate(true)
});

export const facilityRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const useCase = new ListFacilitiesUseCase(ctx.facilityRepo);
    return useCase.execute();
  }),
  create: publicProcedure.input(createFacilitySchema).mutation(async ({ ctx, input }) => {
    const useCase = new CreateFacilityUseCase(ctx.facilityRepo);
    try {
      return await useCase.execute({
        code: input.code,
        name: input.name,
        nameKana: input.nameKana ?? undefined,
        category: input.category,
        status: input.status,
        startDate: input.startDate,
        endDate: input.endDate,
        country: input.country ?? undefined,
        prefecture: input.prefecture ?? undefined,
        city: input.city ?? undefined,
        addressLine1: input.addressLine1 ?? undefined,
        postalCode: input.postalCode,
        latitude: input.latitude,
        longitude: input.longitude,
        phoneNumber: input.phoneNumber,
        email: input.email,
        contactName: input.contactName ?? undefined,
        contactPhone: input.contactPhone ?? undefined,
        contactEmail: input.contactEmail ?? undefined,
        capacity: input.capacity,
        note: input.note ?? undefined,
        imageUrl: input.imageUrl ?? undefined,
        syncedAt: input.syncedAt,
        createdBy: input.createdBy ?? undefined,
        updatedBy: input.updatedBy ?? undefined,
        isIntegrated: input.isIntegrated ?? undefined,
        displayOrder: input.displayOrder,
        billingCode: input.billingCode ?? undefined
      });
    } catch (error) {
      if (error instanceof Error && error.message === "FACILITY_CODE_EXISTS") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "同じ施設コードのレコードが既に存在します"
        });
      }
      throw error;
    }
  }),
  update: publicProcedure.input(updateFacilitySchema).mutation(async ({ ctx, input }) => {
    const useCase = new UpdateFacilityUseCase(ctx.facilityRepo);
    try {
      return await useCase.execute(input.id, {
        name: input.name,
        nameKana: input.nameKana,
        category: input.category,
        status: input.status,
        startDate: input.startDate,
        endDate: input.endDate,
        country: input.country,
        prefecture: input.prefecture,
        city: input.city,
        addressLine1: input.addressLine1,
        postalCode: input.postalCode ?? undefined,
        latitude: input.latitude,
        longitude: input.longitude,
        phoneNumber: input.phoneNumber ?? undefined,
        email: input.email ?? undefined,
        contactName: input.contactName,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail,
        capacity: input.capacity,
        note: input.note,
        imageUrl: input.imageUrl,
        syncedAt: input.syncedAt,
        updatedBy: input.updatedBy,
        isIntegrated: input.isIntegrated,
        displayOrder: input.displayOrder,
        billingCode: input.billingCode
      });
    } catch (error) {
      if (error instanceof Error && error.message === "FACILITY_NOT_FOUND") {
        throw new TRPCError({ code: "NOT_FOUND", message: "施設が見つかりません" });
      }
      if (error instanceof Error && error.message === "FACILITY_CODE_EXISTS") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "同じ施設コードのレコードが既に存在します"
        });
      }
      throw error;
    }
  }),
  deactivate: publicProcedure.input(deactivateFacilitySchema).mutation(async ({ ctx, input }) => {
    const useCase = new DeactivateFacilityUseCase(ctx.facilityRepo);
    try {
      return await useCase.execute(input.id, input.endDate ?? null);
    } catch (error) {
      if (error instanceof Error && error.message === "FACILITY_NOT_FOUND") {
        throw new TRPCError({ code: "NOT_FOUND", message: "施設が見つかりません" });
      }
      throw error;
    }
  })
});
