import type { FacilityCategory, FacilityStatus } from "@/domain/entities/facility";

export const TABLE_ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

export const CSV_HEADERS = [
  "施設コード",
  "施設名称",
  "種別",
  "ステータス",
  "都道府県",
  "市区町村",
  "代表電話",
  "代表メール"
];

export const parseCategoryFilter = (value: string): "ALL" | FacilityCategory =>
  value === "ALL" ? "ALL" : (value as FacilityCategory);

export const parseStatusFilter = (value: string): "ALL" | FacilityStatus =>
  value === "ALL" ? "ALL" : (value as FacilityStatus);
