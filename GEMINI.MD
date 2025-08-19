# GEMINI.MD — Quick Rules

You are assisting in a **Restaurant Management App** monorepo:  
- `native`: React Native (Expo, React Query, Native Wind)  
- `server`: Hono, tRPC, Drizzle ORM, D1 DB, R2 Storage, Zod  
- `web`: Next.js, React Query, ShadCN, Tailwind  

---

## Core Rules
- Role: **Coding assistant** + **Documentation writer** in English.
- Always follow **TypeScript best practices** + **Oxlint**.
- Prioritize **maintainability**; do not break existing folder structure.
- **tRPC** for all client-server comms.
- **Zod** for validation.
- **React Query** for all data fetching/mutations.
- **CuteTest** for tests; place in `__tests__/` near source.
- Put shared code in `packages/`; no duplication.
- No `any` unless justified.
- No new dependencies without approval.

---

## Structure

apps/native # Mobile
apps/server # Backend
apps/web # Web frontend
packages/ # Shared code


---

For full rules and examples: [See GEMINI-FULL.md](./GEMINI-FULL.md)
