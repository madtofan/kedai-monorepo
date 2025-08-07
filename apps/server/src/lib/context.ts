import type { Context as HonoContext } from "hono";
import { auth } from "./auth";
import { db } from "../db";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });
  return {
    headers: context.req.raw.headers,
    db,
    session,
  };
}


export type Context = Awaited<ReturnType<typeof createContext>>;
