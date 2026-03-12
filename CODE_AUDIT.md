# Code Audit Report: AI Passive Income Navigator

**Date:** March 2026  
**Auditor:** Senior Software Engineering Consultant  
**Repository:** `Krosebrook/ai-passive-income-navigator`  
**Version:** `0.0.0` (pre-production)  
**Audit Scope:** High-level architecture, module/package structure, and feature-level deep-dives

---

## Executive Summary

The AI Passive Income Navigator is a React-based SPA (Single-Page Application) built on the Base44 platform that helps users discover, track, and manage passive income opportunities. The codebase demonstrates solid foundational choices—modern tooling, feature-based organization, and React Query for server state—but carries significant pre-production risk across security, test coverage, and build reliability.

### Most Critical Findings

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| 1 | 🔴 Critical | **Build failure** — `@/functions/onboardingFlowConfig` and `@/functions/activationFlowConfig` were imported in client components but the files did not exist in `src/functions/` | ✅ Fixed |
| 2 | 🔴 Critical | **jspdf ≤4.1.0 vulnerabilities** — Path traversal (GHSA-f8cm-6447-x5h2), arbitrary JS execution via AcroForm (GHSA-pqxr-3g65-p328), and ReDoS (GHSA-w532-jxjh-hjhj) | ✅ Fixed (upgraded to 4.2.0) |
| 3 | 🔴 Critical | **220 ESLint unused-import errors** — CI pipeline (`npm run lint`) was broken; unused imports across 40+ files prevented clean builds | ✅ Fixed (auto-fixed + ESLint config updated) |
| 4 | 🟠 High | **Regex-based XSS sanitization** — `sanitizeInput()` relied on brittle regexes that miss encoded characters, SVG vectors, and nested tags | ✅ Fixed (replaced with DOMPurify) |
| 5 | 🟠 High | **Non-JS files matched by ESLint glob** — `*.md.jsx` and `*.json.jsx` documentation files caused ESLint parse errors | ✅ Fixed (global ignore patterns added) |
| 6 | 🟠 High | **No production-quality test coverage** — Only 7 test files for 332 source files (~2%); coverage thresholds of 90% are configured but unmet | ⚠️ Documented |
| 7 | 🟡 Medium | **`requiresAuth: false` in production client** — Base44 client created without auth enforcement | ⚠️ Documented |

---

## Level 1 — High-Level Architecture

### Overview

The application follows a **Modular SPA** architecture pattern, built as a Vite + React 18 frontend connecting to a Base44 BaaS (Backend-as-a-Service). The architecture is neither microservices nor classic monolith; it is best described as a **BaaS-backed SPA with serverless functions**.

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / Client                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Vite + React 18 SPA                                 │   │
│  │  ┌──────────┐  ┌────────────┐  ┌───────────────────┐ │   │
│  │  │  Pages   │  │ Components │  │  State (RQ + CTX) │ │   │
│  │  └────┬─────┘  └─────┬──────┘  └─────────┬─────────┘ │   │
│  └───────┼──────────────┼────────────────────┼───────────┘   │
└──────────┼──────────────┼────────────────────┼───────────────┘
           │              │                    │
           └──────────────▼────────────────────┘
                          │ HTTPS / Base44 SDK
                          ▼
           ┌──────────────────────────────────────┐
           │          Base44 BaaS                 │
           │  (Auth, DB, Storage, Functions)      │
           └──────────────────────────────────────┘
                          │
                          ▼
           ┌──────────────────────────────────────┐
           │     /functions/*.ts  (Serverless)    │
           │  (AI, analytics, onboarding logic)   │
           └──────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Version | Assessment |
|-------|-----------|---------|------------|
| Build tool | Vite | 6.1 | ✅ Modern, fast HMR |
| UI framework | React | 18.2 | ✅ Stable LTS |
| Routing | React Router | 6.26 | ✅ Current |
| Server state | React Query (@tanstack) | 5.84 | ✅ Best-in-class |
| Styling | Tailwind CSS + Radix UI | 3.4 | ✅ Accessible primitives |
| Animation | Framer Motion | 11.16 | ✅ Production-grade |
| Backend | Base44 BaaS | 0.8.3 | ⚠️ Vendor lock-in risk |
| Language | JavaScript (JSX) + TypeScript | ES2022 | ⚠️ Mixed, incomplete TS |
| Testing | Vitest + Testing Library | 4.0 | ✅ Correct choices |
| Charts | Recharts | 2.15 | ✅ Solid choice |

### Strengths

1. **Modern, production-quality toolchain**: Vite 6, React 18, React Query 5, and Vitest are all excellent choices that align well with industry best practices.
2. **Feature-based folder structure**: The `src/components/` tree is organized by domain (e.g., `dashboard/`, `portfolio/`, `onboarding/`), enabling independent development of features.
3. **Code splitting via dynamic imports**: Pages are lazy-loaded from `pages.config.js`, reducing initial bundle size.
4. **Accessible UI components**: Radix UI primitives with Tailwind provide a solid accessible foundation.

### Areas of Concern

1. **BaaS vendor lock-in** (Medium priority): The entire backend (auth, data, serverless functions) is provided by Base44. There is no abstraction layer between the app and the SDK. Migrating away from Base44 would require rewrites across all 72+ `useQuery`/`useMutation` call sites.

   **Recommendation**: Create a thin service layer (`src/services/`) that wraps Base44 calls. This decouples business logic from the BaaS SDK:

   ```javascript
   // src/services/portfolioService.js
   import { base44 } from '@/api/base44Client';
   
   export const portfolioService = {
     getIdeas: (userId) => base44.entities.Ideas.filter({ owner_id: userId }),
     createIdea: (data) => base44.entities.Ideas.create(data),
   };
   ```

2. **Mixed TypeScript/JavaScript** (Low priority): `src/utils/index.ts` is TypeScript; everything else is JSX/JS. The `jsconfig.json` uses `checkJs: true`, but without consistent type coverage, this provides limited value.

   **Recommendation**: Adopt TypeScript consistently or remove it. If keeping JS, remove `checkJs` unless annotations are planned.

3. **Serverless functions in wrong location** (Critical—fixed in this PR): Files in `functions/` are serverless functions (backend). Several were imported as client-side modules using `@/functions/`. The fix: copies needed by the client were placed in `src/functions/`.

### Deployment Considerations

- The `.env.example` defines `VITE_BASE44_APP_ID` and `VITE_BASE44_APP_BASE_URL`—these are baked into the client bundle at build time. **There are no server-side secrets in this repo**, which is appropriate for a pure SPA.
- CI pipeline runs lint, test, security audit, and build on pull requests—a solid baseline.
- No containerization (Dockerfile/docker-compose), which is fine for a Vite SPA deploying to CDN/static hosting.

---

## Level 2 — Module and Package Structure

### Dependency Graph

```
src/
├── main.jsx          → App.jsx → AuthProvider → base44Client
├── pages/            → components/, lib/, api/
├── components/
│   ├── ui/           [Radix UI wrappers, ~80 components – no business logic]
│   ├── dashboard/    → recharts, base44Client
│   ├── portfolio/    → base44Client, framer-motion
│   ├── onboarding/   → base44Client, @/functions/onboardingFlowConfig
│   ├── activation/   → @/functions/activationFlowConfig
│   └── ...40+ more feature folders
├── api/
│   └── base44Client.js    [single external API facade]
├── lib/
│   ├── AuthContext.jsx     [Auth state management]
│   ├── errorLogger.js      [Logging singleton]
│   ├── app-params.js       [URL/env parameter extraction]
│   └── utils.js            [cn(), isIframe()]
├── utils/
│   └── index.ts            [Utility functions: sanitize, format, etc.]
├── hooks/
│   └── use-mobile.jsx      [Responsive detection]
└── functions/              [NEW: client-accessible config files]
    ├── onboardingFlowConfig.ts
    └── activationFlowConfig.ts
```

### Key Design Patterns

#### 1. Context + React Query Pattern (Positive)

Auth state lives in `AuthContext`, while server/async state lives in React Query. This is a clean separation:

```javascript
// AuthContext.jsx — Client state (who is the user?)
const [user, setUser] = useState(null);
const [isAuthenticated, setIsAuthenticated] = useState(false);

// Any page component — Server state (what data does the user have?)
const { data: ideas } = useQuery({
  queryKey: ['ideas', userId],
  queryFn: () => base44.entities.Ideas.filter({ owner_id: userId }),
});
```

#### 2. Centralized Routing (Positive)

`pages.config.js` is the single source of truth for all routes. Pages are dynamically imported (code-split). This avoids scattered route definitions:

```javascript
// pages.config.js
const Pages = {
  Dashboard: lazy(() => import('./pages/Dashboard')),
  Portfolio: lazy(() => import('./pages/Portfolio')),
  // ...24 pages
};
```

#### 3. Missing Service Layer (Concern)

Business logic is scattered across page components. The same query patterns are duplicated in multiple pages:

```javascript
// Dashboard.jsx
const { data: deals } = useQuery({ queryFn: () => base44.entities.DealPipeline.filter({}) });

// Portfolio.jsx
const { data: deals } = useQuery({ queryFn: () => base44.entities.DealPipeline.filter({}) });
```

**Recommendation** (Medium priority): Extract repeated data access patterns into custom hooks:

```javascript
// hooks/useDeals.js
export function useDeals(filters = {}) {
  return useQuery({
    queryKey: ['deals', filters],
    queryFn: () => base44.entities.DealPipeline.filter(filters),
    staleTime: 5 * 60 * 1000,
  });
}
```

### Configuration Management

| Config File | Purpose | Assessment |
|-------------|---------|------------|
| `.env.example` | Documents required env vars | ✅ Good practice |
| `vite.config.js` | Build configuration | ✅ Minimal, correct |
| `eslint.config.js` | Linting rules | ✅ Appropriate rules |
| `vitest.config.js` | Test configuration | ⚠️ 90% threshold too strict for current state |
| `jsconfig.json` | TypeScript/IDE config | ⚠️ Mixed JS/TS without full adoption |
| `tailwind.config.js` | CSS utility config | ✅ Standard |
| `pages.config.js` | Route registry | ✅ Smart centralization |

### Testing Strategy

The testing infrastructure is correct but severely under-utilized:

| Category | Target | Actual | Status |
|----------|--------|--------|--------|
| Test files | All modules | 7 of 332 source files | 🔴 2% |
| Line coverage | 90% | Unknown (< 20% estimated) | 🔴 |
| Component tests | All pages | 0 page tests | 🔴 |
| Integration tests | Key flows | 0 | 🔴 |
| Unit tests | Utils, hooks, lib | 7 test files | ✅ |

**Current test files:**
- `src/api/base44Client.test.js` — Client initialization
- `src/lib/AuthContext.test.jsx` — Auth state management (14 tests)
- `src/lib/app-params.test.js` — Parameter extraction (9 tests)
- `src/lib/errorLogger.test.js` — Error logging (21 tests)
- `src/lib/utils.test.js` — CSS utilities (9 tests)
- `src/utils/index.test.js` — Utility functions (53 tests)
- `src/hooks/use-mobile.test.jsx` — Mobile detection (2 tests)

**Recommendations** (High priority):
1. Add page-level smoke tests using React Testing Library
2. Add integration tests for the portfolio CRUD flow
3. Reduce coverage thresholds to 40% initially; increase as coverage improves

### Separation of Concerns

| Concern | Status | Notes |
|---------|--------|-------|
| Auth vs. data | ✅ Good | Context for auth, React Query for data |
| UI vs. logic | ⚠️ Partial | Some pages mix presentation and business logic |
| API vs. components | ✅ Good | `base44Client.js` is the single API entry point |
| Config vs. code | ✅ Good | env vars, pages.config.js properly externalized |
| Server vs. client | ⚠️ Issue | Some serverless functions were imported by client (fixed) |

---

## Level 3 — Feature Deep-Dives

### Feature 1: Authentication and App State (`src/lib/AuthContext.jsx`)

**Purpose**: Manage user authentication state, check app public settings, and handle auth error states.

**Strengths**:
- Clean error type discrimination (`auth_required`, `user_not_registered`, custom reasons)
- Proper loading state management (`isLoadingAuth`, `isLoadingPublicSettings`)
- Token injection via URL params (for embedded/iframe use cases)

**Issues**:

**(a) `requiresAuth: false` in base44Client** — Medium priority

```javascript
// src/api/base44Client.js
export const base44 = createClient({
  requiresAuth: false,  // ⚠️ Auth not enforced at SDK level
  ...
});
```

The auth check in `AuthContext` adds a soft gate, but `requiresAuth: false` means the Base44 SDK will not automatically redirect unauthenticated users. If a component directly calls `base44.entities.X.list()` without going through the auth check, it may receive data it should not.

**Recommendation**: Set `requiresAuth: import.meta.env.PROD` so unauthenticated calls are blocked in production but development flexibility is maintained.

**(b) `console.error` used for expected errors** — Low priority

```javascript
// AuthContext.jsx:56
console.error('App state check failed:', appError);
```

A 403 with `reason: 'user_not_registered'` is an expected business outcome, not an error. Logging it as `console.error` pollutes production logs and may trigger false alerts in monitoring tools.

**Recommendation**: Use `console.warn` or `errorLogger.captureMessage` for expected auth states:

```javascript
// Replace console.error with appropriate severity
if (reason === 'user_not_registered') {
  errorLogger.captureMessage('User attempted access before registration', 'info', { reason });
}
```

---

### Feature 2: Input Sanitization (`src/utils/index.ts`)

**Purpose**: Protect user-facing inputs from XSS attacks before rendering.

**Previous Issue (Fixed)**: The original regex-based implementation had multiple bypass vectors:
- Nested/malformed script tags: `<scr<script>ipt>alert(1)</script>`
- Encoded payloads: `%3Cscript%3Ealert(1)%3C/script%3E`
- SVG vectors: `<svg onload="alert(1)">`

**Fix Applied**: Replaced the regex implementation with DOMPurify 3.3.3, which is the industry-standard XSS sanitization library:

```typescript
// Before (vulnerable to XSS bypass)
export function sanitizeInput(input: string): string {
    let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi, '');
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    // ... more incomplete patterns
    return sanitized.trim();
}

// After (DOMPurify-backed, production-ready)
import DOMPurify from 'dompurify';

export function sanitizeInput(input: string): string {
    if (!input) return '';
    if (typeof window !== 'undefined' && DOMPurify.isSupported) {
        return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    }
    // Non-browser fallback (SSR/tests)
    return input.replace(/<[^>]+>/g, '').trim();
}
```

**Remaining Concern**: `sanitizeInput` is defined but not imported anywhere in the application components. The function should be applied wherever user-supplied content is rendered as HTML—particularly in any `dangerouslySetInnerHTML` usage.

**Recommendation** (High priority): Audit all `dangerouslySetInnerHTML` uses and wrap with `sanitizeInput`:

```jsx
// src/components/ui/chart.jsx - verify this is safe
<style dangerouslySetInnerHTML={{ __html: cssString }} />
// Should become:
<style dangerouslySetInnerHTML={{ __html: sanitizeInput(cssString) }} />
```

---

### Feature 3: Error Handling Infrastructure (`src/lib/errorLogger.js` + `src/components/ErrorBoundary.jsx`)

**Purpose**: Centralize error tracking and provide graceful degradation for React render errors.

**Strengths**:
- `ErrorLogger` singleton with Sentry placeholder is a mature pattern
- `ErrorBoundary` class component correctly uses `getDerivedStateFromError` and `componentDidCatch`
- Errors are never silently lost—console fallback always fires

**Issues**:

**(a) Error boundary fallback provides no recovery mechanism** — Low priority

```jsx
// ErrorBoundary.jsx fallback
<div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
  <h2>Something went wrong</h2>
  <button onClick={() => window.location.href = '/'}>Go to Home</button>
</div>
```

The fallback forces a full page navigation. Modern best practice is to offer a "try again" option that resets the boundary state:

```jsx
// Recommended improvement
<button onClick={() => this.setState({ hasError: false, error: null })}>
  Try Again
</button>
```

**(b) Route-level error boundaries missing** — Medium priority

In `App.jsx`, there is one global `ErrorBoundary` wrapping the entire app. Route-level errors take down the whole UI instead of just the affected page.

**Recommendation**: Wrap each `<Route>` with its own `ErrorBoundary`:

```jsx
<Route path="/portfolio" element={
  <ErrorBoundary>
    <Portfolio />
  </ErrorBoundary>
} />
```

---

### Feature 4: Build and CI Reliability (`.github/workflows/ci.yml`)

**Purpose**: Automated quality gate on pull requests.

**Strengths**:
- Runs lint, test, security audit, and build
- Fails on critical vulnerabilities only (`--audit-level=critical`)
- Minimal GITHUB_TOKEN permissions (read-only)

**Issues Fixed in This PR**:

1. **Build failure**: `src/components/onboarding/AdvancedOnboardingWizard.jsx` imported `@/functions/onboardingFlowConfig` which did not exist in `src/`. Fix: copied both `onboardingFlowConfig.ts` and `activationFlowConfig.ts` into `src/functions/`.

2. **ESLint failure**: 220 unused-import errors across 40+ files. Fix: ran `eslint --fix` to auto-remove unused imports.

3. **Parse errors in docs**: `*.md.jsx` and `*.json.jsx` files in `src/components/docs/` are raw markdown/JSON, not valid JavaScript. Fix: added global ESLint ignore patterns.

4. **Critical npm vulnerability**: `jspdf@2.5.2` had a critical path traversal CVE (GHSA-f8cm-6447-x5h2) and arbitrary JS execution via AcroForm. Fix: upgraded to `jspdf@4.2.0`.

**Remaining Concern**:

The `vitest.config.js` sets coverage thresholds at 90%:
```javascript
thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 }
```
With ~2% actual coverage, running `npm run test:coverage` would fail. The CI pipeline currently runs `npm test` (not coverage), so this is not currently blocking CI. However, it creates a false sense of security.

**Recommendation** (Medium priority): Either:
- Remove the 90% thresholds and add a comment to set them incrementally
- Or add `npm run test:coverage` to the CI pipeline and set realistic initial thresholds (e.g., 20%)

---

### Feature 5: Dependency Management (`package.json`)

**Positive observations**:
- Dependencies are well-curated for the feature set
- `@tanstack/react-query` v5, Framer Motion v11, and Recharts v2 are all current
- Testing dependencies (Vitest, Testing Library) are appropriate

**Concerns**:

**(a) Unused dependencies** — Low priority

Several dependencies appear to have no usage in `src/`:
- `three` (3D rendering library) — no imports found
- `react-leaflet` (map rendering) — no imports found  
- `react-quill` (rich text editor) — no imports found; also carries a moderate XSS vulnerability via `quill@1.3.7`

**Recommendation**: Run `npx depcheck` and remove unused packages. Each removed package reduces bundle size and attack surface.

**(b) `moment` should be replaced with `date-fns`** — Low priority

Both `moment` (legacy, non-tree-shakeable) and `date-fns` (modern, tree-shakeable) are in `dependencies`. `date-fns` is the correct modern choice; `moment` adds ~67KB to the bundle.

```bash
# Remove moment
npm uninstall moment
# date-fns is already installed
```

---

## Summary of Actionable Recommendations

### Critical (Fix Before Any Production Release)

| # | Item | File(s) | Action |
|---|------|---------|--------|
| C1 | Build failure (missing modules) | `src/functions/` | ✅ Fixed |
| C2 | Critical npm vulnerabilities | `package.json` | ✅ Fixed |
| C3 | CI ESLint failures | Multiple components | ✅ Fixed |
| C4 | XSS via regex-based sanitization | `src/utils/index.ts` | ✅ Fixed |

### High Priority (Fix Before Beta/Preview)

| # | Item | File(s) | Effort |
|---|------|---------|--------|
| H1 | Apply `sanitizeInput` to `dangerouslySetInnerHTML` sites | `src/components/ui/chart.jsx` + others | 2h |
| H2 | Enable `requiresAuth: true` in production | `src/api/base44Client.js` | 30min |
| H3 | Add route-level error boundaries | `src/App.jsx` | 2h |
| H4 | Increase test coverage to ≥40% | `src/components/`, `src/pages/` | 16h |

### Medium Priority (Improve Before Launch)

| # | Item | File(s) | Effort |
|---|------|---------|--------|
| M1 | Extract Base44 calls into custom hooks | `src/hooks/` | 8h |
| M2 | Align coverage thresholds with reality | `vitest.config.js` | 30min |
| M3 | Replace `console.error` for expected auth states | `src/lib/AuthContext.jsx` | 1h |
| M4 | Remove `moment` (use `date-fns`) | `package.json` | 2h |

### Low Priority (Nice to Have)

| # | Item | File(s) | Effort |
|---|------|---------|--------|
| L1 | Add "Try Again" to ErrorBoundary | `src/components/ErrorBoundary.jsx` | 30min |
| L2 | Create a service layer abstraction | `src/services/` | 16h |
| L3 | Remove unused dependencies (three, react-leaflet) | `package.json` | 1h |
| L4 | Adopt TypeScript consistently | All source files | 40h |

---

## Security Summary

| Vulnerability | Severity | Status | Notes |
|---------------|----------|--------|-------|
| `jspdf` path traversal (GHSA-f8cm-6447-x5h2) | Critical | ✅ Fixed | Upgraded to 4.2.0 |
| `jspdf` AcroForm JS injection (GHSA-pqxr-3g65-p328) | High | ✅ Fixed | Upgraded to 4.2.0 |
| `jspdf` ReDoS (GHSA-w532-jxjh-hjhj) | High | ✅ Fixed | Upgraded to 4.2.0 |
| `axios` DoS via `__proto__` (GHSA-43fc-jf86-j433) | High | ✅ Fixed | Via `npm audit fix` |
| `minimatch` ReDoS (GHSA-3ppc-4f35-3m26) | High | ✅ Fixed | Via `npm audit fix` |
| `rollup` path traversal (GHSA-mw96-cpmx-2vgc) | High | ✅ Fixed | Via `npm audit fix` |
| Regex-based XSS sanitization | High | ✅ Fixed | Replaced with DOMPurify 3.3.3 |
| `quill` XSS (via react-quill) | Moderate | ⚠️ Open | `react-quill` fix is a breaking change (0.0.2); evaluate removal |
| `ajv` ReDoS (GHSA-2g4f-4pwh-qvx6) | Moderate | ⚠️ Open | Transitive dep; auto-fix not available |
| `requiresAuth: false` | Medium | ⚠️ Open | Does not enforce auth at SDK level in production |

---

*This audit was performed against commit `6fe5498`. All fixes described above are included in the accompanying pull request.*
