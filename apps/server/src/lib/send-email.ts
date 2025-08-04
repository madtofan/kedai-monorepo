"server-only";

import { betterFetch } from "@better-fetch/fetch";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { ctx } = getCloudflareContext();

  ctx.waitUntil(
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
    ),
  );
}
