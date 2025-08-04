import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { organizationProcedure, protectedProcedure, router } from "@/lib/trpc";
import { auth } from "@/lib/auth";
import slug from "slug";
import { memberToPermissionGroups, menuGroups, permissionGroups, stores } from "@/db/schema";

const organizationRouter = router({
  createOrganization: protectedProcedure
    .input(
      z.object({
        organizationName: z.string().trim().min(1),
        storeName: z.string().trim().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.session.activeOrganizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "User must not be in an existing organization to create one.",
        });
      }

      const createdOrganization = await auth.api.createOrganization({
        headers: ctx.headers,
        body: {
          name: input.organizationName,
          slug: slug(input.organizationName),
        },
      });

      if (!createdOrganization) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create organization",
        });
      }

      const adminRole = (
        await ctx.db
          .insert(permissionGroups)
          .values({
            name: "admin",
            isAdmin: true,
            organizationId: createdOrganization.id,
          })
          .returning()
      ).find(Boolean);

      if (!adminRole) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create organization role",
        });
      }

      const addedMember = createdOrganization.members.find(Boolean);

      if (!addedMember) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add self to organization.",
        });
      }

      const createdMemberToPermissionGroups = ctx.db
        .insert(memberToPermissionGroups)
        .values({
          memberId: addedMember.id,
          permissionGroupId: adminRole.id,
        });

      const createdStores = ctx.db.insert(stores).values({
        organizationId: createdOrganization.id,
        name: input.storeName,
        slug: slug(input.storeName),
      });

      const createdPermissionGroups = ctx.db.insert(permissionGroups).values({
        name: "member",
        organizationId: createdOrganization.id,
        isDefault: true,
      });

      const createdMenuGroups = ctx.db.insert(menuGroups).values([
        {
          organizationId: createdOrganization.id,
          name: "Food",
        },
        {
          organizationId: createdOrganization.id,
          name: "Drinks",
        },
      ]);

      await Promise.all([
        createdMemberToPermissionGroups,
        createdStores,
        createdPermissionGroups,
        createdMenuGroups,
      ]).catch(() => {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add necessary additions to organization",
        });
      });

      const { id: _id, ...response } = createdOrganization;
      return response;
    }),

  deleteOrganization: organizationProcedure.mutation(async ({ ctx }) => {
    const deletedOrganization = await auth.api.deleteOrganization({
      headers: ctx.headers,
      body: {
        organizationId: ctx.organizationId,
      },
    });
    if (!deletedOrganization) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete organization.",
      });
    }
    return { success: true };
  }),

  getOrganization: organizationProcedure.query(async ({ ctx }) => {
    const userOrganization = await ctx.db.query.organization.findFirst({
      columns: { id: false },
      where: (org, { eq }) => eq(org.id, ctx.organizationId),
      with: {
        members: {
          columns: {
            id: false,
            organizationId: false,
            userId: false,
            role: false,
            createdAt: false,
          },
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            roles: {
              columns: {
                id: false,
                memberId: false,
                permissionGroupId: false,
                createdAt: false,
                updatedAt: false,
              },
              with: {
                permissionGroup: {
                  columns: {
                    name: true,
                  },
                  with: {
                    permissions: {
                      columns: {
                        id: false,
                        permissionGroupId: false,
                        permissionId: false,
                        createdAt: false,
                        updatedAt: false,
                      },
                      with: {
                        permission: {
                          columns: {
                            displayName: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!userOrganization) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to retrieve organization.",
      });
    }
    return userOrganization;
  }),
});

export default organizationRouter;
