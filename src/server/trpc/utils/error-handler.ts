import { TRPCError } from "@trpc/server";

/**
 * ユースケースから投げられるエラーをTRPCErrorに変換する
 */
export function handleUseCaseError(error: unknown): never {
  if (error instanceof Error) {
    switch (error.message) {
      case "USER_NOT_FOUND":
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ユーザーが見つかりません"
        });
      case "EMAIL_ALREADY_EXISTS":
        throw new TRPCError({
          code: "CONFLICT",
          message: "このメールアドレスは既に登録されています"
        });
      case "FACILITY_NOT_FOUND":
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "施設が見つかりません"
        });
      case "FACILITY_CODE_EXISTS":
        throw new TRPCError({
          code: "CONFLICT",
          message: "同じ施設コードのレコードが既に存在します"
        });
      default:
        console.error("Unhandled use case error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "予期しないエラーが発生しました"
        });
    }
  }
  throw error;
}
