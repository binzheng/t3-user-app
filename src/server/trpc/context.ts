import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { UserRepository } from "@/server/application/ports/user-repository";
import type { FacilityRepository } from "@/server/application/ports/facility-repository";
import { PrismaUserRepository } from "@/server/infrastructure/prisma/prisma-user-repository";
import { PrismaFacilityRepository } from "@/server/infrastructure/prisma/prisma-facility-repository";
import { prisma } from "@/server/infrastructure/prisma/client";
import type { TrpcContext } from "./trpc";

interface ContextDeps {
  userRepo?: UserRepository;
  facilityRepo?: FacilityRepository;
}

const buildContext = (deps?: ContextDeps): TrpcContext => ({
  userRepo: deps?.userRepo ?? new PrismaUserRepository(prisma),
  facilityRepo: deps?.facilityRepo ?? new PrismaFacilityRepository(prisma)
});

export const createFastifyContextFactory = (deps?: ContextDeps) => {
  return async (_opts: CreateFastifyContextOptions): Promise<TrpcContext> => buildContext(deps);
};

export const createFetchContext = async (
  _opts: FetchCreateContextFnOptions
): Promise<TrpcContext> => buildContext();
