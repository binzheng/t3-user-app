import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { UserRepository } from "@/server/application/ports/user-repository";
import type { FacilityRepository } from "@/server/application/ports/facility-repository";
import { ZodError } from "zod";

export interface TrpcContext {
  userRepo: UserRepository;
  facilityRepo: FacilityRepository;
}

const t = initTRPC.context<TrpcContext>().create({
  errorFormatter({ shape, error }) {
    console.log(shape);
    console.log(error);
    // shape: 通常の tRPC エラー構造
    // error: 実際に発生したエラーオブジェクト
    return {
      ...shape,
      data: {
        ...shape.data,
        // ZodError の場合は詳細を返す
        zodError:
          error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
  // transformer: superjson
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
