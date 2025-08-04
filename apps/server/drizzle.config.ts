import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema",
  out: "./src/db/migrations",
  dialect: "sqlite",
  ...(!process.env.LOCAL_DB_PATH ? {
    driver: "d1-http",
    dbCredentials: {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
      databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
      token: process.env.CLOUDFLARE_D1_TOKEN!,
    },
  } : {
    dbCredentials: {
      url: process.env.LOCAL_DB_PATH!
    },
  })
});
