# Restaurant Management App

This is a monorepo for a Restaurant Management App, built with a modern TypeScript stack. The project is designed to help restaurant owners manage their menus and orders efficiently.

## Project Overview

The project is a monorepo managed with **Turborepo** and consists of three main applications:

-   **`native`**: A mobile application built with React Native and Expo for managing the restaurant on the go.
-   **`server`**: A backend API built with Hono and tRPC, providing data and business logic for the client applications.
-   **`web`**: A web application built with Next.js for a comprehensive management dashboard.

## Quick Links

- Governance (Quick Rules): [GEMINI.MD](GEMINI.MD)
- Governance (Full Guide): [GEMINI-FULL.md](GEMINI-FULL.md)

## Tech Stack

This project utilizes a modern tech stack to ensure a high-quality, scalable, and maintainable application.

-   **Monorepo:** Turborepo
-   **Frontend (Web):** Next.js, TanStack Query (React Query), shadcn/ui, Tailwind CSS
-   **Frontend (Mobile):** React Native, Expo, React Query, NativeWind
-   **Backend:** Hono, tRPC, Drizzle ORM, Cloudflare D1, Cloudflare R2
-   **Database:** Cloudflare D1 (SQLite)
-   **Validation:** Zod
-   **Linting:** oxlint
-   **Authentication:** [Better-Auth](https://better-auth.dev/)

## Getting Started

**This project uses pnpm as a package manager.** To get started with this project, you'll need to have Node.js and pnpm installed.

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Set up environment variables:**

    Each application (`native`, `server`, `web`) has its own `.env.example` file. Copy these to `.env` (or `.dev.vars` for the server) and fill in the required values.
    See per-app setup notes:
    - [apps/native/README.md](apps/native/README.md)
    - [apps/server/README.md](apps/server/README.md)
    - [apps/web/README.md](apps/web/README.md)

3.  **Run the development servers:**
    ```bash
    pnpm dev
    ```

    This will start the `native`, `server`, and `web` applications in development mode.

## Monorepo Structure

The monorepo is organized as follows:

```text
kedai-monorepo/
├── apps/
│   ├── native/      # Mobile application (React Native, Expo)
│   ├── server/      # Backend API (Hono, tRPC)
│   └── web/         # Frontend application (Next.js)
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── turbo.json
```

## Available Scripts

The following scripts are available at the root of the monorepo:

-   `pnpm dev`: Start all applications in development mode.
-   `pnpm build`: Build all applications.
-   `pnpm check-types`: Check TypeScript types across all apps.
-   `pnpm dev:native`: Start only the native application.
-   `pnpm dev:web`: Start only the web application.
-   `pnpm dev:server`: Start only the server application.
-   `pnpm db:push`: Push schema changes to the database.
-   `pnpm db:studio`: Open the database studio UI.
-   `pnpm db:generate`: Generate database migrations.
-   `pnpm db:migrate`: Apply database migrations.
-   `pnpm db:migrate:local`: Apply database migrations on local miniflare.
-   `pnpm db:migrate:production`: Apply database migrations on remote production deployment.
    (These commands are root-level scripts that start each app’s dev server via Turborepo.)