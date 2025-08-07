import { memberToPermissionGroups } from "../db/schema";
import { auth } from "../lib/auth";
import { organizationProcedure, protectedProcedure, router } from "../lib/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const userRouter = router({
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    return {
      ...ctx.session.user,
      activeOrganizationId: ctx.session.session.activeOrganizationId,
    };
  }),

  inviteUser: organizationProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await auth.api.createInvitation({
        headers: ctx.headers,
        body: {
          email: input.email,
          role: "admin",
          organizationId: ctx.organizationId,
        },
      });
      return { success: true };
    }),

  removeUser: organizationProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await auth.api.removeMember({
        headers: ctx.headers,
        body: {
          memberIdOrEmail: input.userId,
          organizationId: ctx.organizationId,
        },
      });
      return { success: true };
    }),

  getAllInvitations: protectedProcedure.query(async ({ ctx }) => {
    const invites = await ctx.db.query.invitation.findMany({
      columns: {
        organizationId: false,
        inviterId: false,
      },
      where: (invitation, { eq, and }) =>
        and(
          eq(invitation.email, ctx.session.user.email),
          eq(invitation.status, "pending"),
        ),
      with: {
        organization: {
          columns: {
            name: true,
          },
        },
        inviter: {
          columns: {
            name: true,
          },
        },
      },
    });
    return invites;
  }),

  acceptInvitation: protectedProcedure
    .input(
      z.object({
        invitationId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.session.activeOrganizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "User must not be in an existing organization to accept another one.",
        });
      }
      const acceptedInvitation = await auth.api.acceptInvitation({
        headers: ctx.headers,
        body: {
          invitationId: input.invitationId,
        },
      });

      if (!acceptedInvitation) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to accept invitation.",
        });
      }
      const defaultPermissionGroups =
        await ctx.db.query.permissionGroups.findMany({
          where: (permissionGroup, { eq, and }) =>
            and(
              eq(permissionGroup.isDefault, true),
              eq(
                permissionGroup.organizationId,
                acceptedInvitation.member.organizationId,
              ),
            ),
          columns: {
            id: true,
          },
        });
      const valuesToInsert = defaultPermissionGroups.map(
        (defaultPermission) => ({
          memberId: acceptedInvitation.member.id,
          permissionGroupId: defaultPermission.id,
        }),
      );
      ctx.db.insert(memberToPermissionGroups).values(valuesToInsert);
      return { success: true };
    }),

  declineInvitation: protectedProcedure
    .input(
      z.object({
        invitationId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await auth.api.rejectInvitation({
        headers: ctx.headers,
        body: {
          invitationId: input.invitationId,
        },
      });
      return { success: true };
    }),

  leaveOrganization: organizationProcedure.mutation(async ({ ctx }) => {
    const organizationId = ctx.session.session.activeOrganizationId;
    if (!organizationId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Unable to find organization.",
      });
    }

    const removedUser = await auth.api.removeMember({
      headers: ctx.headers,
      body: {
        memberIdOrEmail: ctx.session.user.id,
        organizationId,
      },
    });

    if (!removedUser) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to remove organization from user.",
      });
    }
    return { success: true };
  }),
});

export default userRouter;
