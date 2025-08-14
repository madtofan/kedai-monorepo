import { S3Client } from "@aws-sdk/client-s3";
import { env } from "cloudflare:workers";

export const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.CLOUDFLARE_R2_ID,
    secretAccessKey: env.CLOUDFLARE_R2_TOKEN,
  },
});
