import { createTRPCRouter } from "./trpc";
import { userRouter } from "./routers/user";
import { facilityRouter } from "./routers/facility";

export const appRouter = createTRPCRouter({
  user: userRouter,
  facility: facilityRouter
});

export type AppRouter = typeof appRouter;
