import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { organizationProcedure, router } from "../lib/trpc";
import { menuGroups } from "../db/schema";

const menuGroupRouter = router({
  addMenuGroup: organizationProcedure
    .input(z.object({ name: z.string().trim().min(1).max(256) }))
    .mutation(async ({ ctx, input }) => {
      const addedMenuGroup = (
        await ctx.db
          .insert(menuGroups)
          .values({
            name: input.name,
            organizationId: ctx.organizationId,
          })
          .returning()
      ).find(Boolean);
      if (!addedMenuGroup) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create organization",
        });
      }
      return addedMenuGroup;
    }),

  editMenuGroup: organizationProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().trim().min(1).max(256),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedMenuGroup = await ctx.db
        .update(menuGroups)
        .set({
          name: input.name,
        })
        .where(
          and(
            eq(menuGroups.organizationId, ctx.organizationId),
            eq(menuGroups.id, input.id),
          ),
        )
        .returning();
      if (!updatedMenuGroup) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update Menu Group",
        });
      }
      return updatedMenuGroup;
    }),

  deleteMenuGroup: organizationProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deletedMenuGroup = await ctx.db
        .delete(menuGroups)
        .where(
          and(
            eq(menuGroups.organizationId, ctx.organizationId),
            eq(menuGroups.id, input.id),
          ),
        )
        .returning();
      if (!deletedMenuGroup) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete Menu Group",
        });
      }
      return { success: true };
    }),

  getAllMenuGroup: organizationProcedure.query(async ({ ctx }) => {
    const menuGroups = await ctx.db.query.menuGroups.findMany({
      columns: { organizationId: false },
      where: (menuGroup, { eq }) =>
        eq(menuGroup.organizationId, ctx.organizationId),
    });
    return menuGroups;
  }),
});

export default menuGroupRouter;
