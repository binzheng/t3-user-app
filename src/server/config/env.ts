import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000)
});

export type ServerEnv = z.infer<typeof serverSchema>;

export const loadServerEnv = (env: NodeJS.ProcessEnv): ServerEnv => {
  return serverSchema.parse(env);
};
