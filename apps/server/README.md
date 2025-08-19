# Server API

This is the backend API for the Restaurant Management App, built with Hono and tRPC. It provides the data and business logic for the native and web applications.

## Getting Started

To get started with the server, you'll need to have [Wrangler](https://developers.cloudflare.com/workers/wrangler/get-started/) installed and configured.

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Run the development server:**
    ```bash
    pnpm run dev
    ```

3.  **Deploy to Cloudflare Workers:**
    ```bash
    pnpm run deploy
    ```

## Tech Stack

-   **Framework:** [Hono](https://hono.dev/docs)
-   **RPC:** [tRPC](https://trpc.io/docs)
-   **ORM:** [Drizzle ORM](https://orm.drizzle.team/docs/overview)
-   **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/)
-   **Storage:** [Cloudflare R2](https://developers.cloudflare.com/r2/)
-   **Validation:** [Zod](https://zod.dev/)

## Project Structure

The `server` app is structured as follows:

```
apps/server/
├── src/
│   ├── db/                 # Database schema and migrations
│   ├── lib/                # Core libraries and helper functions
│   ├── routers/            # tRPC routers for different API endpoints
│   └── index.ts            # Entry point for the Hono application
├── drizzle.config.ts     # Drizzle ORM configuration
└── wrangler.jsonc        # Cloudflare Workers configuration
```

## API Endpoints

The API is built with tRPC and Hono. The tRPC routers are defined in the `src/routers` directory. The available routers are:

-   `menu.ts`
-   `menuGroup.ts`
-   `order.ts`
-   `organization.ts`
-   `role.ts`
-   `store.ts`
-   `user.ts`

## Database

The database is managed with Drizzle ORM and Cloudflare D1. Migrations are handled by `drizzle-kit`.

-   **Generate migrations:**
    ```bash
    pnpm run db:generate
    ```
-   **Apply migrations to local database:**
    ```bash
    pnpm run db:migrate:local
    ```
-   **Apply migrations to production database:**
    ```bash
    pnpm run db:migrate:production
    ```
