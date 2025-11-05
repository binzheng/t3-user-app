import { z } from "zod";
import {
  FACILITY_CATEGORIES,
  FACILITY_STATUSES,
  type Facility,
  type FacilityCategory,
  type FacilityStatus
} from "@/domain/entities/facility";

const categoryEnum = z.enum(Object.values(FACILITY_CATEGORIES) as [FacilityCategory, ...FacilityCategory[]]);
const statusEnum = z.enum(Object.values(FACILITY_STATUSES) as [FacilityStatus, ...FacilityStatus[]]);

const optionalStringField = (max: number) =>
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

const optionalPatternField = (regex: RegExp, message: string, max: number) =>
  z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed === "" ? undefined : trimmed;
      }
      return value;
    },
    z
      .string()
      .max(max)
      .regex(regex, message)
      .optional()
  );

const optionalEmailField = z.preprocess(
  (value) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    }
    return value;
  },
  z.string().email("有効なメールアドレスを入力してください").optional()
);

const optionalDateField = z.preprocess(
  (value) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    }
    return value;
  },
  z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/u, "YYYY-MM-DD 形式で入力してください").optional()
);

const nullableStringField = (max: number) =>
  z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed === "" ? null : trimmed;
      }
      return value;
    },
    z.string().max(max).nullable().optional()
  );

const nullablePatternField = (regex: RegExp, message: string, max: number) =>
  z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed === "" ? null : trimmed;
      }
      return value;
    },
    z
      .string()
      .max(max)
      .regex(regex, message)
      .nullable()
      .optional()
  );

const nullableEmailField = z.preprocess(
  (value) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    }
    return value;
  },
  z.string().email("有効なメールアドレスを入力してください").nullable().optional()
);

const nullableDateField = z.preprocess(
  (value) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    }
    return value;
  },
  z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/u, "YYYY-MM-DD 形式で入力してください").nullable().optional()
);

export const createFacilityFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "施設コードは必須です")
    .max(16, "施設コードは16文字以内で入力してください")
    .regex(/^[A-Za-z0-9-]+$/u, "施設コードは英数字とハイフンのみ利用できます"),
  name: z.string().trim().min(1, "施設名称は必須です").max(100, "施設名称は100文字以内で入力してください"),
  nameKana: optionalStringField(100),
  category: categoryEnum,
  status: statusEnum,
  prefecture: optionalStringField(100),
  city: optionalStringField(100),
  addressLine1: optionalStringField(200),
  postalCode: optionalPatternField(/^[0-9]{3}-?[0-9]{4}$/u, "郵便番号は 123-4567 の形式で入力してください", 8),
  phoneNumber: optionalPatternField(/^[0-9+\-() ]+$/u, "電話番号の形式が不正です", 30),
  email: optionalEmailField,
  contactName: optionalStringField(100),
  contactPhone: optionalPatternField(/^[0-9+\-() ]+$/u, "電話番号の形式が不正です", 30),
  contactEmail: optionalEmailField,
  startDate: optionalDateField,
  endDate: optionalDateField,
  capacity: optionalPatternField(/^[0-9]+$/u, "数字で入力してください", 9),
  note: optionalStringField(500),
  imageUrl: optionalStringField(200),
  displayOrder: optionalPatternField(/^[0-9]+$/u, "数字で入力してください", 9),
  isIntegrated: z.boolean().optional()
});

export type CreateFacilityFormValues = z.infer<typeof createFacilityFormSchema>;

export const editFacilityFormSchema = z.object({
  name: z.string().trim().min(1, "施設名称は必須です").max(100, "施設名称は100文字以内で入力してください"),
  nameKana: nullableStringField(100),
  category: categoryEnum,
  status: statusEnum,
  prefecture: nullableStringField(100),
  city: nullableStringField(100),
  addressLine1: nullableStringField(200),
  postalCode: nullablePatternField(/^[0-9]{3}-?[0-9]{4}$/u, "郵便番号は 123-4567 の形式で入力してください", 8),
  phoneNumber: nullablePatternField(/^[0-9+\-() ]+$/u, "電話番号の形式が不正です", 30),
  email: nullableEmailField,
  contactName: nullableStringField(100),
  contactPhone: nullablePatternField(/^[0-9+\-() ]+$/u, "電話番号の形式が不正です", 30),
  contactEmail: nullableEmailField,
  startDate: nullableDateField,
  endDate: nullableDateField,
  capacity: nullablePatternField(/^[0-9]+$/u, "数字で入力してください", 9),
  note: nullableStringField(500),
  imageUrl: nullableStringField(200),
  displayOrder: nullablePatternField(/^[0-9]+$/u, "数字で入力してください", 9),
  isIntegrated: z.boolean().optional()
});

export type EditFacilityFormValues = z.infer<typeof editFacilityFormSchema>;

export const categoryOptions = Object.values(FACILITY_CATEGORIES);
export const statusOptions = Object.values(FACILITY_STATUSES);

export const createDefaultValues: Partial<CreateFacilityFormValues> = {
  code: "",
  name: "",
  nameKana: "",
  category: FACILITY_CATEGORIES.OTHER,
  status: FACILITY_STATUSES.ACTIVE,
  prefecture: "",
  city: "",
  addressLine1: "",
  postalCode: "",
  phoneNumber: "",
  email: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  startDate: "",
  endDate: "",
  capacity: "",
  note: "",
  imageUrl: "",
  displayOrder: "",
  isIntegrated: false
};

const toDateInputString = (value: unknown) => {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && value.length >= 10) {
    return value.slice(0, 10);
  }
  return "";
};

export const toEditFormValues = (facility: Facility) => ({
  name: facility.name,
  nameKana: facility.nameKana ?? "",
  category: facility.category,
  status: facility.status,
  prefecture: facility.prefecture ?? "",
  city: facility.city ?? "",
  addressLine1: facility.addressLine1 ?? "",
  postalCode: facility.postalCode ?? "",
  phoneNumber: facility.phoneNumber ?? "",
  email: facility.email ?? "",
  contactName: facility.contactName ?? "",
  contactPhone: facility.contactPhone ?? "",
  contactEmail: facility.contactEmail ?? "",
  startDate: toDateInputString(facility.startDate),
  endDate: toDateInputString(facility.endDate),
  capacity: facility.capacity != null ? facility.capacity.toString() : "",
  note: facility.note ?? "",
  imageUrl: facility.imageUrl ?? "",
  displayOrder: facility.displayOrder != null ? facility.displayOrder.toString() : "",
  isIntegrated: facility.isIntegrated
});

export const editDefaultValues: EditFacilityFormValues = {
  name: "",
  nameKana: "",
  category: FACILITY_CATEGORIES.OTHER,
  status: FACILITY_STATUSES.ACTIVE,
  prefecture: "",
  city: "",
  addressLine1: "",
  postalCode: "",
  phoneNumber: "",
  email: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  startDate: "",
  endDate: "",
  capacity: "",
  note: "",
  imageUrl: "",
  displayOrder: "",
  isIntegrated: false
};
