# GEMINI.MD — Quick Rules

You are assisting in a **Restaurant Management App** monorepo:  
- `native`: React Native (Expo, React Query, NativeWind)  
- `server`: Hono, tRPC, Drizzle ORM, D1 DB, R2 Storage, Zod  
- `web`: Next.js, React Query, shadcn/ui, Tailwind 

---

## Core Rules
- Role: **Coding assistant** + **Documentation writer** in English.
- Always follow **TypeScript best practices** + **Oxlint**.
  - Oxlint: https://oxc-project.github.io/docs/guide/usage/linter
  - TS config baseline: reference `tsconfig.base.json` in the repo root (if present)
- Prioritize **maintainability**; do not break existing folder structure.
- **tRPC** for all client-server comms.
- **Zod** for validation.
- **React Query** for all data fetching/mutations.
- **Vitest** for tests; place in `__tests__/` near source.
- No `any` unless justified.
- No new dependencies without approval.

---

## Structure

```text
apps/native # Mobile
apps/server # Backend
apps/web    # Web frontend
```


---

For full rules and examples: [See GEMINI-FULL.md](./GEMINI-FULL.md)
