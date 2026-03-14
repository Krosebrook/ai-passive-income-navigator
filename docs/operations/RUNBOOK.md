# Operational Runbook

**Version:** 1.0  
**Last Updated:** 2026-01-19  
**Platform:** AI Passive Income Navigator on Base44

---

## Table of Contents

- [Deployment Process](#deployment-process)
- [Rollback Procedure](#rollback-procedure)
- [Common Operational Tasks](#common-operational-tasks)
  - [Clear Application Cache](#clear-application-cache)
  - [Reset User Data](#reset-user-data)
  - [Check Cloud Function Logs](#check-cloud-function-logs)
  - [Monitor Active Users](#monitor-active-users)
  - [Update Environment Configuration](#update-environment-configuration)
- [Incident Response Quick Reference](#incident-response-quick-reference)
- [Escalation Procedures](#escalation-procedures)
- [On-Call Checklist](#on-call-checklist)
- [Regular Maintenance Tasks](#regular-maintenance-tasks)

---

## Deployment Process

### Prerequisites

Before deploying, ensure:

- [ ] All CI checks pass on the feature branch (`npm run lint`, `npm run test`)
- [ ] PR has been reviewed and approved
- [ ] No open P0/P1 incidents
- [ ] Not deploying during peak hours (08:00–10:00 or 17:00–19:00 local time for primary user base)

### Standard Deployment Steps

**1. Merge to main branch**

```bash
git checkout main
git pull origin main
git merge --no-ff feature/your-feature
git push origin main
```

**2. CI/CD pipeline runs automatically**

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs:
- Lint: `npm run lint`
- Tests: `npm run test`
- Build: `npm run build`
- Bundle size check

Wait for all checks to pass. Do not proceed if any check fails.

**3. Publish via Base44**

Base44 applications are published through the Base44 dashboard:

```
1. Navigate to https://app.base44.com/[appId]
2. Click "Publish" → "Production"
3. Select the latest build artifact
4. Confirm deployment
```

**4. Verify deployment — Smoke Test Checklist**

- [ ] Application loads at the production URL
- [ ] Login/authentication works
- [ ] Dashboard displays correctly
- [ ] Ideas list loads (tests Base44 database read)
- [ ] Create a test idea (tests write operation)
- [ ] Run a quick AI analysis (tests cloud function invocation)
- [ ] Delete the test idea (cleanup)

**5. Monitor post-deployment (15 minutes)**

- Watch Sentry for new error types
- Check Base44 function logs for 5xx spikes
- Verify Core Web Vitals have not regressed (LCP < 2.5s)

**Deployment complete — announce in team Slack channel.**

---

## Rollback Procedure

### When to Rollback

Rollback immediately if, within 30 minutes of deployment:

- Error rate increases by > 2x baseline
- New P0 errors appear in Sentry
- Authentication is broken for any users
- Data read/write operations fail consistently

### Option A: Base44 Version Rollback (Preferred — < 5 minutes)

1. Log in to the Base44 dashboard: `https://app.base44.com/[appId]`
2. Navigate to **Deployments → History**
3. Find the last known good deployment (timestamp before the bad deploy)
4. Click **Rollback to this version**
5. Confirm. Traffic is immediately rerouted.
6. Run smoke test checklist to verify previous version is healthy.

### Option B: Git Revert + Redeploy

```bash
# Find the last good commit SHA
git log --oneline -10

# Revert the problematic commit
git revert <bad-commit-sha> --no-edit

# Push and let CI redeploy
git push origin main
```

### Option C: Emergency Hotfix

```bash
# Create hotfix branch from main
git checkout main && git pull
git checkout -b hotfix/critical-bug-description

# Make the minimal fix
# Test locally: npm run test && npm run build

# Push and fast-track PR review
git push origin hotfix/critical-bug-description
# Create PR, request emergency review, merge and deploy
```

### Post-Rollback Actions

1. Update the incident Slack channel: "Rollback complete. Service restored at HH:MM UTC."
2. Create a post-incident ticket: what broke, detection time, rollback time.
3. Complete a root-cause analysis within 48 hours.

---

## Common Operational Tasks

### Clear Application Cache

**React Query cache (client-side — per user session):**

The React Query cache lives in the browser. Users can clear it by:

- Logging out and back in (`queryClient.clear()` is called on logout)
- Hard-refreshing the page: `Ctrl+Shift+R` / `Cmd+Shift+R`

**Base44 platform cache:**

Trigger a re-fetch by updating the relevant document's `updated_date` field via the Base44 dashboard Database Explorer.

**CDN cache (static assets):**

After a new deployment, Vite's content-hash file naming (e.g., `main.a3f9b2c1.js`) cache-busts automatically. No manual CDN purge needed.

---

### Reset User Data

> ⚠️ **WARNING:** Data resets are irreversible. Confirm with the user in writing before proceeding.

**Reset a specific user's preferences (e.g., after onboarding bug):**

```
1. Navigate to Base44 Dashboard → Database → preferences
2. Filter: created_by = user@email.com
3. Select the document → Delete
4. The user will be prompted to re-complete onboarding on next login
```

**Delete test or junk data (support request):**

```
1. Navigate to Database → [collection name]
2. Filter: created_by = user@email.com, created_date__gte = [date range]
3. Select items → Bulk Delete
```

**Full user data export (GDPR data subject access request):**

Use the `exportUserData` cloud function:

```bash
# POST to the function with admin credentials
curl -X POST https://app.base44.com/api/functions/exportUserData \
  -H "Authorization: Bearer [admin-token]" \
  -H "Content-Type: application/json" \
  -d '{"targetUserEmail": "user@example.com"}'
# Returns: ZIP archive of all user collections as JSON
```

See [PRIVACY_POLICY.md](../legal/PRIVACY_POLICY.md) for data subject rights obligations.

---

### Check Cloud Function Logs

**Via Base44 Dashboard:**

```
1. Navigate to https://app.base44.com/[appId]/functions
2. Click the function name (e.g., analyzeDeal, categorizeDeal)
3. Select the "Logs" tab
4. Filter by time range or search for "ERROR"
```

**Common log patterns:**

```
# Healthy execution
[INFO] analyzeDeal: started for user@example.com
[INFO] analyzeDeal: LLM response received in 8234ms
[INFO] analyzeDeal: analysis saved id=abc123

# Error patterns to investigate
[ERROR] analyzeDeal: Unauthorized           → User session missing
[ERROR] analyzeDeal: LLM timeout 30000ms   → Retry or simplify input
[ERROR] analyzeDeal: entity save failed     → Validation error; check input
```

**Check all functions for error spikes:**

```
1. Base44 Dashboard → Functions → Overview
2. Set time range: "Last 24 hours"
3. Sort by "Error rate" descending
4. Investigate any function with error rate > 5%
```

---

### Monitor Active Users

**Quick count via Base44 database query:**

In the Base44 Database Explorer, query the `analytics` collection:

```
Filter: created_date__gte = [1 hour ago ISO timestamp]
Count unique `created_by` values
```

**Engagement trend:**

```
Filter: created_date__gte = [7 days ago]
Group by: created_date (day), count distinct created_by
```

---

### Update Environment Configuration

**Base44 credentials or feature flags:**

```bash
# 1. Update .env.production (NEVER commit this file)
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_TOKEN=your_token
VITE_BASE44_FUNCTIONS_VERSION=production

# 2. Rebuild
npm run build

# 3. Redeploy via Base44 publish (see Deployment Process above)
```

**Updating app-level constants** (feature flags, rate limit values):

- Edit `src/lib/app-params.js`
- Open a PR, follow standard deployment process
- Coordinate with team before changing rate limits

---

## Incident Response Quick Reference

| Symptom | First Action | Reference |
|---------|-------------|-----------|
| Site returns 503 | Check Base44 status page | [DISASTER_RECOVERY.md](./DISASTER_RECOVERY.md) |
| Users cannot log in | Check Base44 auth status in dashboard | ADR-002: Auth via Base44 |
| AI analysis failing | Check `analyzeDeal` function logs | Cloud Function Logs section above |
| Very slow page loads | Check Sentry performance, check LCP | [PERFORMANCE_BASELINE.md](./PERFORMANCE_BASELINE.md) |
| Data not saving | Check Base44 DB status, check 5xx in network tab | [MONITORING.md](./MONITORING.md) |
| Security breach suspected | Isolate immediately, escalate | [INCIDENT_RESPONSE.md](../security/INCIDENT_RESPONSE.md) |
| High 429 rate | Check rate limit config, notify impacted users | [ERROR_HANDLING.md](../api/ERROR_HANDLING.md) |

---

## Escalation Procedures

### Escalation Matrix

| Level | Trigger | Action |
|-------|---------|--------|
| **L1 — Self-resolve** | < 5 users affected, fix is known | Fix, document, and close |
| **L2 — Team** | > 5 users affected, or unknown root cause | Alert in #engineering channel |
| **L3 — Platform (Base44)** | Root cause is Base44 infrastructure | File Base44 support ticket |
| **L4 — Executive** | Data breach, > 1h outage, legal risk | Notify project lead immediately |

### Filing a Base44 Support Ticket

Include the following in every Base44 support request:

- **App ID:** [your Base44 app ID]
- **Affected function(s):** e.g., `analyzeDeal`, `calculatePipelineAnalytics`
- **Error message:** exact text from logs
- **Correlation IDs:** from error responses
- **Time of first occurrence:** ISO 8601 UTC
- **Reproduction steps:** what the user was doing

Support portal: `https://support.base44.com`

---

## On-Call Checklist

### Start of On-Call Shift

- [ ] Review any open incidents from the previous shift
- [ ] Check Sentry for unresolved errors in the last 24h
- [ ] Verify CI/CD pipeline is green on `main`
- [ ] Check Base44 function error rates are < 1%
- [ ] Confirm you have access to Base44 dashboard and Sentry

### End of On-Call Shift

- [ ] Document any incidents that occurred in the incident log
- [ ] Hand off open issues to the next on-call person
- [ ] Verify all P0/P1 incidents are resolved or have a mitigation in place

---

## Regular Maintenance Tasks

| Task | Frequency | Steps |
|------|-----------|-------|
| `npm audit` review | Weekly | Run `npm audit`; create tickets for high/critical findings |
| Dependency updates | Bi-weekly | `npm update` for patch updates; test before merging |
| Shadcn/ui component updates | Monthly | `npx shadcn-ui add [component]` to pull latest versions |
| Review Base44 function p95 durations | Monthly | Optimize any function consistently > 20s |
| Rotate API/service tokens | Quarterly | Update `.env.production`, redeploy |
| Review and prune old analytics events | Monthly | Archive `analytics` events older than 90 days |
| Validate backup restore procedure | Quarterly | Follow [DISASTER_RECOVERY.md](./DISASTER_RECOVERY.md) restore drill |

---

*Related: [Monitoring](MONITORING.md) · [Disaster Recovery](DISASTER_RECOVERY.md) · [Performance Baseline](PERFORMANCE_BASELINE.md) · [Incident Response](../security/INCIDENT_RESPONSE.md)*
