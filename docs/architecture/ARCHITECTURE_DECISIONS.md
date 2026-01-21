# Architecture Decision Records (ADR)

**Status:** ⚠️ **Not Started** - High Priority

---

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

- [ARCHITECTURE.md](../../ARCHITECTURE.md) - System architecture overview
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
