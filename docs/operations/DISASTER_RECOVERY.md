# Disaster Recovery Plan

**Version:** 1.0  
**Last Updated:** 2026-01-19  
**Platform:** AI Passive Income Navigator on Base44

---

## Table of Contents

- [Overview and Scope](#overview-and-scope)
- [Recovery Objectives](#recovery-objectives)
- [Backup Strategy](#backup-strategy)
- [Recovery Scenarios](#recovery-scenarios)
  - [Scenario 1: Base44 Platform Outage](#scenario-1-base44-platform-outage)
  - [Scenario 2: Accidental Data Loss](#scenario-2-accidental-data-loss)
  - [Scenario 3: Security Breach](#scenario-3-security-breach)
  - [Scenario 4: Frontend Asset Loss](#scenario-4-frontend-asset-loss)
  - [Scenario 5: Corrupted Deployment](#scenario-5-corrupted-deployment)
- [Restore Procedures](#restore-procedures)
- [Post-Recovery Validation](#post-recovery-validation)
- [Communication Plan](#communication-plan)
- [DR Testing Schedule](#dr-testing-schedule)

---

## Overview and Scope

This Disaster Recovery Plan (DRP) covers the AI Passive Income Navigator application. As a prototype/MVP hosted on Base44 BaaS, the recovery strategy is heavily reliant on Base44's platform capabilities and SLAs.

**Application components covered:**

| Component | Owner | Recovery Method |
|-----------|-------|----------------|
| Frontend assets (HTML, JS, CSS) | GitHub repository | Rebuild from source |
| User data (ideas, portfolio, deals) | Base44 managed DB | Base44 backup restore |
| Cloud functions | GitHub repository + Base44 | Redeploy from source |
| Authentication data | Base44 Auth service | Base44 recovery |
| Static file uploads | Base44 file storage | Base44 backup |

**Out of scope:**
- Third-party market data APIs (external dependencies)
- User's browser-local state (not persisted server-side)

---

## Recovery Objectives

### For Prototype / MVP Stage

| Objective | Target | Rationale |
|-----------|--------|-----------|
| **RTO** (Recovery Time Objective) | 4 hours | Acceptable for a non-revenue prototype |
| **RPO** (Recovery Point Objective) | 24 hours | Daily backup cadence sufficient at this stage |
| **MTTR** (Mean Time to Repair) | < 2 hours for platform issues | Mostly waiting on Base44 resolution |

### Production Stage Targets (Future)

| Objective | Target |
|-----------|--------|
| RTO | < 1 hour |
| RPO | < 4 hours |
| Uptime SLA | 99.5% monthly |

---

## Backup Strategy

### What Base44 Manages

Base44 is responsible for:
- **Automated database backups** — daily snapshots, retained for 7–30 days (verify in Base44 plan)
- **Infrastructure redundancy** — multi-zone deployment (verify with Base44 SLA documentation)
- **Function code storage** — deployed function versions are retained by Base44

> **Action required:** Confirm Base44 backup retention and restore capabilities with Base44 support before going to production.

### What the Application Team Manages

**1. Source code backup (GitHub)**

All source code, including cloud functions, is stored in GitHub. This is the ground truth for the application.

```bash
# Verify the repository is up to date
git log --oneline -5
git remote -v

# Ensure the remote is reachable
git fetch origin --dry-run
```

**2. Manual data export (user data)**

Use the `exportUserData` and `automatedBackup` cloud functions to create periodic exports:

```bash
# Trigger a manual backup via the automatedBackup function
curl -X POST https://app.base44.com/api/functions/automatedBackup \
  -H "Authorization: Bearer [admin-token]" \
  -H "Content-Type: application/json" \
  -d '{"scope": "all", "format": "json"}'
```

Store exports in a separate cloud storage bucket (AWS S3, Google Cloud Storage, or equivalent) outside of Base44.

**3. Backup schedule**

| Data | Frequency | Retention | Storage |
|------|-----------|-----------|---------|
| Base44 DB snapshots | Daily (Base44 managed) | 7 days | Base44 |
| Manual JSON exports | Weekly (via `automatedBackup`) | 30 days | External storage |
| Source code | On every commit (GitHub) | Indefinite | GitHub |
| `.env.production` secrets | Manually after rotation | Current only | Secure vault (e.g., 1Password) |

---

## Recovery Scenarios

### Scenario 1: Base44 Platform Outage

**Description:** The Base44 platform is unavailable. The frontend may load from CDN, but all data operations fail.

**Detection:**
- Users see "Service unavailable" errors
- All API calls return 503
- Base44 status page shows an incident

**Response Steps:**

1. **Verify the outage** — Check `https://status.base44.com` (placeholder URL)
2. **Enable maintenance mode** — Update the frontend to show a planned maintenance banner:
   ```typescript
   // src/lib/app-params.js
   export const MAINTENANCE_MODE = true;
   // Rebuild and redeploy static assets to CDN
   ```
3. **File a Base44 support ticket** with incident details
4. **Communicate to users** — Post a status update (see Communication Plan)
5. **Monitor Base44 status page** for resolution ETA
6. **Do not attempt data operations** until the platform confirms recovery
7. **Remove maintenance mode** once Base44 confirms the platform is healthy
8. **Run post-recovery validation** (see below)

**RTO for this scenario:** Dependent on Base44 resolution time (typically < 4 hours for major incidents)

---

### Scenario 2: Accidental Data Loss

**Description:** User data is accidentally deleted — either through a bug in cloud functions, a mis-fired bulk delete in the Base44 dashboard, or user-reported data loss.

**Detection:**
- User reports missing data
- Spike in "entity not found" errors in logs
- Monitoring alert on unusual DELETE operation volume

**Response Steps:**

1. **Stop the bleeding** — If a running process caused the deletion, disable the responsible cloud function:
   ```
   Base44 Dashboard → Functions → [function name] → Disable
   ```
2. **Assess scope** — Determine which collections and how many records were affected
3. **Request Base44 point-in-time restore**:
   ```
   File a Base44 support ticket:
   - Collection(s) affected: [e.g., ideas, portfolioItems]
   - Approximate time of deletion: [ISO 8601 UTC]
   - Approximate number of records: [count]
   - Request: "Point-in-time restore to [timestamp]"
   ```
4. **If Base44 cannot restore** — Fall back to the last manual JSON export (from the `automatedBackup` function)
5. **Use `restoreBackup` cloud function** to re-import the export:
   ```bash
   curl -X POST https://app.base44.com/api/functions/restoreBackup \
     -H "Authorization: Bearer [admin-token]" \
     -d '{"backupUrl": "[URL of the JSON export]", "collections": ["ideas"]}'
   ```
6. **Notify affected users** and offer manual data correction support

**RPO for this scenario:** Up to 24 hours (last backup)

---

### Scenario 3: Security Breach

**Description:** Unauthorized access to user data, compromised admin credentials, or injection of malicious code.

**Detection:**
- Unusual API access patterns (many 403 errors from unknown IPs)
- User reports of unexpected account activity
- Git commit containing unexpected code changes
- Sentry alert for unusual error patterns

**Response Steps:**

> ⚠️ **See [INCIDENT_RESPONSE.md](../security/INCIDENT_RESPONSE.md) for the full security incident playbook.**

High-level DR steps for a breach:

1. **Contain** — Rotate all API tokens and secrets immediately:
   ```bash
   # Rotate Base44 token
   # 1. Base44 Dashboard → Settings → API Tokens → Revoke all
   # 2. Generate new token
   # 3. Update .env.production
   # 4. Rebuild and redeploy
   ```
2. **Preserve evidence** — Export logs before any remediation that would overwrite them
3. **Assess data exposure** — Which collections were accessed? What data was read or modified?
4. **Notify users** if PII was exposed (see Privacy Policy — 72-hour GDPR notification window)
5. **Restore from clean backup** if data was tampered with
6. **Conduct post-incident review** within 48 hours

---

### Scenario 4: Frontend Asset Loss

**Description:** The static frontend files (HTML, JS, CSS) are lost from the CDN or hosting provider.

**Likelihood:** Very low — GitHub is the source of truth and assets are rebuilt from it.

**Recovery Steps:**

```bash
# 1. Clone the repository
git clone https://github.com/[org]/ai-passive-income-navigator.git
cd ai-passive-income-navigator

# 2. Install dependencies
npm ci

# 3. Restore .env.production from secure vault
# [Restore VITE_BASE44_APP_ID, VITE_BASE44_TOKEN, etc.]

# 4. Build
npm run build

# 5. Redeploy via Base44
base44 publish
# OR upload dist/ to the CDN manually
```

**RTO for this scenario:** < 30 minutes

---

### Scenario 5: Corrupted Deployment

**Description:** A deployment went out with broken code (JavaScript errors on every page load, build corruption).

**Recovery Steps:**

1. **Identify the last good deployment** via Base44 deployment history
2. **Roll back immediately** — see [RUNBOOK.md — Rollback Procedure](./RUNBOOK.md#rollback-procedure)
3. **Revert the bad commit** in Git:
   ```bash
   git revert <bad-commit-sha> --no-edit
   git push origin main
   ```
4. If the rollback takes > 5 minutes, **enable maintenance mode** to prevent users from hitting broken pages

**RTO for this scenario:** < 15 minutes

---

## Restore Procedures

### Restoring from Base44 Managed Backup

1. Log in to the Base44 dashboard
2. Navigate to **Database → Backups**
3. Select the backup snapshot from the desired point in time
4. Choose the collection(s) to restore
5. Select restore mode:
   - **Overwrite** — replaces current data (use for full restore)
   - **Merge** — adds missing records without deleting current data (use for partial restore)
6. Confirm and wait for completion (typically 5–15 minutes for a full restore)
7. Run post-recovery validation

### Restoring from Manual JSON Export

1. Retrieve the backup JSON files from external storage
2. Invoke the `restoreBackup` cloud function with the backup URL
3. Monitor the function logs for progress and errors
4. Verify record counts match the backup

### Restoring Cloud Functions

All cloud functions live in the `functions/` directory in the GitHub repository. To redeploy:

```bash
# Ensure you're on the correct clean commit
git checkout main
git log --oneline -5

# Deploy functions via Base44
# Option A: Push to main triggers CI/CD redeployment
# Option B: Manually upload functions via Base44 dashboard → Functions → Deploy
```

---

## Post-Recovery Validation

Run this checklist after any recovery operation:

**Data integrity checks:**
- [ ] Spot-check 10 random user records across `ideas`, `portfolioItems`, and `DealPipeline` collections
- [ ] Verify record counts are within expected range compared to last known count
- [ ] Check that `created_by` fields are intact (no data cross-contamination between users)
- [ ] Verify `created_date` and `updated_date` are valid ISO 8601 timestamps

**Application functionality checks:**
- [ ] Login works for at least 3 different test accounts
- [ ] Dashboard loads without errors
- [ ] Create an idea → verify it saves
- [ ] Run an AI analysis → verify it completes
- [ ] Load the deal pipeline → verify deals appear
- [ ] Check the community feed → verify posts load

**Performance checks:**
- [ ] LCP < 4s (degraded threshold post-recovery)
- [ ] API calls returning < 2s for read operations
- [ ] No new JavaScript errors in Sentry

**Security checks:**
- [ ] All rotated credentials are working
- [ ] Old credentials are confirmed revoked
- [ ] No unauthorised data access in the last 1 hour of logs

---

## Communication Plan

### Internal Communication

| Event | Channel | Message Template |
|-------|---------|-----------------|
| Incident starts | #incidents Slack | "🔴 INCIDENT: [description]. Investigating. Est. resolution: [time]." |
| Update every 30 min | #incidents Slack | "🟡 UPDATE [HH:MM]: [current status]. Next update at [time]." |
| Incident resolved | #incidents Slack | "🟢 RESOLVED [HH:MM]: [description]. Duration: X min. PIR to follow." |

### User Communication

**For outages < 30 minutes:** No user communication required (within SLA).

**For outages > 30 minutes:**
- Update the application status banner (if maintenance mode is enabled)
- Post a status update on the project's status page or GitHub Discussions

**For data loss affecting users:**
- Contact affected users directly via email within 24 hours
- Provide details of what data was lost and the recovery outcome

**For security breaches involving PII:**
- Notify affected users within 72 hours (GDPR requirement)
- See [INCIDENT_RESPONSE.md — Data Breach Notification](../security/INCIDENT_RESPONSE.md)

---

## DR Testing Schedule

| Test | Frequency | Owner | Last Tested |
|------|-----------|-------|-------------|
| Backup restore from Base44 snapshot | Quarterly | Engineering | Not yet performed |
| Rebuild and redeploy from clean git clone | Quarterly | Engineering | Not yet performed |
| Manual export → `restoreBackup` round-trip | Semi-annually | Engineering | Not yet performed |
| Full DR drill (simulated outage) | Annually | Engineering + PM | Not yet performed |

**How to run the rebuild test:**

```bash
# In a clean environment:
git clone https://github.com/[org]/ai-passive-income-navigator.git /tmp/dr-test
cd /tmp/dr-test
npm ci
# Provide .env.production from secure vault
npm run build
# Verify dist/ output looks correct
ls -la dist/
# Clean up
rm -rf /tmp/dr-test
```

---

*Related: [Runbook](RUNBOOK.md) · [Monitoring](MONITORING.md) · [Incident Response](../security/INCIDENT_RESPONSE.md) · [Privacy Policy](../legal/PRIVACY_POLICY.md)*
