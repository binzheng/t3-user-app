import type { UserRole } from "@/domain/entities/user";

export const TABLE_ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

export const CSV_HEADERS = [
  "氏名",
  "メールアドレス",
  "権限",
  "ステータス",
  "所属部署",
  "役職",
  "電話番号"
];

export const parseRoleFilter = (value: string): "ALL" | UserRole =>
  value === "ALL" ? "ALL" : (value as UserRole);
