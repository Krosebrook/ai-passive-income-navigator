# Monitoring and Observability Guide

**Version:** 1.0  
**Last Updated:** 2026-01-19

---

## Table of Contents

- [Overview](#overview)
- [What to Monitor](#what-to-monitor)
- [Core Web Vitals](#core-web-vitals)
- [API and Cloud Function Metrics](#api-and-cloud-function-metrics)
- [Error Rate Monitoring](#error-rate-monitoring)
- [User Engagement Metrics](#user-engagement-metrics)
- [How to Monitor](#how-to-monitor)
- [Alerting Thresholds](#alerting-thresholds)
- [Dashboard Setup](#dashboard-setup)
- [Performance Budgets](#performance-budgets)
- [On-Call Checklist](#on-call-checklist)

---

## Overview

The AI Passive Income Navigator is a client-side SPA backed by Base44 BaaS. Monitoring spans three domains:

1. **Frontend performance** — Core Web Vitals, JavaScript errors, bundle size
2. **Backend health** — Base44 API latency, cloud function errors, rate limits
3. **Business health** — active users, feature engagement, funnel conversion

Since the frontend is static (no server to monitor), all runtime observability is instrumented in the browser and reported to the Base44 platform and/or third-party services.

---

## What to Monitor

### Priority Matrix

| Signal | Impact | Collection Method |
|--------|--------|------------------|
| JavaScript errors (unhandled) | P0 | Sentry / `recordError` function |
| Authentication failures (401 rate) | P0 | Base44 dashboard |
| Cloud function error rate | P1 | Base44 function logs |
| Core Web Vitals (LCP, FID, CLS) | P1 | Web Vitals API + analytics |
| API response time p95 | P1 | Browser performance timing |
| Rate limit hits (429 rate) | P2 | Base44 dashboard |
| Daily/weekly active users | P2 | Analytics events |
| Feature usage (deal pipeline, AI analysis) | P3 | Custom analytics events |

---

## Core Web Vitals

Google's Core Web Vitals are the primary frontend performance signals.

### Definitions and Targets

| Metric | Full Name | Target (Good) | Needs Work | Poor |
|--------|-----------|--------------|------------|------|
| **LCP** | Largest Contentful Paint | < 2.5s | 2.5–4.0s | > 4.0s |
| **FID** | First Input Delay | < 100ms | 100–300ms | > 300ms |
| **CLS** | Cumulative Layout Shift | < 0.1 | 0.1–0.25 | > 0.25 |
| **INP** | Interaction to Next Paint | < 200ms | 200–500ms | > 500ms |
| **TTFB** | Time to First Byte | < 800ms | 800ms–1.8s | > 1.8s |
| **FCP** | First Contentful Paint | < 1.8s | 1.8–3.0s | > 3.0s |

### Measuring Core Web Vitals

Use the `web-vitals` library to capture and report metrics:

```typescript
// src/lib/vitals.ts
import { onCLS, onFID, onLCP, onINP, onTTFB, onFCP } from 'web-vitals';

function sendToAnalytics({ name, value, rating, id }: MetricResult) {
  // Report to Base44 analytics collection
  base44.entities.analytics.create({
    event_type: 'web_vital',
    properties: { metric: name, value, rating, id },
    page_path: window.location.pathname,
  });
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onTTFB(sendToAnalytics);
onFCP(sendToAnalytics);
```

Add to `src/main.tsx`:

```typescript
import { reportWebVitals } from './lib/vitals';
reportWebVitals();
```

---

## API and Cloud Function Metrics

### Metrics to Track

| Metric | Collection | Alert Threshold |
|--------|-----------|-----------------|
| API request count | Browser perf timing | — (informational) |
| API response time p50 | Browser perf timing | Alert if p95 > 2s |
| API response time p95 | Browser perf timing | Alert if p95 > 5s |
| Cloud function duration p95 | Base44 dashboard | Alert if > 25s |
| 4xx error rate | Base44 dashboard | Alert if > 5% of requests |
| 5xx error rate | Base44 dashboard | Alert if > 1% of requests |
| 429 rate limit rate | Base44 dashboard | Alert if > 2% of requests |

### Browser Performance Timing

Wrap API calls to capture timing data:

```typescript
// src/lib/apiTiming.ts
export async function timedRequest<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    recordTiming(name, duration, 'success');
    return result;
  } catch (err) {
    const duration = performance.now() - start;
    recordTiming(name, duration, 'error');
    throw err;
  }
}

function recordTiming(name: string, duration: number, status: string) {
  performance.measure(name, { detail: { duration, status } });
  if (import.meta.env.PROD) {
    // Batch and send to analytics
    timingBuffer.push({ name, duration, status, ts: Date.now() });
  }
}
```

---

## Error Rate Monitoring

### JavaScript Error Capture

**Option A: Sentry (Recommended for Production)**

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  beforeSend(event) {
    // Scrub PII before sending
    delete event.user?.email;
    return event;
  },
});
```

**Option B: Base44 `recordError` Cloud Function**

For simpler setups without Sentry, use the built-in `recordError` function:

```typescript
window.addEventListener('unhandledrejection', (event) => {
  base44.functions.recordError({
    message: event.reason?.message ?? String(event.reason),
    stack: event.reason?.stack,
    type: 'unhandled_promise_rejection',
    url: window.location.href,
  });
});
```

### Error Budget

| Period | Allowed Error Budget | Action if Exceeded |
|--------|--------------------|--------------------|
| 5 minutes | 0 P0 errors | Immediate page |
| 1 hour | < 0.1% request error rate | Investigate |
| 24 hours | < 0.5% request error rate | Review in standup |

---

## User Engagement Metrics

Track the following business metrics via the `analytics` collection:

### Key Metrics

| Metric | Definition | Target (MVP) |
|--------|-----------|-------------|
| Daily Active Users (DAU) | Unique users with ≥1 event | Establish baseline |
| Weekly Active Users (WAU) | Unique users in 7-day window | Establish baseline |
| DAU/MAU ratio | Stickiness indicator | > 20% healthy |
| Feature adoption — Deal Pipeline | % users who added ≥1 deal | > 40% of active users |
| Feature adoption — AI Analysis | % users who ran ≥1 analysis | > 60% of active users |
| Onboarding completion | % users who finished onboarding | > 70% |
| Session duration | Average minutes per session | > 5 min |
| Ideas created per user | Average per active user per week | > 2 |

### Tracking Implementation

```typescript
// src/lib/analytics.ts
export function trackEvent(
  eventType: string,
  properties: Record<string, unknown> = {},
  entityType?: string,
  entityId?: string
) {
  if (!user) return;
  base44.entities.analytics.create({
    event_type: eventType,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    session_id: getSessionId(),
    page_path: window.location.pathname,
    properties,
  });
}

// Usage:
trackEvent('deal_added_to_pipeline', { category: 'saas' }, 'deal', dealId);
trackEvent('ai_analysis_completed', { score: 78, recommendation: 'buy' });
```

---

## How to Monitor

### 1. Browser Console (Development)

During local development, monitor:
- React Query DevTools (open with floating button in bottom-right)
- Browser DevTools → Performance tab for render bottlenecks
- Network tab filtered to `base44` domain for API latency
- Console for unhandled errors and warnings

### 2. Base44 Dashboard

Log in to the Base44 dashboard to view:

| Section | What to check |
|---------|--------------|
| **Functions** | Error rates, execution durations, cold starts |
| **Database** | Read/write counts, slow queries |
| **Authentication** | Login success/failure rates |
| **Logs** | Real-time streaming log viewer |

**Access:** `https://app.base44.com/[appId]/functions`

### 3. Sentry (Production)

After integrating Sentry:
- View error frequency, affected users, and release regression in the **Issues** tab.
- Set up **Performance** monitoring for transaction traces.
- Configure **Alerts** to page on-call for new P0/P1 errors.

### 4. Custom Dashboard (Recharts + Base44 Query)

Build an internal monitoring dashboard using the `analytics` collection:

```typescript
// Query for error events in the last 24 hours
const { data: errors } = useQuery({
  queryKey: ['monitoring', 'errors', '24h'],
  queryFn: () => base44.entities.analytics.filter({
    event_type: 'error',
    created_date__gte: new Date(Date.now() - 86_400_000).toISOString(),
  }),
  refetchInterval: 60_000, // Refresh every minute
});
```

---

## Alerting Thresholds

### Severity Levels

| Severity | Response Time | Notification |
|----------|-------------|-------------|
| **P0 — Critical** | Immediate (< 15 min) | PagerDuty / SMS |
| **P1 — High** | Within 1 hour | Slack + email |
| **P2 — Medium** | Within 4 hours | Slack |
| **P3 — Low** | Next business day | Email digest |

### Alert Rules

| Condition | Severity | Threshold |
|-----------|----------|-----------|
| Unhandled JavaScript exceptions | P0 | Any new exception type |
| API 5xx error rate | P0 | > 1% over 5 min |
| Authentication 100% failure (all logins fail) | P0 | 100% failure rate |
| Cloud function 5xx rate | P1 | > 5% over 15 min |
| LCP degradation | P1 | > 4.0s for p75 |
| API p95 latency | P1 | > 5 seconds |
| Rate limit (429) frequency | P2 | > 50 hits/hour |
| CLS regression | P2 | > 0.25 for p75 |
| DAU drops > 30% day-over-day | P2 | Engagement regression |

---

## Dashboard Setup

### Recommended Dashboard Panels

Create a monitoring dashboard with the following panels (implementable in the app's admin section using Recharts):

**Row 1 — Health Overview**
- Total errors (last 24h) — number widget
- API error rate % — gauge chart
- Active users (last 1h) — number widget
- System status — green/red indicator

**Row 2 — Performance**
- LCP trend (7 days) — line chart
- API response time p50/p95 (24h) — dual line chart
- Cloud function durations (24h) — bar chart

**Row 3 — Engagement**
- DAU/WAU trend (30 days) — area chart
- Feature adoption by feature — horizontal bar chart
- Top errors by frequency — table

**Row 4 — Business**
- Ideas created (7 days) — bar chart
- Deals analysed (7 days) — bar chart
- Pipeline deals by stage — funnel chart

---

## Performance Budgets

See [PERFORMANCE_BASELINE.md](./PERFORMANCE_BASELINE.md) for full details. Summary:

| Asset | Budget |
|-------|--------|
| Initial JS bundle (gzipped) | < 250 KB |
| Total page weight | < 1 MB |
| LCP | < 2.5s on 4G |
| API call (95th percentile) | < 2s |
| Cloud function (AI analysis) | < 30s |
| Time to Interactive | < 5s on mid-tier mobile |

Set bundle size alerts in CI:

```yaml
# .github/workflows/ci.yml
- name: Check bundle size
  run: |
    npm run build
    SIZE=$(du -sk dist/assets/*.js | awk '{sum += $1} END {print sum}')
    if [ $SIZE -gt 512 ]; then
      echo "::error::Bundle size ${SIZE}KB exceeds 512KB budget"
      exit 1
    fi
```

---

## On-Call Checklist

When on-call or responding to an incident:

1. **Check Base44 status page** — is the platform itself degraded?
2. **Check Sentry** — new error types in the last 30 minutes?
3. **Check Base44 function logs** — any 5xx spikes in specific functions?
4. **Check DAU** — unexpected drop in active users?
5. **Check deployment history** — was there a recent release?
6. **Run smoke tests** — can you log in, load the dashboard, create an idea?
7. **Check rate limits** — are any users hitting 429 errors?

See [RUNBOOK.md](./RUNBOOK.md) for step-by-step remediation procedures.

---

*Related: [Runbook](RUNBOOK.md) · [Performance Baseline](PERFORMANCE_BASELINE.md) · [Error Handling](../api/ERROR_HANDLING.md) · [Incident Response](../security/INCIDENT_RESPONSE.md)*

## Purpose

This document will define metrics, logging, alerting, and monitoring strategies for the AI Passive Income Navigator platform.

## Current State

**Monitoring Status:** ❌ **NONE**
- No error tracking configured
- No performance monitoring
- No user analytics
- No log aggregation
- No alerting system

**This is a production-blocking gap.**

---

## Planned Sections

### 1. Metrics to Track (RED Method)

#### Rate Metrics
- API requests per second
- User logins per hour
- Feature usage rates
- Cloud function invocations

#### Error Metrics
- Error rate (errors per minute)
- Error types distribution
- Failed API calls
- Failed cloud function executions

#### Duration Metrics
- API response time (P50, P95, P99)
- Page load time
- Cloud function execution time
- Database query performance

### 2. Logging Strategy

#### Log Levels
- DEBUG - Development only
- INFO - Normal operations
- WARN - Degraded performance
- ERROR - Application errors
- CRITICAL - System failures

#### Structured Logging Format
```json
{
  "timestamp": "2026-01-21T21:00:00Z",
  "level": "ERROR",
  "message": "Failed to load portfolio items",
  "correlationId": "abc-123-def",
  "userId": "user-456",
  "error": {
    "type": "NetworkError",
    "code": "TIMEOUT",
    "details": "..."
  }
}
```

#### Log Aggregation
- Tool selection: [Logtail? Papertrail? Base44 logs?]
- Retention period: [To be determined]
- Query capabilities

### 3. Error Tracking

#### Recommended Tool: **Sentry**
- Client-side error tracking
- Server-side error tracking (cloud functions)
- Error grouping and deduplication
- User session replay
- Performance monitoring

#### Configuration
```javascript
// Example Sentry setup (to be implemented)
Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_ENVIRONMENT,
  tracesSampleRate: 1.0,
});
```

### 4. Alerting Rules

#### Critical Alerts (Page On-Call)
- Error rate > 5% for 5 minutes
- API downtime > 1 minute
- Database connection failures
- Authentication service down

#### Warning Alerts (Email/Slack)
- Error rate > 1% for 10 minutes
- Response time P95 > 2 seconds
- Failed background jobs
- Low disk space (if self-hosted)

#### Informational Alerts
- Deployment started/completed
- Database backup completed
- Daily metrics summary

### 5. Dashboards

#### Operations Dashboard
- System health overview
- Error rates and trends
- Response time trends
- Active users

#### Business Metrics Dashboard
- New user signups
- Portfolio item creation rate
- AI chat usage
- Feature adoption rates

### 6. Performance Monitoring

#### Real User Monitoring (RUM)
- Page load times
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)

#### Synthetic Monitoring
- Uptime checks (every 1 minute)
- Critical user flow checks (every 5 minutes)
- API endpoint health checks

### 7. On-Call Runbooks

See [RUNBOOK.md](./RUNBOOK.md) for detailed procedures.

Quick reference:
- High error rate → Check recent deployments, rollback if needed
- Slow response times → Check database performance, CDN status
- Authentication failures → Check Base44 status, token expiry

---

## Implementation Checklist

- [ ] Select monitoring tools (Sentry, Plausible, etc.)
- [ ] Set up error tracking (Sentry)
- [ ] Configure logging (structured logs)
- [ ] Create dashboards (operations, business)
- [ ] Define alerting rules
- [ ] Set up on-call rotation
- [ ] Document runbooks
- [ ] Test alerting system

---

**Priority:** P0 - CRITICAL  
**Estimated Documentation Time:** 3 days  
**Estimated Implementation Time:** 1 week  
**Assigned To:** [Unassigned]  
**Target Completion:** [Not Set]

---

*This placeholder was created during the 2026-01-21 documentation audit.*
*RISK: Cannot detect production issues without monitoring.*
