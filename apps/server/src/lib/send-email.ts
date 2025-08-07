"server-only";

import { betterFetch } from "@better-fetch/fetch";

export function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // TODO - implement waitUntil
  betterFetch<{ success: boolean; messageId: string; message: string }>(
    process.env.EMAIL_API_ENDPOINT ?? '',
    {
      method: "POST",
      headers: {
        "X-API-Key": process.env.EMAIL_API_KEY ?? '',
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
