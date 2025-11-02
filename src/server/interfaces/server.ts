import Fastify from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { loadServerEnv } from "@/server/config/env";
import { PrismaUserRepository } from "../infrastructure/prisma/prisma-user-repository";
import { prisma } from "../infrastructure/prisma/client";
import { ListUsersUseCase } from "../application/use-cases/user/list-users";
import { createFastifyContextFactory } from "../trpc/context";
import { appRouter } from "../trpc/router";

export async function createServer() {
  const app = Fastify({
    logger: true
  });

  await app.register(helmet);
  await app.register(cors, {
    origin: true,
    credentials: true
  });

  const userRepo = new PrismaUserRepository(prisma);
  const listUsers = new ListUsersUseCase(userRepo);

  await app.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext: createFastifyContextFactory({ userRepo })
    }
  });

  app.get("/healthz", async () => {
    return { status: "ok" };
  });

  app.get("/users", async () => {
    const users = await listUsers.execute();
    return { data: users };
  });

  return app;
}

if (require.main === module) {
  const env = loadServerEnv(process.env);
  createServer()
    .then((server) => server.listen({ port: env.PORT, host: "0.0.0.0" }))
    .then((address) => {
      console.log(`Backend server started on ${address}`);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
