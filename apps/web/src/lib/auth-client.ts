import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client"
import { organizationClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  plugins: [
    organizationClient(),
    stripeClient({
      subscription: true //if you want to enable subscription management
    })
  ],
  baseURL:
    process.env.NEXT_PUBLIC_SERVER_URL,
});
