/**
 * 値をoptional型に変換するヘルパー
 * 空文字列やnullをundefinedに変換
 */
export const toOptional = <T>(value?: T | null): T | undefined => {
  if (value == null) return undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? (trimmed as T) : undefined;
  }
  return value;
};

/**
 * 値をnullable型に変換するヘルパー
 * undefinedは変更なし、空文字列はnullに変換
 */
export const toNullable = <T>(value?: T | null): T | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? (trimmed as T) : null;
  }
  return value;
};

/**
 * 数値をoptional型に変換するヘルパー
 * 文字列から数値へのパースも行う
 */
export const toOptionalNumber = (value?: string | number | null): number | undefined => {
  if (value == null) return undefined;
  if (typeof value === "number") return value;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
};

/**
 * 数値をnullable型に変換するヘルパー
 * 文字列から数値へのパースも行う
 */
export const toNullableNumber = (value?: string | number | null): number | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "number") return value;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * 日付文字列をDateオブジェクトに変換するヘルパー
 */
export const toDateValue = (value?: string): Date | undefined => {
  if (!value) return undefined;
  return new Date(`${value}T00:00:00Z`);
};

/**
 * 日付文字列をnullableなDateオブジェクトに変換するヘルパー
 */
export const toDateOrNull = (value?: string | null): Date | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (value.trim().length === 0) return null;
  return new Date(`${value}T00:00:00Z`);
};
