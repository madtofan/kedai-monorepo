import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import { auth } from "./auth";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No session",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

/**
 * Organization (authenticated with existing organization) procedure
 *
 * This guarantees that the user has logged in and the user has an existing organization, and the userId can be obtained from ctx.user.userId
 */
export const organizationProcedure = protectedProcedure.use(async (opts) => {
  let organizationId = opts.ctx.session.session.activeOrganizationId;
  if (!organizationId) {
    organizationId = (
      await opts.ctx.db.query.user.findFirst({
        where: (usr, { eq }) => eq(usr.id, opts.ctx.session.user.id),
        columns: {
          id: false,
          name: false,
          email: false,
          emailVerified: false,
          image: false,
          createdAt: false,
          updatedAt: false,
        },
        with: {
          members: {
            columns: {
              organizationId: true,
            },
          },
        },
      })
    )?.members.find(Boolean)?.organizationId;
    if (!organizationId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User must be in an existing to perform this operation.",
      });
    }

    await auth.api.setActiveOrganization({
      headers: opts.ctx.headers,
      body: {
        organizationId,
      },
    });
  }

  return opts.next({
    ctx: {
      organizationId,
    },
  });
});
