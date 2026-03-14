# Performance Baseline & SLOs

**Version:** 1.0  
**Last Updated:** 2026-01-19  
**Stage:** Prototype / MVP

---

## Table of Contents

- [Overview](#overview)
- [SLI / SLO Definitions](#sli--slo-definitions)
- [Target Metrics](#target-metrics)
- [Current Baseline](#current-baseline)
- [Measurement Methodology](#measurement-methodology)
- [Performance Budgets](#performance-budgets)
- [Alerting Thresholds](#alerting-thresholds)
- [Performance Testing Approach](#performance-testing-approach)
- [Optimization Playbook](#optimization-playbook)

---

## Overview

Performance is a user experience metric as much as a technical one. For the AI Passive Income Navigator, two categories of performance matter:

1. **Page/UI Performance** — How fast pages load and respond to user interaction (Core Web Vitals)
2. **API / Function Performance** — How fast data fetches and AI analyses complete

This document defines targets, the methodology for measuring them, and the thresholds that trigger action.

---

## SLI / SLO Definitions

### Service Level Indicators (SLIs)

| SLI | Definition | Unit |
|-----|-----------|------|
| **Availability** | % of minutes the app is accessible | % |
| **LCP** | Largest Contentful Paint at p75 | seconds |
| **INP** | Interaction to Next Paint at p75 | milliseconds |
| **CLS** | Cumulative Layout Shift at p75 | score |
| **API Latency p50** | 50th percentile API response time | milliseconds |
| **API Latency p95** | 95th percentile API response time | milliseconds |
| **AI Function Latency p95** | 95th percentile for LLM-powered functions | seconds |
| **Error Rate** | % of API requests resulting in 4xx/5xx | % |

### Service Level Objectives (SLOs)

| SLI | SLO Target | Measurement Window |
|-----|-----------|-------------------|
| Availability | ≥ 99.0% | Monthly |
| LCP (p75) | < 2.5s | Weekly rolling average |
| INP (p75) | < 200ms | Weekly rolling average |
| CLS (p75) | < 0.10 | Weekly rolling average |
| API Latency p50 | < 300ms | Daily |
| API Latency p95 | < 2,000ms | Daily |
| AI Function Latency p95 | < 25s | Daily |
| Error Rate (non-AI) | < 1% | Daily |
| Error Rate (AI functions) | < 5% | Daily |

> **Note:** These SLOs are aspirational targets for the prototype stage. Formal SLA commitments to users should not be made until the application reaches production maturity.

---

## Target Metrics

### Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor | Our Target |
|--------|------|------------------|------|-----------|
| **LCP** | < 2.5s | 2.5–4.0s | > 4.0s | **< 2.5s** |
| **FID** | < 100ms | 100–300ms | > 300ms | **< 100ms** |
| **CLS** | < 0.10 | 0.10–0.25 | > 0.25 | **< 0.10** |
| **INP** | < 200ms | 200–500ms | > 500ms | **< 200ms** |
| **FCP** | < 1.8s | 1.8–3.0s | > 3.0s | **< 2.0s** |
| **TTFB** | < 800ms | 800ms–1.8s | > 1.8s | **< 600ms** |

### API Response Time Targets

| Operation Type | p50 Target | p95 Target | Notes |
|---------------|-----------|-----------|-------|
| Entity read (single) | < 100ms | < 300ms | e.g., fetch portfolio item |
| Entity list (paginated) | < 150ms | < 500ms | e.g., ideas list |
| Entity create/update | < 200ms | < 600ms | e.g., create idea |
| Entity delete | < 100ms | < 300ms | |
| Cloud function (non-LLM) | < 500ms | < 2s | e.g., calculatePipelineAnalytics |
| Cloud function (LLM-powered) | < 10s | < 25s | e.g., analyzeDeal, generateIdeas |
| Cloud function (LLM + web search) | < 15s | < 30s | e.g., analyzeDeal with `add_context_from_internet: true` |

### Bundle Size Budgets

| Asset | Budget (gzipped) | Alert Threshold |
|-------|-----------------|----------------|
| Initial JS bundle | < 200 KB | > 250 KB |
| Total JS (all chunks) | < 500 KB | > 600 KB |
| CSS bundle | < 20 KB | > 30 KB |
| Total page weight (initial load) | < 1 MB | > 1.5 MB |

---

## Current Baseline

> **Status: Prototype stage** — Formal baseline measurements have not yet been captured. The following are estimated ranges based on the technology stack.

| Metric | Estimated Current | Target | Gap |
|--------|-----------------|--------|-----|
| LCP (p75) | 2.0–3.5s | < 2.5s | Likely within target; measure to confirm |
| FCP | 1.5–2.5s | < 2.0s | May need code splitting |
| CLS | 0.05–0.15 | < 0.10 | Monitor dynamic content loading |
| INP | 50–200ms | < 200ms | Likely within target |
| Initial JS bundle | ~300–450 KB | < 200 KB | **Needs improvement — see Optimization Playbook** |
| API read latency p95 | ~200–800ms | < 500ms | Dependent on Base44 region |
| AI function latency p95 | ~8–25s | < 25s | Within target; monitor LLM cold starts |

**Establishing the baseline:**

Run the following measurement protocol once before the first production launch:

1. Deploy a build to a staging environment
2. Run Lighthouse on 5 key pages: Dashboard, Ideas, Deal Pipeline, Portfolio, Community
3. Record p75 metrics from `web-vitals` library in the browser for 48 hours
4. Run `npm run build` and record gzipped bundle sizes
5. Document results in this table with a date stamp

---

## Measurement Methodology

### Real User Monitoring (RUM)

Use the `web-vitals` library to capture field data from real user sessions:

```typescript
// src/lib/vitals.ts
import { onCLS, onFID, onLCP, onINP, onFCP, onTTFB } from 'web-vitals';

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
}

const vitalsBuffer: VitalMetric[] = [];

function flushVitals() {
  if (vitalsBuffer.length === 0) return;
  const batch = [...vitalsBuffer];
  vitalsBuffer.length = 0;
  // Send to analytics collection
  base44.entities.analytics.create({
    event_type: 'web_vitals_batch',
    properties: { metrics: batch },
    page_path: window.location.pathname,
  });
}

// Flush every 30 seconds
setInterval(flushVitals, 30_000);
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushVitals();
});

[onCLS, onFID, onLCP, onINP, onFCP, onTTFB].forEach(fn =>
  fn((metric) => vitalsBuffer.push(metric as VitalMetric))
);
```

### Synthetic Monitoring (Lab Data)

Run **Lighthouse** on the production URL weekly:

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run Lighthouse on key pages (requires production URL)
lighthouse https://[production-url]/ --output json --output-path ./perf-reports/dashboard-$(date +%Y%m%d).json
lighthouse https://[production-url]/ideas --output json --output-path ./perf-reports/ideas-$(date +%Y%m%d).json
lighthouse https://[production-url]/deal-pipeline --output json --output-path ./perf-reports/deals-$(date +%Y%m%d).json

# Summarise scores
cat ./perf-reports/*.json | jq '{lcp: .audits["largest-contentful-paint"].numericValue, cls: .audits["cumulative-layout-shift"].numericValue, tbt: .audits["total-blocking-time"].numericValue}'
```

### API Timing

Capture API timing data using the Performance API:

```typescript
// Wrap all Base44 entity calls
function timedQuery<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const mark = `api-start-${key}-${Date.now()}`;
  performance.mark(mark);
  return fn().finally(() => {
    performance.measure(key, mark);
    const [entry] = performance.getEntriesByName(key);
    if (entry && import.meta.env.PROD) {
      apiTimingBuffer.push({ key, duration: entry.duration, timestamp: Date.now() });
    }
    performance.clearMarks(mark);
    performance.clearMeasures(key);
  });
}
```

### Bundle Size Measurement in CI

```bash
# In .github/workflows/ci.yml
- name: Measure bundle size
  run: |
    npm run build
    echo "=== Bundle sizes (gzipped) ==="
    for f in dist/assets/*.js; do
      SIZE=$(gzip -c "$f" | wc -c)
      echo "$f: ${SIZE} bytes ($(echo "$SIZE / 1024" | bc) KB)"
    done
    TOTAL=$(gzip -c dist/assets/*.js | wc -c)
    echo "Total JS gzipped: $(echo "$TOTAL / 1024" | bc) KB"
    if [ $TOTAL -gt 614400 ]; then  # 600 KB alert
      echo "::warning::JS bundle exceeds 600KB budget"
    fi
```

---

## Performance Budgets

These budgets are enforced in CI to prevent regressions:

| Budget | Value | CI Failure Threshold |
|--------|-------|---------------------|
| Initial JS chunk (gzipped) | < 200 KB | > 250 KB → CI warning |
| Total JS (all chunks, gzipped) | < 500 KB | > 600 KB → CI warning |
| CSS (gzipped) | < 20 KB | > 30 KB → CI warning |
| Number of render-blocking resources | 0 | > 0 → CI warning |
| Lighthouse Performance score | > 70 | < 60 → CI warning |

**Route-level code splitting** is essential to meet the initial JS budget. All page components should be lazy-loaded:

```typescript
// src/App.tsx — use React.lazy for all page routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DealPipeline = lazy(() => import('./pages/DealPipeline'));
const Ideas = lazy(() => import('./pages/Ideas'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
```

---

## Alerting Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| LCP p75 | > 3.0s | > 4.0s | Investigate render-blocking resources, image sizes |
| CLS p75 | > 0.15 | > 0.25 | Fix layout shift on dynamic content load |
| INP p75 | > 300ms | > 500ms | Profile long tasks, defer heavy JS |
| API p95 latency | > 1s | > 3s | Check Base44 status; add caching |
| AI function p95 | > 20s | > 28s | Check LLM cold starts; add loading state |
| Error rate | > 0.5% | > 2% | See Error Handling runbook |
| JS bundle size | > 500 KB | > 700 KB | Audit bundle, remove unused imports |

---

## Performance Testing Approach

### Types of Tests

| Test Type | Tool | When to Run | What It Catches |
|-----------|------|-------------|----------------|
| Unit performance | Vitest | Every commit | Algorithm complexity regressions |
| Component render timing | React DevTools Profiler | During development | Unnecessary re-renders |
| Page load performance | Lighthouse CLI | Weekly | Core Web Vitals regression |
| Bundle size analysis | `vite-bundle-visualizer` | After adding dependencies | Bundle bloat |
| Load testing | k6 or Artillery | Before major releases | API throughput limits |

### Vite Bundle Visualizer

Analyse the bundle composition after adding new dependencies:

```bash
npx vite-bundle-visualizer
# Opens an interactive treemap of bundle contents in the browser
```

Key things to look for:
- Unexpectedly large dependencies (e.g., moment.js at 70 KB vs day.js at 2 KB)
- Duplicated code (multiple copies of the same library from different imports)
- Large pages that should be code-split

### Load Testing (Pre-Production)

Before the first production launch, test Base44 API throughput:

```yaml
# k6 load test — k6.js
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up to 10 users
    { duration: '5m', target: 50 },   // Hold at 50 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% of requests < 2s
    http_req_failed: ['rate<0.01'],     // < 1% failure rate
  },
};
```

---

## Optimization Playbook

### If LCP > 2.5s

1. Check if the LCP element is an image — add `loading="eager"` and `fetchpriority="high"` to the hero image
2. Ensure fonts are preloaded: `<link rel="preload" as="font">`
3. Move critical CSS inline in `index.html`
4. Check for render-blocking scripts

### If CLS > 0.10

1. Add explicit `width` and `height` attributes to all images and avatars
2. Reserve space for dynamically loaded content (skeleton loaders)
3. Avoid inserting content above existing content except in response to user interaction
4. Fix Framer Motion animations that change layout (use `layout` prop correctly)

### If JS Bundle > 500 KB

1. Run `npx vite-bundle-visualizer` to identify large dependencies
2. Ensure all page components are lazily loaded (`React.lazy`)
3. Replace heavy libraries: `moment` → `date-fns`, `lodash` → native ES6
4. Tree-shake Recharts: only import needed chart components
5. Defer non-critical polyfills

### If API p95 > 2s

1. Check if React Query `staleTime` is set — increase to reduce re-fetches
2. Add optimistic updates for write operations
3. Paginate large list queries (ideally < 50 items per page)
4. Contact Base44 support if latency is platform-side

---

*Related: [Monitoring](MONITORING.md) · [Runbook](RUNBOOK.md) · [Architecture Decisions](../architecture/ARCHITECTURE_DECISIONS.md)*
