import { NextRequest } from "next/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/trpc/router";
import { createFetchContext } from "@/server/trpc/context";

export const runtime = "nodejs";

const handler = async (request: NextRequest) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("[tRPC] query input", request.nextUrl.searchParams.get("input"));

    if (request.method === "POST") {
      // const bodyPreview = await request.clone().text();
      // console.log("[tRPC] request body", bodyPreview);
    }
  }
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: createFetchContext
  })
  console.log(response);
  return response;
};

export { handler as GET, handler as POST };
