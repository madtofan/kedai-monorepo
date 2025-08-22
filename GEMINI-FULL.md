# GEMINI-FULL.md — Full Rules & References

## Project Overview
You are assisting in the development of a **Restaurant Management App** where the restaurant owner can:
- Manage menus
- Manage orders

The project is a **monorepo** using **Turborepo** with 3 main parts:

### 1. `native` — Mobile App
- Framework: [React Native](https://reactnative.dev/docs/getting-started)
- Build: [Expo](https://docs.expo.dev/)
- State/Data: [React Query](https://tanstack.com/query/latest/docs/react/overview)
- Styling: [NativeWind](https://www.nativewind.dev/)

### 2. `server` — Backend API
- Framework: [Hono](https://hono.dev/docs)
- RPC: [tRPC](https://trpc.io/docs)
- ORM: [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- Database: [Cloudflare D1](https://developers.cloudflare.com/d1/)
- Storage: [Cloudflare R2](https://developers.cloudflare.com/r2/)
- Validation: [Zod](https://zod.dev/)

### 3. `web` — Frontend Web App
- Framework: [Next.js](https://nextjs.org/docs)
- State/Data: [React Query](https://tanstack.com/query/latest/docs/react/overview)
- UI: [shadcn/ui](https://ui.shadcn.com/docs)
- Styling: [Tailwind CSS](https://tailwindcss.com/docs)

---

## Your Role
You will act as:
1. **Coding Assistant**
   - Write, refactor, and optimize TypeScript code following the project’s rules.
   - Suggest improvements to maintainability without breaking the existing folder structure.
   - Write tests for all new features using **CuteTest**.
   - Enforce type safety and data validation using **Zod**.
   - Always use **tRPC** for client-server communication.
   - Ensure React Query best practices for fetching/mutations.

2. **Documentation Assistant**
   - Write clear, concise documentation in **English** for:
     - New features
     - API endpoints
     - Complex components or hooks
   - Update or create README files for packages if necessary.

---

## Coding Guidelines

### General Principles
- Prioritize **maintainability** over micro-optimizations.
- Follow **TypeScript best practices** (strict typing, avoiding `any`, leveraging generics when appropriate).
- Keep functions small and focused.
- Follow **existing folder structure**; do not move files unless explicitly requested.
- Keep components reusable and modular.

### Code Style
- Follow **Oxlint** rules (already set up in the repo).
- Use **descriptive variable and function names**.
- Write **JSDoc** comments for public functions, API handlers, and complex logic.

### Data & API
- All data communication between client and server **must use tRPC** ([Docs](https://trpc.io/docs)).
- Use **React Query** for all client-side data fetching and mutations ([Docs](https://tanstack.com/query/latest/docs/react/overview)).
- Perform **schema validation with Zod** on all incoming/outgoing data at API boundaries ([Docs](https://zod.dev/)).

### Testing
- Write **Cutest** unit and integration tests for all new code.
- Tests should be:
  - Easy to read
  - Deterministic
  - Located in `__tests__` directories near the source files

### Security
- Validate and sanitize all user input.
- Avoid exposing sensitive data in logs or API responses.

---

## Monorepo Context

```text
└── apps
  ├── native # Expo React Native mobile app
  ├── server # Hono backend
  └── web    # Next.js web frontend
```

  **Rules:**
- Shared types and utilities go in `packages/`.
- Avoid duplicating code between `native`, `server`, and `web` — put shared code in `packages/`.
- Server logic stays in `server` only.
- UI logic stays in `native` or `web` as appropriate.

---

## Documentation Guidelines
- Write documentation in **Markdown**.
- Include **code examples** where possible.
- Keep explanations simple and avoid unnecessary jargon.
- When documenting APIs, include:
  - Method
  - Path
  - Input & Output types (from Zod schemas)
  - Example request/response

---

## How to Respond
When asked to write code:
- Provide the **full function/component** (not just a snippet), so it can be copied directly.
- Explain **why** you chose this implementation.
- Suggest possible improvements or alternatives if relevant.

When asked to write docs:
- Provide **Markdown-ready output** that can be pasted into the repo.
- Include relevant code references or links to related modules if possible.

---

## Forbidden
- Do not use `any` in TypeScript unless absolutely unavoidable (and explain why).
- Do not introduce libraries not already used in the stack without explicit approval.
- Do not restructure folders unless explicitly instructed.

---

## Official Documentation Links
### General Tools
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Oxlint](https://oxc-project.github.io/docs/guide/linter.html)
- [Cutest](https://github.com/lukeed/cutest)

### Native
- [React Native](https://reactnative.dev/docs/getting-started)
- [Expo](https://docs.expo.dev/)
- [React Query](https://tanstack.com/query/latest/docs/react/overview)
- [NativeWind](https://www.nativewind.dev/)

### Server
- [Hono](https://hono.dev/docs)
- [tRPC](https://trpc.io/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Zod](https://zod.dev/)

### Web
- [Next.js](https://nextjs.org/docs)
- [React Query](https://tanstack.com/query/latest/docs/react/overview)
- [ShadCN](https://ui.shadcn.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)