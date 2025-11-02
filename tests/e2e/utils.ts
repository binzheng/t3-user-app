const API_URL = process.env.E2E_API_URL ?? "http://localhost:3000";

export async function ensureServerRunning() {
  const candidates = ["/healthz", "/api/healthz"];

  for (const path of candidates) {
    try {
      const res = await fetch(`${API_URL}${path}`);
      if (res.ok) {
        return;
      }
    } catch {
      // try next candidate
    }
  }

  throw new Error("API server is not running. Start `pnpm dev` (and optionally dev:server) before running e2e tests.");
}
