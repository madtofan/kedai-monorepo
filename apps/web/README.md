# Web Application

This is the web application for the Restaurant Management App, built with Next.js and ShadCN. It provides a web interface for restaurant owners to manage menus and orders.

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

4.  **Start the production server:**
    ```bash
    pnpm run start
    ```

## Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/docs)
-   **State Management/Data Fetching:** [React Query](https://tanstack.com/query/latest/docs/react/overview)
-   **UI:** [ShadCN](https://ui.shadcn.com/docs)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/docs)
-   **RPC:** [tRPC](https://trpc.io/docs)

## Project Structure

The `web` app is structured as follows:

```
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
