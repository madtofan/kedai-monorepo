"server-only";

import { betterFetch } from "@better-fetch/fetch";
import { env } from "cloudflare:workers";

export function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  console.log({ emailHtml: html });
  // TODO - implement waitUntil
  betterFetch<{ success: boolean; messageId: string; message: string }>(
    env.EMAIL_API_ENDPOINT ?? '',
    {
      method: "POST",
      headers: {
        "X-API-Key": env.EMAIL_API_KEY ?? '',
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        subject,
        html,
      }),
    },
  );
}
