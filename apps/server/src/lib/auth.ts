import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { db } from "../db";
import * as schema from "../db/schema";
import { env } from "cloudflare:workers";
import { sendEmail } from "./send-email";
import { organization } from "better-auth/plugins";
import { reactInvitationEmail } from "./email/organization-invitation";
import { stripe } from "@better-auth/stripe"
import Stripe from "stripe"

const stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
})

const authConfig = {
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: schema,
  }),
  appName: "Kedai",
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  advanced: {
    cookiePrefix: "kedai",
    crossSubDomainCookies:
      process.env.NODE_ENV === "production"
        ? {
          enabled: true,
          domain:
            env.BETTER_AUTH_URL?.replace(
              /^https?:\/\//,
              "",
            ) ?? "",
        }
        : undefined,
  },
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendResetPassword({ user, url }) {
      sendEmail({
        to: user.email,
        subject: "RESET PASSWORD",
        html: `<a href="${url}">Reset your password</a>`,
      });
    },
  },
  emailVerification: {
    async sendVerificationEmail({ user, url }) {
      sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: `<a href="${url}">Verify your email address</a>`,
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_AUTH_ID ?? "",
      clientSecret: env.GOOGLE_AUTH_SECRET ?? "",
    },
  },
  databaseHooks: {
    user: {
      create: {
        async after(user) {
          sendEmail({
            to: user.email,
            subject: "Welcome to Kedai POS System",
            html: `<p>Welcome to the kedai POS System ${user.name}</p>`,
          });
        },
      },
    },
  },
  plugins: [
    expo(),
    organization({
      async sendInvitationEmail(data) {
        const inviteLink = `${env.BETTER_AUTH_URL}/accept-invitation/${data.id}`;

        sendEmail({
          to: data.email,
          subject: `You are invited to join ${data.organization.name}'s Kedai POS System`,
          html: await reactInvitationEmail({
            username: data.email,
            invitedByUsername: data.inviter.user.name,
            invitedByEmail: data.inviter.user.email,
            teamName: data.organization.name,
            teamImage: data.organization.logo ?? undefined,
            inviteLink,
          }),
        });
      },
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: true,
    })
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth(authConfig) as ReturnType<
  typeof betterAuth<typeof authConfig>
>;


