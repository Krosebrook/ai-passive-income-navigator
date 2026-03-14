# Architecture Decision Records (ADR)

**Version:** 1.0  
**Last Updated:** 2026-01-19

---

## Table of Contents

- [ADR-001: React 18 + Vite over Next.js](#adr-001-react-18--vite-over-nextjs)
- [ADR-002: Base44 BaaS over Custom Backend](#adr-002-base44-baas-over-custom-backend)
- [ADR-003: TanStack Query over Redux / Zustand](#adr-003-tanstack-query-over-redux--zustand)
- [ADR-004: Tailwind CSS over Styled-Components / CSS Modules](#adr-004-tailwind-css-over-styled-components--css-modules)
- [ADR-005: Shadcn/ui + Radix UI Component Library](#adr-005-shadcnui--radix-ui-component-library)
- [ADR-006: TypeScript + Deno Runtime for Cloud Functions](#adr-006-typescript--deno-runtime-for-cloud-functions)
- [ADR-007: Zod for Runtime Schema Validation](#adr-007-zod-for-runtime-schema-validation)
- [ADR-008: Framer Motion for Animations](#adr-008-framer-motion-for-animations)
- [ADR-009: Recharts for Data Visualization](#adr-009-recharts-for-data-visualization)
- [ADR-010: Client-Side Rendering (CSR) over SSR/SSG](#adr-010-client-side-rendering-csr-over-ssrssg)

---

## ADR-001: React 18 + Vite over Next.js

**Status:** Accepted  
**Date:** 2025-Q4  
**Deciders:** Engineering Team

### Context

The project requires a modern, fast-building JavaScript UI framework. The two primary candidates were:

1. **React 18 + Vite** – a pure SPA with Vite as the build tool
2. **Next.js** – a React meta-framework with SSR, SSG, and API routes

The application is entirely user-authenticated (no public SEO pages), relies on a managed BaaS backend (Base44), and needs to be deployable as static files.

### Decision

Use **React 18 with Vite** as the build tool instead of Next.js.

### Rationale

| Factor | React + Vite | Next.js |
|--------|-------------|---------|
| Build speed | ~500ms HMR | ~2–5s HMR |
| Bundle size | Minimal, tree-shakeable | Heavier Next.js runtime |
| Deployment | Any static CDN | Requires Node.js server or Vercel |
| Complexity | Low — no SSR plumbing | High — SSR hydration, API routes, edge middleware |
| SEO | Not required (auth-gated) | Useful for public pages |
| Base44 compatibility | Full static deploy | Requires custom server adapter |

Since all application content is behind authentication, SSR/SSG SEO benefits are irrelevant. The simpler Vite SPA can be deployed as pure static assets with Base44 handling all data fetching.

### Consequences

**Positive:**
- Sub-second hot module replacement during development.
- Zero server infrastructure to manage for the frontend.
- Simpler mental model: one React app, one `index.html` entry point.
- Any static CDN (Netlify, Vercel static, Cloudflare Pages) can serve the build output.

**Negative / Trade-offs:**
- No server-side rendering — initial page load paint is client-side. Mitigation: code-split routes via `React.lazy`.
- No built-in API routes — all backend logic lives in Base44 cloud functions.
- If public marketing pages are added later, a separate static site or Next.js app would be needed.

---

## ADR-002: Base44 BaaS over Custom Backend

**Status:** Accepted  
**Date:** 2025-Q4  
**Deciders:** Engineering Team

### Context

The application needs authentication, a database, serverless functions, AI integrations, and file storage. The build team is small and velocity is prioritised. Options considered:

1. **Base44** – opinionated BaaS with built-in AI LLM integrations, NoSQL collections, serverless functions, and auth.
2. **Custom backend** – Express/NestJS + PostgreSQL + separate auth service (Auth0/Clerk) + OpenAI API.
3. **Firebase / Supabase** – general-purpose BaaS without first-class LLM integration.

### Decision

Use **Base44** as the sole backend platform.

### Rationale

- Base44 provides first-class `InvokeLLM` integration, eliminating the need to wire OpenAI/Anthropic APIs separately. This is central to the product's AI-driven deal analysis and idea generation features.
- Authentication, database, cloud functions, and file storage are unified under one SDK (`@base44/sdk`), reducing integration surface area.
- The `createClientFromRequest(req)` pattern in Deno functions keeps per-user tenancy simple without building JWT middleware.
- Time-to-market priority: Base44 removes weeks of backend scaffolding.

### Consequences

**Positive:**
- Single SDK for all backend operations.
- LLM calls (`base44.integrations.Core.InvokeLLM`) are co-located with business logic in cloud functions.
- Automatic authentication propagation across collections and functions.
- Managed infrastructure — no Kubernetes, no database migrations.

**Negative / Trade-offs:**
- Vendor lock-in: migrating off Base44 would require rewriting all cloud functions and replacing the `base44Client.js` data layer.
- Limited query capability compared to SQL — complex aggregations must be done in cloud functions.
- Base44 uptime and rate limits directly affect application availability.
- Less control over data residency and backup frequency.

**Mitigation for lock-in:** The API layer in `src/api/` abstracts Base44 entities. If migration is ever needed, only this layer needs rewriting.

---

## ADR-003: TanStack Query over Redux / Zustand

**Status:** Accepted  
**Date:** 2025-Q4  
**Deciders:** Engineering Team

### Context

The application is heavily data-driven — dashboards, idea lists, deal pipelines, and portfolio views all fetch, cache, and mutate server data. Options:

1. **TanStack Query (React Query)** – dedicated server-state library
2. **Redux Toolkit** – general-purpose global state with RTK Query
3. **Zustand** – lightweight client-state with manual fetch logic
4. **SWR** – lightweight alternative to React Query

### Decision

Use **TanStack Query v5** for all server state management.

### Rationale

- The application has minimal shared *client* state (UI toggles, form drafts). The vast majority of state is *server* state (fetched data). TanStack Query is purpose-built for this.
- Built-in caching, deduplication, background refetching, and stale-while-revalidate reduce boilerplate to near zero.
- `useMutation` with optimistic updates provides instant UI feedback while cloud functions are running.
- Redux adds significant overhead (actions, reducers, selectors) for a use-case where there's no complex client-side state machine.
- Zustand would require manually building caching and invalidation logic.

### Consequences

**Positive:**
- Server state cache is automatic — navigating back to a page reuses cached data.
- `invalidateQueries` after mutations keeps all dependent views fresh.
- DevTools (`@tanstack/react-query-devtools`) give full cache visibility in development.
- Significantly less boilerplate than Redux for the same result.

**Negative / Trade-offs:**
- Not suitable for complex synchronous client-side state machines (but none exist here).
- Team must understand query keys and stale time semantics to avoid subtle bugs.

---

## ADR-004: Tailwind CSS over Styled-Components / CSS Modules

**Status:** Accepted  
**Date:** 2025-Q4  
**Deciders:** Engineering Team

### Context

CSS approach options for a React SPA:

1. **Tailwind CSS** – utility-first, JIT compiled
2. **Styled-components** – CSS-in-JS with runtime injection
3. **CSS Modules** – scoped CSS files per component
4. **Vanilla CSS** – global stylesheets

### Decision

Use **Tailwind CSS v3** with the JIT compiler.

### Rationale

- Shadcn/ui (chosen component library, see ADR-005) is built on and requires Tailwind CSS.
- Utility-first CSS co-locates style with markup, making component code self-contained without switching files.
- Zero runtime overhead compared to styled-components (which injects styles at runtime via a JS bundle).
- JIT compilation means only used utilities are in the final CSS bundle — typically 5–20 KB gzipped.
- Rapid UI iteration: changing layout, spacing, or color is a one-line edit.

### Consequences

**Positive:**
- Smallest possible CSS bundle for an SPA.
- Design system enforced through `tailwind.config.js` tokens (colors, spacing, fonts).
- Excellent IDE support (Tailwind IntelliSense extension).

**Negative / Trade-offs:**
- Class names in JSX can become long — mitigated with `cn()` utility (clsx + tailwind-merge).
- New team members unfamiliar with Tailwind face a learning curve.
- Dynamic styles (runtime-computed class names) require `cn()` patterns and cannot use arbitrary values in production without configuration.

---

## ADR-005: Shadcn/ui + Radix UI Component Library

**Status:** Accepted  
**Date:** 2025-Q4  
**Deciders:** Engineering Team

### Context

Options for the base UI component library:

1. **Shadcn/ui** – copy-owned components built on Radix UI + Tailwind
2. **Material UI (MUI)** – full React component suite
3. **Ant Design** – enterprise-grade full component library
4. **Headless UI** – Tailwind-first unstyled components
5. **Custom from scratch** – full control, maximum effort

### Decision

Use **Shadcn/ui** with **Radix UI** primitives.

### Rationale

- Shadcn/ui components are *owned*, not npm-installed — they live in `src/components/ui/` and are fully customisable without fighting library internals.
- Built on Radix UI primitives, which provide ARIA-compliant, accessible widgets (dialogs, dropdowns, tooltips) out of the box.
- Consistent with the Tailwind CSS choice (ADR-004) — zero CSS-in-JS overhead.
- Active ecosystem with a large component catalogue (50+ components).
- No version lock-in — components are plain React + Tailwind code.

### Consequences

**Positive:**
- Full control over component implementation and styling.
- WAI-ARIA accessibility handled at the Radix primitive level.
- Tailwind token integration means brand colour changes propagate automatically.
- Storybook-friendly: components are self-contained modules.

**Negative / Trade-offs:**
- Adding a new Shadcn component requires running `npx shadcn-ui add <component>`, which copies code into the repo — this must be manually updated for security patches.
- No central npm update path for the component code (by design).

---

## ADR-006: TypeScript + Deno Runtime for Cloud Functions

**Status:** Accepted  
**Date:** 2025-Q4  
**Deciders:** Engineering Team

### Context

Cloud functions (serverless) need a runtime. Base44 supports:

1. **TypeScript with Deno** – first-class Base44 runtime
2. **JavaScript (Node.js)** – alternative runtime

### Decision

Use **TypeScript** with the **Deno runtime** for all cloud functions.

### Rationale

- Deno is Base44's primary cloud function runtime, with `npm:@base44/sdk` importable directly via `npm:` specifiers.
- TypeScript provides compile-time safety for function inputs/outputs — especially important for complex LLM JSON schemas.
- Deno's built-in TypeScript support eliminates `ts-node` or `tsx` configuration.
- Deno's `Deno.serve` API is the standard pattern for Base44 HTTP functions.
- Type safety catches interface mismatches between cloud function responses and frontend consumers at author time.

### Consequences

**Positive:**
- Type errors in cloud function contracts are caught before deployment.
- `response_json_schema` in LLM calls can be generated from TypeScript interfaces.
- Deno's secure-by-default model reduces accidental filesystem/network access.

**Negative / Trade-offs:**
- Deno's `npm:` compatibility layer occasionally has edge-case issues with Node.js-only packages.
- Developers must understand Deno's module system (URL imports, `npm:` prefix) rather than `require()`.
- Local testing of Deno functions requires Deno CLI separately from the main Node.js project.

---

## ADR-007: Zod for Runtime Schema Validation

**Status:** Accepted  
**Date:** 2025-Q4  
**Deciders:** Engineering Team

### Context

The frontend needs runtime validation for:
- Form inputs (React Hook Form integration)
- API response payloads
- User preference settings

### Decision

Use **Zod v3** as the schema validation library throughout the frontend.

### Rationale

- Zod is TypeScript-native: schemas produce inferred types via `z.infer<>`, eliminating duplicate type definitions.
- First-class React Hook Form resolver (`@hookform/resolvers/zod`) reduces form validation boilerplate.
- Composable schemas — base schemas can be extended for create vs. update variants.
- Zod schemas can validate LLM-returned JSON before it is used in the UI.

### Consequences

**Positive:**
- Single source of truth for data shape: one Zod schema generates both the TypeScript type and the runtime validator.
- Error messages are structured and translatable.
- `.safeParse()` allows validation without throwing — suitable for non-critical paths.

**Negative / Trade-offs:**
- Bundle size: ~14 KB gzipped. Acceptable for this application size.
- Team must learn Zod's API alongside TypeScript generics.

---

## ADR-008: Framer Motion for Animations

**Status:** Accepted  
**Date:** 2025-Q4  
**Deciders:** Engineering Team

### Context

The application has multiple animated transitions: dashboard widgets, deal pipeline kanban, onboarding flows, AI chat responses. Options:

1. **Framer Motion** – declarative React animation library
2. **React Spring** – physics-based animation library
3. **CSS transitions only** – no JS animation library
4. **GSAP** – high-performance general animation toolkit

### Decision

Use **Framer Motion v11**.

### Rationale

- Declarative API (`<motion.div animate={{ opacity: 1 }}>`) integrates cleanly with React component lifecycle.
- `AnimatePresence` handles mount/unmount transitions (route changes, modal open/close) without manual state management.
- Built-in `layout` prop for smooth Kanban reordering animations in the deal pipeline.
- Large community, excellent documentation, and React 18 compatible.

### Consequences

**Positive:**
- Complex animations (drag-to-reorder, staggered lists) require minimal code.
- Respects `prefers-reduced-motion` media query for accessibility.

**Negative / Trade-offs:**
- Adds ~50 KB gzipped to the bundle. Mitigated by lazy loading animation-heavy pages.
- Overuse of animations can hurt Core Web Vitals (CLS) — follow the performance budget in `PERFORMANCE_BASELINE.md`.

---

## ADR-009: Recharts for Data Visualization

**Status:** Accepted  
**Date:** 2025-Q4  
**Deciders:** Engineering Team

### Context

Portfolio performance, income trends, and deal pipeline analytics require charts. Options:

1. **Recharts** – React-native SVG charting library
2. **Chart.js + react-chartjs-2** – Canvas-based charts
3. **D3.js** – powerful but low-level
4. **Visx (Airbnb)** – D3-based React primitives

### Decision

Use **Recharts v2**.

### Rationale

- Fully composable React components (`<LineChart>`, `<BarChart>`, `<PieChart>`) — consistent with the React mental model.
- SVG output scales to all screen densities without pixelation.
- Recharts' responsive container (`<ResponsiveContainer>`) handles layout without manual resize observers.
- Sufficient for the required chart types: line (income over time), bar (portfolio comparison), pie (category breakdown).

### Consequences

**Positive:**
- Charts are React components — props-driven, testable, and themeable with Tailwind CSS colours.
- Tooltip customisation is straightforward via `<Tooltip content={CustomTooltip}>`.

**Negative / Trade-offs:**
- Complex custom interactions (brush + zoom + click) require more work than D3.
- Performance degrades for datasets > 10,000 points — not a concern at prototype scale.

---

## ADR-010: Client-Side Rendering (CSR) over SSR/SSG

**Status:** Accepted  
**Date:** 2025-Q4  
**Deciders:** Engineering Team

### Context

All application routes require authentication. There are no publicly accessible pages that need crawling by search engines.

### Decision

Use **Client-Side Rendering** exclusively (Vite SPA, no SSR).

### Rationale

- All meaningful content is behind login. SSR offers no SEO benefit for authenticated pages.
- CSR eliminates server infrastructure requirements — deploy to any CDN.
- React Query's caching ensures navigating between pages is fast (data is served from cache, not a new server round-trip).
- Hydration mismatch errors (a common Next.js SSR pain point) are eliminated.

### Consequences

**Positive:**
- Simple deployment: `vite build` → upload `dist/` to CDN.
- No server costs beyond Base44 function invocations.
- Faster iteration — no SSR-specific patterns to maintain.

**Negative / Trade-offs:**
- First Contentful Paint (FCP) requires JavaScript to execute. Mitigation: aggressive code-splitting and a minimal loading shell.
- Link previews (Open Graph) for sharing specific deals/ideas are not possible without a separate OG image service.
- If a public landing page is added, a separate deployment or Next.js migration would be required.

---

*Related: [Architecture Documentation](../ARCHITECTURE.md) · [Data Model](DATA_MODEL.md)*

## Purpose

This document records major architectural and technology decisions for the AI Passive Income Navigator, including the rationale, alternatives considered, and consequences.

## ADR Format

Each decision follows this template:

```markdown
# ADR-XXX: [Decision Title]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded
**Deciders:** [Names/Roles]
**Technical Story:** [Issue/ticket link]

## Context

What is the issue we're trying to address?

## Decision

What decision did we make?

## Rationale

Why did we make this decision?

## Alternatives Considered

What other options did we evaluate?

## Consequences

### Positive
- Benefit 1
- Benefit 2

### Negative
- Drawback 1
- Drawback 2

### Neutral
- Tradeoff 1

## Related Decisions
- Links to related ADRs
```

---

## Decision Log

### ADR-001: Use React as Frontend Framework
**Status:** ⚠️ **Not Documented**

**Questions to Answer:**
- Why React over Vue.js, Angular, Svelte?
- What specific React features influenced the decision?
- What alternatives were considered?
- What are the long-term implications?

---

### ADR-002: Use Base44 Platform for Backend
**Status:** ⚠️ **Not Documented**

**Questions to Answer:**
- Why Base44 over Firebase, Supabase, AWS Amplify?
- What capabilities does Base44 provide?
- What are the vendor lock-in risks?
- What is the migration strategy if needed?

---

### ADR-003: Use Vite as Build Tool
**Status:** ⚠️ **Not Documented**

**Questions to Answer:**
- Why Vite over webpack, Parcel, Rollup?
- What performance benefits does Vite provide?
- What are the limitations?

---

### ADR-004: Use TanStack Query for State Management
**Status:** ⚠️ **Not Documented**

**Questions to Answer:**
- Why TanStack Query over Redux, Zustand, MobX?
- What specific caching strategies influenced this choice?
- How does it handle server state vs. client state?

---

### ADR-005: Client-Side Rendering (CSR) vs. Server-Side Rendering (SSR)
**Status:** ⚠️ **Not Documented**

**Questions to Answer:**
- Why CSR instead of SSR/SSG (Next.js, Remix)?
- What are the SEO implications?
- When might SSR be reconsidered?

---

### ADR-006: Use Tailwind CSS for Styling
**Status:** ⚠️ **Not Documented**

**Questions to Answer:**
- Why Tailwind over styled-components, CSS Modules, Emotion?
- What design system considerations influenced this?
- What are the maintainability implications?

---

### ADR-007: Use Shadcn/ui + Radix UI for Components
**Status:** ⚠️ **Not Documented**

**Questions to Answer:**
- Why Shadcn/ui over Material-UI, Ant Design, Chakra UI?
- What accessibility benefits does Radix provide?
- What customization tradeoffs exist?

---

### ADR-008: Monolithic Frontend vs. Micro-Frontends
**Status:** ⚠️ **Not Documented**

**Questions to Answer:**
- Why monolithic for current scale?
- At what point should micro-frontends be considered?
- What team size justifies the split?

---

### ADR-009: TypeScript Functions, JavaScript Frontend
**Status:** ⚠️ **Not Documented**

**Questions to Answer:**
- Why TypeScript for cloud functions but JavaScript for frontend?
- What are the benefits of mixed language approach?
- Should frontend migrate to TypeScript?

---

### ADR-010: Authentication Delegation to Base44
**Status:** ⚠️ **Not Documented**

**Questions to Answer:**
- Why delegate auth instead of custom solution?
- What auth flows does Base44 support?
- What are the limitations?

---

## How to Add a New ADR

1. Copy the ADR template above
2. Assign next sequential number (ADR-011, etc.)
3. Fill in all sections thoroughly
4. Get review from tech lead or architect
5. Commit to repository
6. Update this index

---

## Related Documentation

- [ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture overview
- [DATA_MODEL.md](./DATA_MODEL.md) - Database design decisions
- [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) - State management patterns

---

**Priority:** P1 - High Priority  
**Estimated Documentation Time:** 2 days (10 ADRs × ~2 hours each)  
**Assigned To:** [Unassigned]  
**Target Completion:** [Not Set]

---

*This placeholder was created during the 2026-01-21 documentation audit.*
*PURPOSE: Capture institutional knowledge and decision rationale for future engineers.*
