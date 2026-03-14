# API Error Handling

**Version:** 1.0  
**Last Updated:** 2026-01-19

---

## Table of Contents

- [Overview](#overview)
- [HTTP Status Codes](#http-status-codes)
- [Base44 Error Response Format](#base44-error-response-format)
- [Cloud Function Error Format](#cloud-function-error-format)
- [Client-Side Error Handling](#client-side-error-handling)
- [React Error Boundaries](#react-error-boundaries)
- [Retry Logic and Exponential Backoff](#retry-logic-and-exponential-backoff)
- [Error Correlation IDs](#error-correlation-ids)
- [Common Error Scenarios](#common-error-scenarios)
- [Logging and Monitoring](#logging-and-monitoring)

---

## Overview

The AI Passive Income Navigator communicates with the Base44 BaaS platform over HTTPS/REST. Errors can originate from:

1. **Base44 SDK** – collection CRUD operations, authentication
2. **Cloud Functions** – TypeScript/Deno serverless functions returning `Response.json()`
3. **Third-party integrations** – LLM calls (`InvokeLLM`), market data scraping
4. **Client-side validation** – Zod schema failures before a network request

All errors must be handled gracefully: the user should always see a meaningful message, never a raw stack trace.

---

## HTTP Status Codes

| Code | Name | When Used |
|------|------|-----------|
| `200` | OK | Successful read or mutation |
| `201` | Created | New entity successfully created |
| `400` | Bad Request | Invalid input — missing required fields, failed validation |
| `401` | Unauthorized | Missing or expired authentication token |
| `403` | Forbidden | Authenticated but insufficient permissions (e.g., accessing another user's data) |
| `404` | Not Found | Entity with given ID does not exist or is not visible to the requesting user |
| `429` | Too Many Requests | Rate limit exceeded (100 req/min for API, 10 req/min per cloud function) |
| `500` | Internal Server Error | Unexpected server-side error — bug in cloud function or Base44 platform issue |
| `503` | Service Unavailable | Base44 platform is temporarily unavailable (maintenance or incident) |

---

## Base44 Error Response Format

Base44 SDK errors expose the following structure when a collection operation fails:

```typescript
interface Base44Error {
  message: string;       // Human-readable error description
  code: string;          // Machine-readable error code, e.g., "NOT_FOUND", "UNAUTHORIZED"
  status: number;        // HTTP status code
  details?: unknown;     // Optional additional context
}
```

**Example — entity not found:**
```json
{
  "message": "Entity 'PortfolioItem' with id 'abc123' not found",
  "code": "NOT_FOUND",
  "status": 404
}
```

**Example — rate limit:**
```json
{
  "message": "Rate limit exceeded. Try again in 30 seconds.",
  "code": "RATE_LIMIT_EXCEEDED",
  "status": 429,
  "details": {
    "retry_after_seconds": 30,
    "limit": 100,
    "window": "60s"
  }
}
```

---

## Cloud Function Error Format

All cloud functions return errors in a consistent JSON format:

```typescript
// Success
Response.json({ ...data }, { status: 200 })

// Error
Response.json({ error: string, details?: unknown }, { status: number })
```

**Standard error responses used across cloud functions:**

```typescript
// 401 — Not authenticated
Response.json({ error: 'Unauthorized' }, { status: 401 })

// 400 — Missing required fields
Response.json({
  error: 'Missing required fields: dealName, dealDescription'
}, { status: 400 })

// 404 — Entity not found
Response.json({ error: 'Deal not found' }, { status: 404 })

// 500 — Unexpected error (caught in try/catch)
Response.json({ error: error.message }, { status: 500 })
```

**Handling in the client:**

```typescript
const response = await base44.functions.analyzeDeal({ dealName, dealDescription });
if (!response.ok) {
  const { error, details } = await response.json();
  throw new ApiError(error, response.status, details);
}
```

---

## Client-Side Error Handling

### TanStack Query Error Handling

All data fetching is wrapped by TanStack Query. Errors are surfaced via the `error` property of `useQuery` / `useMutation`:

```typescript
const { data, error, isError } = useQuery({
  queryKey: ['portfolio'],
  queryFn: () => base44.entities.PortfolioItem.list(),
  retry: (failureCount, error) => {
    // Do not retry on 4xx errors (client errors)
    if (error?.status >= 400 && error?.status < 500) return false;
    return failureCount < 3;
  },
});

if (isError) {
  if (error.status === 401) {
    // Redirect to login
  } else if (error.status === 429) {
    // Show rate-limit toast with retry_after time
  } else {
    // Show generic error message
  }
}
```

### Global Query Error Handler

Configure a global `onError` callback in the QueryClient to catch unhandled errors:

```typescript
// src/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      retry: retryStrategy,
    },
    mutations: {
      onError: (error: unknown) => {
        const message = getErrorMessage(error);
        toast({ title: 'Something went wrong', description: message, variant: 'destructive' });
      },
    },
  },
});

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred. Please try again.';
}
```

### Custom ApiError Class

```typescript
// src/lib/errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
    public readonly correlationId?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isClientError() { return this.status >= 400 && this.status < 500; }
  get isServerError() { return this.status >= 500; }
  get isRateLimited() { return this.status === 429; }
  get isUnauthorized() { return this.status === 401; }
}
```

---

## React Error Boundaries

Error Boundaries catch unexpected render errors and prevent the entire app from crashing.

### Route-Level Error Boundary

Wrap each page route with an error boundary to isolate failures:

```tsx
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Report to Sentry or Base44 recordError function
    console.error('Render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground">{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Usage in router:**

```tsx
<Route path="/portfolio" element={
  <ErrorBoundary>
    <PortfolioPage />
  </ErrorBoundary>
} />
```

### Async Error Handling with Suspense

For async data loading errors, use React Query's `throwOnError` combined with Error Boundaries:

```tsx
const { data } = useQuery({
  queryKey: ['ideas'],
  queryFn: fetchIdeas,
  throwOnError: (error) => error.status >= 500, // Only throw server errors
});
```

---

## Retry Logic and Exponential Backoff

### TanStack Query Retry Strategy

```typescript
function retryStrategy(failureCount: number, error: unknown): boolean {
  // Never retry 4xx errors — they are deterministic
  if (error instanceof ApiError && error.isClientError) return false;

  // Retry server errors and network errors up to 3 times
  return failureCount < 3;
}

function retryDelay(attemptIndex: number): number {
  // Exponential backoff: 1s, 2s, 4s with ±20% jitter
  const base = Math.min(1000 * 2 ** attemptIndex, 30000);
  const jitter = base * 0.2 * (Math.random() - 0.5);
  return Math.round(base + jitter);
}

// Apply in QueryClient:
defaultOptions: {
  queries: { retry: retryStrategy, retryDelay },
  mutations: { retry: 0 }, // Never retry mutations automatically
}
```

### Rate Limit Retry (429)

When a 429 response is received, honour the `retry_after_seconds` from the response body:

```typescript
function rateLimitRetryDelay(error: ApiError): number {
  const retryAfter = (error.details as { retry_after_seconds?: number })?.retry_after_seconds;
  return retryAfter ? retryAfter * 1000 : 30_000;
}
```

### Cloud Function Timeout Handling

Cloud functions may take up to 30 seconds for LLM calls. Implement an `AbortController` timeout on the client:

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 45_000); // 45s client timeout

try {
  const result = await base44.functions.analyzeDeal(payload, { signal: controller.signal });
} catch (err) {
  if (err.name === 'AbortError') {
    throw new ApiError('Analysis timed out. Please try again.', 408);
  }
  throw err;
} finally {
  clearTimeout(timeout);
}
```

---

## Error Correlation IDs

For production debugging, every cloud function error response should include a correlation ID:

**Cloud function (Deno):**
```typescript
import { crypto } from 'https://deno.land/std/crypto/mod.ts';

Deno.serve(async (req) => {
  const correlationId = crypto.randomUUID();
  try {
    // ... function logic
  } catch (error) {
    console.error(`[${correlationId}] Error:`, error);
    return Response.json({
      error: error.message,
      correlationId,
    }, { status: 500 });
  }
});
```

**Client-side:**
```typescript
if (error.status === 500) {
  toast({
    title: 'Server error',
    description: `Something went wrong. Reference: ${error.correlationId}`,
    variant: 'destructive',
  });
}
```

---

## Common Error Scenarios

### 401 — Session Expired

**Cause:** JWT token expired or Base44 session invalidated.  
**Detection:** Any API call returns 401.  
**Resolution:**
1. Clear local React Query cache: `queryClient.clear()`
2. Redirect user to the login page.
3. After re-authentication, restore the previous page URL.

```typescript
if (error.status === 401) {
  queryClient.clear();
  navigate('/login', { state: { returnTo: location.pathname } });
}
```

---

### 403 — Accessing Another User's Data

**Cause:** Attempting to read/write a record where `created_by !== currentUser.email`.  
**Detection:** 403 on entity fetch with a valid session.  
**Resolution:** Show "Access Denied" page. Do not expose the entity's details. Log and review for security implications.

---

### 429 — Rate Limit Exceeded

**Cause:** More than 100 API requests per minute, or more than 10 cloud function calls per minute for a specific function.  
**Detection:** 429 response with `retry_after_seconds` in body.  
**Resolution:**
1. Show a non-dismissible toast: "You've made too many requests. Please wait N seconds."
2. Disable action buttons for the retry period.
3. Apply exponential backoff on automatic retries.

---

### 500 — Cloud Function Crash

**Cause:** Unhandled exception in a Deno cloud function, or LLM API failure.  
**Detection:** 500 response with `error` and optional `correlationId`.  
**Resolution:**
1. Show user: "Analysis failed. Our team has been notified. Reference: [ID]"
2. Log to `recordError` cloud function with the correlation ID.
3. Investigate in Base44 function logs.

---

### 503 — Base44 Platform Unavailable

**Cause:** Base44 scheduled maintenance or infrastructure incident.  
**Detection:** 503 on any API call; often accompanied by a Base44 status page update.  
**Resolution:**
1. Show a site-wide banner: "Service temporarily unavailable. Please check back shortly."
2. Disable all write actions.
3. Monitor [Base44 Status Page](https://status.base44.com) (placeholder URL).
4. Retry automatically every 60 seconds with a user-visible countdown.

---

### LLM Analysis Timeout

**Cause:** `InvokeLLM` in a cloud function exceeds the 30-second window.  
**Detection:** Client receives a 408 (client-side timeout) or the function returns a 500.  
**Resolution:**
1. Show: "Analysis is taking longer than expected. This can happen with complex deals — try again."
2. Offer a "Retry" button that re-submits the same request.
3. For very large inputs, suggest breaking the analysis into smaller pieces.

---

### Network Offline

**Cause:** User's device loses internet connectivity.  
**Detection:** `navigator.onLine === false` or fetch throws a `TypeError: Failed to fetch`.  
**Resolution:**
```typescript
window.addEventListener('offline', () => {
  toast({
    title: 'No internet connection',
    description: 'Changes will be saved when you reconnect.',
    duration: Infinity,
  });
  queryClient.cancelQueries();
});
```

---

## Logging and Monitoring

### Client-Side Error Logging

Use the `recordError` cloud function to log errors from the browser:

```typescript
// src/lib/errorReporter.ts
export async function reportError(error: Error, context?: Record<string, unknown>) {
  if (import.meta.env.PROD) {
    try {
      await base44.functions.recordError({
        message: error.message,
        stack: error.stack,
        context,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Silently swallow — don't throw from error reporter
    }
  }
}
```

### Sentry Integration (Recommended for Production)

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  integrations: [
    Sentry.reactRouterV6BrowserTracingIntegration({ useEffect, useLocation, useNavigationType, createRoutesFromChildren, matchRoutes }),
  ],
});
```

---

*Related: [API Documentation](../API.md) · [Monitoring Guide](../operations/MONITORING.md) · [Incident Response](../security/INCIDENT_RESPONSE.md)*

## Purpose

This document will define error handling strategies, error code taxonomy, retry logic, and client-side error handling patterns for the AI Passive Income Navigator API.

## Planned Sections

### 1. Error Code Taxonomy
- HTTP status codes (4xx client errors, 5xx server errors)
- Custom error codes and meanings
- Error response format (JSON schema)

### 2. Retry Strategies
- Exponential backoff algorithm
- Maximum retry attempts
- Idempotency guarantees
- Retry-safe vs. non-retry-safe operations

### 3. Client-Side Error Handling
- Error boundary implementation
- User-facing error messages
- Error logging and tracking
- Graceful degradation strategies

### 4. Error Logging & Correlation
- Error correlation IDs
- Structured logging format
- Integration with monitoring tools (Sentry, etc.)

### 5. Common Error Scenarios
- Authentication failures (401, 403)
- Rate limiting (429)
- Validation errors (400, 422)
- Server errors (500, 503)
- Network timeouts

---

## Dependencies

- See [API Documentation](./OVERVIEW.md) for API structure
- See [MONITORING.md](../operations/MONITORING.md) for error tracking
- See [CLOUD_FUNCTIONS_REFERENCE.md](./cloud-functions/REFERENCE.md) for function-specific errors

---

**Priority:** P0 - CRITICAL  
**Estimated Documentation Time:** 2 days  
**Assigned To:** [Unassigned]  
**Target Completion:** [Not Set]

---

*This placeholder was created during the 2026-01-21 documentation audit.*
