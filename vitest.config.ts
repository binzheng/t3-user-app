import { defineConfig } from "vitest/config";
import path from "node:path";

const resolveFromRoot = (relativePath: string) => path.resolve(__dirname, relativePath);

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    environmentMatchGlobs: [["tests/frontend/**", "jsdom"]]
  },
  resolve: {
    alias: {
      "@/app": resolveFromRoot("src/app"),
      "@/presentation": resolveFromRoot("src/presentation"),
      "@/domain": resolveFromRoot("src/domain"),
      "@/application": resolveFromRoot("src/application"),
      "@/infrastructure": resolveFromRoot("src/infrastructure"),
      "@/server": resolveFromRoot("src/server")
    }
  }
});
