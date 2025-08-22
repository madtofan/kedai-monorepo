# Web Application

This is the web application for the Restaurant Management App, built with Next.js and shadcn/ui. It provides a web interface for restaurant owners to manage menus and orders.

## Getting Started

To get started with the web app, you'll need to have Node.js and pnpm installed.

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Run the development server:**
    ```bash
    pnpm run dev
    ```

3.  **Build for production:**
    ```bash
    pnpm run build
    ```

4.  **Start the production server (Node.js self-hosting only):**
    ```bash
    pnpm run start
    ```
    Note: If deploying via OpenNext to Cloudflare, use the Preview/Deploy commands below instead of `start`.

## Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/docs)
-   **State Management/Data Fetching:** [React Query](https://tanstack.com/query/latest/docs/react/overview)
-   **UI:** [shadcn/ui](https://ui.shadcn.com/docs)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/docs)
-   **RPC:** [tRPC](https://trpc.io/docs)
-   **Authentication:** [Better-Auth](https://better-auth.dev/)

## Environment
- Create a `.env.local` file for local development.
- `NEXT_PUBLIC_CLIENT_URL` (public client URL)
- `NEXT_PUBLIC_SERVER_URL` (public API base URL for tRPC/React Query)
- Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Keep secrets server-side (do not commit).
- For Cloudflare + OpenNext, document required Wrangler/Pages settings (bindings, vars) in this README and ensure they match your project settings.

## Project Structure

The `web` app is structured as follows:

```text
apps/web/
├── src/
│   ├── app/              # Next.js App Router pages and layouts
│   ├── components/       # Reusable React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Core libraries and helper functions
│   └── utils/            # Utility functions
├── public/             # Static assets
└── next.config.ts      # Next.js configuration
```

## Deployment

The web application is deployed using [OpenNext](https://open-next.js.org/) to Cloudflare.

-   **Preview deployment:**
    ```bash
    pnpm run preview
    ```

-   **Deploy to production:**
    ```bash
    pnpm run deploy
    ```

## PWA (Progressive Web App)

This web application is a Progressive Web App (PWA), which allows it to be installed on a user's device and offers a more native-like experience.

Recommended checklist:
- Ensure `manifest.json` includes correct `name`, `start_url`, `theme_color`, and icon set.
- Provide icons (192/512, maskable) under `public/`.
- Register a service worker (e.g., via `next-pwa` or a custom SW) and verify offline caching for critical routes.
- Test installability and Lighthouse PWA score.
