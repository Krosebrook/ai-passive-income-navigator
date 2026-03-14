# Security Incident Response Plan

**Version:** 1.0  
**Last Updated:** 2026-01-19  
**Platform:** AI Passive Income Navigator on Base44

---

## Table of Contents

- [Purpose and Scope](#purpose-and-scope)
- [Incident Classification](#incident-classification)
- [Response Team Roles](#response-team-roles)
- [5-Phase Response Framework](#5-phase-response-framework)
- [Playbook: Unauthorized Data Access](#playbook-unauthorized-data-access)
- [Playbook: XSS / Injection Attack](#playbook-xss--injection-attack)
- [Playbook: Compromised Credentials](#playbook-compromised-credentials)
- [Playbook: Data Breach Notification](#playbook-data-breach-notification)
- [Post-Incident Review](#post-incident-review)
- [Contact Directory](#contact-directory)

---

## Purpose and Scope

This document defines how the team detects, responds to, contains, and recovers from security incidents affecting the AI Passive Income Navigator. It applies to:

- The React frontend application
- Base44 BaaS platform data (database collections, file storage)
- Cloud functions (Deno/TypeScript serverless functions)
- GitHub repository and CI/CD pipeline

**This plan does not cover:** Security incidents at the Base44 platform infrastructure level (those are Base44's responsibility). However, this plan includes coordination steps with Base44 support.

---

## Incident Classification

### Priority Levels

| Priority | Description | Response Time | Examples |
|----------|-------------|--------------|---------|
| **P0 — Critical** | Active breach, data exfiltration in progress, or total service compromise | Immediate (< 15 minutes) | Active SQL injection, confirmed data theft, admin account takeover |
| **P1 — High** | Confirmed vulnerability being actively exploited, or significant data exposure | < 1 hour | XSS payload executing in production, exposed API token, unauthorized bulk data read |
| **P2 — Medium** | Potential vulnerability identified, limited exposure, no confirmed exploitation | < 4 hours | Discovered misconfiguration, a single user's data accessed without authorization |
| **P3 — Low** | Suspicious activity with low confidence, informational finding | Next business day | Failed login spike, low-severity CVE in a dependency |

### Escalation

Any P0 or P1 incident must be escalated to L4 (executive level) regardless of time of day. See [Contact Directory](#contact-directory).

---

## Response Team Roles

| Role | Responsibilities | Who |
|------|----------------|-----|
| **Incident Commander (IC)** | Coordinates the response, makes go/no-go decisions, owns communication | Engineering Lead or on-call senior engineer |
| **Technical Investigator** | Performs forensic analysis, traces attack vectors, identifies affected data | Backend/security engineer |
| **Communications Lead** | Handles internal Slack updates, user notifications, regulatory reporting | PM or designated team member |
| **Base44 Liaison** | Files and tracks Base44 support tickets, coordinates platform-level response | DevOps or engineering lead |

For a prototype/small team: the IC and Technical Investigator roles may be the same person.

---

## 5-Phase Response Framework

### Phase 1 — Detect

**Goal:** Identify that a security incident is occurring or has occurred.

**Detection sources:**
- Sentry alerts — unusual error patterns, unexpected `403` spikes
- Base44 function logs — unexpected access patterns, unauthorized calls
- User reports — "I can see someone else's data"
- GitHub notifications — unexpected commits, workflow file changes
- Automated scans — `npm audit`, Dependabot alerts
- Analytics anomalies — unusual API call volumes or patterns from single IPs

**First responder actions:**
1. Do NOT dismiss or minimize alerts — assume breach until proven otherwise
2. Document: time of detection, detection source, initial observations
3. Assign a severity (P0–P3) based on the classification table
4. Page the Incident Commander immediately for P0/P1

**Detection log template:**
```
DATE/TIME (UTC): 
DETECTED BY: [Sentry / user report / log review / etc.]
INITIAL DESCRIPTION: 
AFFECTED SYSTEMS: 
INITIAL SEVERITY: P[0-3]
IC NOTIFIED AT: 
```

---

### Phase 2 — Contain

**Goal:** Stop the bleeding. Prevent further damage or data exposure.

**Immediate containment actions (first 30 minutes):**

For ALL incidents:
- [ ] Preserve log evidence BEFORE taking remediation steps (logs may be overwritten)
- [ ] Take a screenshot/export of Base44 function logs for the affected time window
- [ ] Export the relevant analytics events from the `analytics` collection

For active breaches (P0):
- [ ] Rotate all Base44 API tokens immediately (renders stolen tokens invalid):
  ```
  Base44 Dashboard → Settings → API Tokens → Revoke all active tokens
  Generate new token and update .env.production
  Rebuild and redeploy frontend
  ```
- [ ] Disable affected cloud functions if they are the attack vector:
  ```
  Base44 Dashboard → Functions → [function name] → Disable
  ```
- [ ] Block the attacking IP at the CDN/WAF level (if identifiable)
- [ ] If user accounts are compromised: force-logout all sessions via Base44 Auth

For data exposure (P1):
- [ ] Identify the scope: which collections, which records, which users
- [ ] Disable the API endpoint or function that allowed the exposure
- [ ] Notify affected users (see Playbook: Data Breach Notification)

---

### Phase 3 — Eradicate

**Goal:** Remove the root cause of the incident.

**Steps:**
1. Identify the vulnerability:
   - Code flaw (missing auth check, injection point)
   - Misconfiguration (auth disabled, overly permissive CORS)
   - Compromised secret
   - Supply chain attack (malicious dependency)
2. Develop a fix (hotfix branch — see [RUNBOOK.md](../operations/RUNBOOK.md))
3. Test the fix against the specific attack vector
4. Deploy the fix and verify the vulnerability is closed
5. Scan for similar vulnerabilities elsewhere in the codebase
6. Rotate any secrets that may have been exposed (even if not confirmed compromised)

**Eradication checklist:**
- [ ] Root cause identified and documented
- [ ] Fix developed, tested, and deployed
- [ ] Similar vulnerability patterns checked across codebase
- [ ] All potentially compromised credentials rotated
- [ ] Affected cloud functions re-enabled (if they were disabled)

---

### Phase 4 — Recover

**Goal:** Restore normal service and data integrity.

**Steps:**
1. Restore any tampered or deleted data from backup — see [DISASTER_RECOVERY.md](../operations/DISASTER_RECOVERY.md)
2. Re-enable any features or functions that were disabled during containment
3. Verify system integrity via the post-recovery validation checklist
4. Monitor closely for 24–48 hours for signs of re-attack
5. Notify affected users of the resolution (see Communication section)
6. Update monitoring rules to detect similar future attacks

**Recovery validation:**
- [ ] Authentication is working normally
- [ ] All collections are returning expected data
- [ ] No new unauthorized access patterns in logs
- [ ] All affected users notified

---

### Phase 5 — Post-Incident Review

**Goal:** Learn from the incident to prevent recurrence.

**Timeline:**
- P0/P1: Written post-incident review within 48 hours
- P2: Summary within 1 week
- P3: Log in the security register; review in next sprint

**Post-incident review template:**

```markdown
## Post-Incident Review: [Incident Title]

**Date of Incident:** 
**Severity:** P[0-3]
**Duration:** [detection to resolution]
**IC:** 

### Summary
[2–3 sentence description of what happened]

### Timeline
| Time (UTC) | Event |
|-----------|-------|
| HH:MM | Incident detected |
| HH:MM | IC notified |
| HH:MM | Containment completed |
| HH:MM | Root cause identified |
| HH:MM | Fix deployed |
| HH:MM | Service restored |

### Root Cause
[Detailed technical explanation]

### Impact
- Users affected: [count or "none confirmed"]
- Data exposed: [yes/no, what type]
- Downtime: [duration]

### What Went Well
- 

### What Could Be Improved
- 

### Action Items
| Action | Owner | Due Date |
|--------|-------|---------|
| | | |
```

---

## Playbook: Unauthorized Data Access

**Scenario:** Evidence that a user or attacker is reading data belonging to other users.

### Detection Signals
- User report: "I can see another user's portfolio"
- Unusual queries in Base44 logs (many different `created_by` values in a single session)
- `403` errors in analytics suggesting probing behaviour

### Response Steps

1. **Identify the affected endpoint or function**
   - Check which API call returned the wrong user's data
   - Look for missing `created_by` filter in the query

2. **Check if `requiresAuth` is enabled**
   ```javascript
   // src/api/base44Client.js
   requiresAuth: import.meta.env.PROD  // Must be true in production
   ```

3. **Audit the cloud function or entity query**
   ```typescript
   // VULNERABLE: Returns all records regardless of user
   const items = await base44.entities.PortfolioItem.list();
   
   // CORRECT: Filter by authenticated user
   const items = await base44.entities.PortfolioItem.filter({
     created_by: user.email
   });
   ```

4. **Deploy the fix** — see [RUNBOOK.md — Emergency Hotfix](../operations/RUNBOOK.md)

5. **Assess data exposure**
   - How long was the vulnerability present?
   - Which records were accessible?
   - Were any requests logged that indicate actual exploitation?

6. **Notify affected users** if their data was accessed

---

## Playbook: XSS / Injection Attack

**Scenario:** Malicious scripts are being injected into the application, executing in other users' browsers.

### Detection Signals
- Sentry reports unexpected script errors from a rendered page
- Users report unexpected redirects or popups
- A stored community post or deal name contains `<script>` tags
- CSP violation reports (if CSP is configured)

### Response Steps

1. **Identify the injection point**
   - Is it a community post body?
   - A deal name or description?
   - User-provided content being rendered without escaping?

2. **Immediately disable or quarantine the affected content**
   ```
   Base44 Dashboard → Database → communityPosts
   Find the post with the malicious content → Delete or edit
   ```

3. **Audit React rendering** — React escapes HTML by default. Look for `dangerouslySetInnerHTML`:
   ```tsx
   // DANGEROUS — only use if absolutely necessary with sanitization
   <div dangerouslySetInnerHTML={{ __html: userContent }} />
   
   // SAFE — React escapes this automatically
   <div>{userContent}</div>
   ```

4. **Add or enforce Content Security Policy** in `index.html`:
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; script-src 'self'; object-src 'none';">
   ```

5. **Sanitize Markdown rendering** (for community posts):
   ```typescript
   import DOMPurify from 'dompurify';
   import { marked } from 'marked';
   
   const sanitizedHtml = DOMPurify.sanitize(marked(userMarkdown));
   ```

6. **Assess impact** — Which users may have had the malicious script execute in their browser?

7. **Advise affected users** to log out, clear cookies, and log back in

---

## Playbook: Compromised Credentials

**Scenario:** An API token, admin password, or service credential has been exposed or stolen.

### Detection Signals
- Token found in a public GitHub commit
- Unusual API activity from unexpected locations
- Base44 reports access from an unknown IP
- Team member reports a stolen laptop or compromised account

### Response Steps

**Immediate (within 15 minutes):**

1. **Revoke the compromised credential immediately**
   ```
   Base44 Dashboard → Settings → API Tokens → Revoke [token]
   GitHub → Settings → Developer settings → Personal access tokens → Revoke
   ```

2. **Generate new credentials and update configuration**
   ```bash
   # Update .env.production with new token
   # Rebuild and redeploy
   npm run build
   base44 publish
   ```

3. **Check what the credential had access to**
   - Base44 API token: access to all collections and functions for the app
   - GitHub PAT: access to repository (code, secrets, workflows)
   - Admin account: full application access

4. **Audit activity during the exposure window**
   - Review Base44 access logs for the period the credential was valid
   - Look for data exports, unusual writes, or function invocations

5. **Rotate ALL related secrets** — if one credential was exposed, assume related ones may be too

6. **Check GitHub secret scanning** — GitHub automatically scans for leaked secrets:
   ```
   GitHub Repository → Security → Secret scanning alerts
   ```

7. **If the GitHub repository was compromised:**
   - Audit all commits in the exposure window: `git log --since="[date]" --oneline`
   - Check for modifications to workflow files (`.github/workflows/`)
   - Verify no malicious code was introduced

---

## Playbook: Data Breach Notification

**Scenario:** Personal data (email addresses, financial data, usage patterns) has been exposed to unauthorized parties.

### Legal Obligations

> ⚠️ This section provides guidance only. **Consult legal counsel before sending breach notifications.**

| Regulation | Applicability | Notification Deadline | Threshold |
|-----------|--------------|----------------------|-----------|
| **GDPR** (EU/UK) | If any EU/UK residents use the app | 72 hours to supervisory authority | Any PII breach |
| **CCPA** (California) | If California residents use the app | "Expedient time" | Unencrypted PII |
| **Other state laws** | Varies by US state | Varies | Varies |

### Notification Steps

1. **Determine scope within 24 hours:**
   - What data was accessed? (emails, portfolios, financial projections)
   - Whose data was accessed? (list of affected `created_by` email addresses)
   - When did the breach occur and for how long?
   - Is the breach ongoing?

2. **Internal notification (immediate):**
   - Notify IC, Communications Lead, and executive team
   - Document in incident log

3. **Regulatory notification (if GDPR applies — within 72 hours):**
   - Report to the relevant Data Protection Authority
   - GDPR requires notification if the breach "is likely to result in a risk to the rights and freedoms of individuals"

4. **User notification email template:**

```
Subject: Important Security Notice — [Application Name]

Dear [User Name],

We are writing to inform you of a security incident that may have affected your account.

What happened:
[Clear, plain-language description of the incident]

What data was involved:
[List of specific data types: email address, portfolio data, etc.]

When it happened:
[Date range of the exposure]

What we did:
[Steps taken to contain and resolve the incident]

What you can do:
- Review your account for any unexpected changes
- Change your password as a precaution
- [Any other specific recommended actions]

We take the security of your data very seriously and sincerely apologise for this incident.

If you have questions, please contact: [support email]

[Team Name]
```

5. **Record the breach notification** — date sent, recipients, content, regulatory filings

---

## Post-Incident Review

See the template in [Phase 5 — Post-Incident Review](#phase-5--post-incident-review). Reviews must be filed in the team's project management tool and linked from the incident log.

**Security register:** Maintain a log of all security incidents, even P3:

| Date | Severity | Brief Description | Duration | Resolved By | PIR Link |
|------|----------|------------------|----------|-------------|---------|
| | | | | | |

---

## Contact Directory

> Replace placeholders with actual contacts before going to production.

| Role | Name | Contact |
|------|------|---------|
| Incident Commander (primary) | [Name TBD] | [Slack / Phone TBD] |
| Incident Commander (backup) | [Name TBD] | [Slack / Phone TBD] |
| Engineering Lead | [Name TBD] | [Phone TBD] |
| Legal Counsel | [Name TBD] | [Phone TBD] |
| Base44 Security Support | Base44 Team | support@base44.com |
| Data Protection Officer | [Name TBD if required] | [Contact TBD] |

---

*Related: [SECURITY.md](../../SECURITY.md) · [Disaster Recovery](../operations/DISASTER_RECOVERY.md) · [Monitoring](../operations/MONITORING.md) · [Privacy Policy](../legal/PRIVACY_POLICY.md)*
