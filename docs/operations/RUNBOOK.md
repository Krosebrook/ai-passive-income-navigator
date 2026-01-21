# Operational Runbook

**Status:** ⚠️ **Not Started** - CRITICAL Production Blocker

---

## Purpose

This document will provide step-by-step procedures for common operational tasks and emergency scenarios.

## Quick Reference

| Scenario | Severity | First Response | Full Procedure |
|----------|----------|----------------|----------------|
| Complete outage | SEV1 | Check status page, contact Base44 | [Section 1.1](#11-complete-outage) |
| High error rate | SEV2 | Check recent deployments | [Section 1.2](#12-high-error-rate) |
| Slow performance | SEV3 | Check monitoring dashboard | [Section 1.3](#13-slow-performance) |
| Authentication failures | SEV2 | Check Base44 auth status | [Section 1.4](#14-authentication-failures) |
| Database issues | SEV1 | Check Base44 status | [Section 1.5](#15-database-issues) |

---

## 1. Emergency Procedures

### 1.1 Complete Outage
**Detection:** Uptime check fails, users cannot access application

**Immediate Actions (5 minutes):**
1. Check Base44 status page: [URL TBD]
2. Verify DNS resolution: `nslookup your-domain.com`
3. Check CDN status: [Provider TBD]
4. Check recent deployments (last 1 hour)

**Investigation (10 minutes):**
1. Review error logs: [Log aggregation tool TBD]
2. Check monitoring dashboard for alerts
3. Verify SSL certificates (not expired)
4. Test API endpoints directly: `curl https://api.your-domain.com/health`

**Resolution:**
- If Base44 outage → Wait for resolution, communicate to users
- If bad deployment → Rollback (see [Section 2.1](#21-rollback-deployment))
- If DNS issue → Contact DNS provider
- If CDN issue → Contact CDN provider or bypass CDN

**Communication:**
- Post status update within 5 minutes
- Update every 15 minutes until resolved
- Post-mortem within 24 hours

---

### 1.2 High Error Rate
**Detection:** Error rate > 5% for 5+ minutes

**Immediate Actions:**
1. Check recent deployments (last 2 hours)
2. Review error types in monitoring dashboard
3. Check Base44 API status
4. Verify environment configuration

**Common Causes & Solutions:**
- **Recent deployment bug** → Rollback
- **Base44 API issues** → Wait for resolution, implement fallback
- **Rate limiting** → Increase limits or implement backoff
- **Database connection issues** → Check Base44 database status

**Resolution Steps:**
1. Identify error pattern (specific endpoint? user segment?)
2. Check if error rate increasing or stable
3. If increasing → Consider rollback
4. If stable → Investigate and fix
5. Deploy hotfix or rollback

---

### 1.3 Slow Performance
**Detection:** P95 response time > 2s for 10+ minutes

**Immediate Actions:**
1. Check monitoring dashboard for bottlenecks
2. Review recent code changes
3. Check Base44 API latency
4. Check CDN performance

**Investigation:**
1. Identify slow endpoints: [Monitoring tool TBD]
2. Check database query performance
3. Check cloud function execution times
4. Check frontend bundle size and load times

**Common Fixes:**
- Add database indexes
- Optimize slow queries
- Implement caching (React Query cache, CDN cache)
- Reduce bundle size (code splitting)

---

### 1.4 Authentication Failures
**Detection:** High rate of 401/403 errors

**Immediate Actions:**
1. Check Base44 authentication service status
2. Verify JWT token configuration
3. Check token expiry settings
4. Review recent auth-related code changes

**Common Causes:**
- Base44 auth service outage
- Token expiry configuration changed
- CORS misconfiguration
- Session storage cleared

**Resolution:**
1. Test authentication flow manually
2. Check browser console for errors
3. Verify `requiresAuth` setting in base44Client.js
4. Check CORS headers

---

### 1.5 Database Issues
**Detection:** Database query failures, timeout errors

**Immediate Actions:**
1. Check Base44 database status
2. Review recent database operations (migrations, large writes)
3. Check connection pool settings

**Common Causes:**
- Base44 database maintenance
- Connection pool exhausted
- Slow queries causing locks
- Database storage full (if self-hosted)

**Resolution:**
1. Contact Base44 support if platform issue
2. Identify slow queries and optimize
3. Increase connection pool size (if configurable)
4. Implement query timeouts

---

## 2. Common Operational Tasks

### 2.1 Rollback Deployment

**When to Rollback:**
- Error rate > 10% after deployment
- Critical bug discovered in production
- Performance degradation > 50%
- Security vulnerability introduced

**Rollback Procedure:**

**Option A: Git Rollback (Recommended)**
```bash
# 1. Identify last known good commit
git log --oneline -10

# 2. Revert to previous commit
git revert HEAD --no-edit

# 3. Push to trigger deployment
git push origin main

# 4. Monitor deployment
# Check CI/CD pipeline: [URL TBD]
# Verify application health
```

**Option B: Base44 Builder Rollback**
1. Log into Base44 Builder: [URL TBD]
2. Navigate to Deployments
3. Select previous deployment
4. Click "Rollback"
5. Confirm rollback
6. Monitor deployment

**Post-Rollback:**
1. Verify application is healthy
2. Notify team in Slack/email
3. Create incident ticket
4. Schedule post-mortem

---

### 2.2 Clear Application Cache

**When Needed:**
- Stale data visible to users
- Configuration changes not reflecting
- After environment variable updates

**Procedure:**

**Client-Side Cache:**
1. Clear browser cache (instruct users)
2. Increment app version in `package.json`
3. Clear service worker cache (if implemented)

**Server-Side Cache (React Query):**
```javascript
// In app code
queryClient.invalidateQueries();
```

**CDN Cache:**
1. Log into CDN provider: [URL TBD]
2. Purge cache for specific URLs or entire domain
3. Verify cache cleared: `curl -I https://your-domain.com`

---

### 2.3 Restart Services

**Note:** As a static frontend with Base44 backend, there are limited services to restart.

**Base44 Platform:**
- Contact Base44 support for service restarts
- Support: [support@base44.com]

**CI/CD Pipeline:**
- Re-trigger failed build: [GitHub Actions URL]
- Cancel stuck pipeline: [GitHub Actions URL]

---

### 2.4 Check Application Health

**Manual Health Check:**
```bash
# Check main application
curl -I https://your-domain.com

# Check API endpoint (if available)
curl https://api.your-domain.com/health

# Check authentication
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

**Automated Health Check:**
- See monitoring dashboard: [URL TBD]
- Check uptime monitor: [URL TBD]

---

### 2.5 View Logs

**Frontend Logs (Browser Console):**
1. Open browser DevTools (F12)
2. Navigate to Console tab
3. Filter by errors: Click "Errors" filter

**Backend Logs (Base44):**
1. Log into Base44 Console: [URL TBD]
2. Navigate to Logs section
3. Filter by date/time range
4. Filter by severity (ERROR, WARN, INFO)

**Cloud Function Logs:**
1. Base44 Console → Cloud Functions
2. Select function
3. View execution logs
4. Look for errors and performance metrics

**Aggregated Logs (if configured):**
- [Log aggregation tool TBD]
- [Sentry for error tracking TBD]

---

### 2.6 Database Backup and Restore

**See [DISASTER_RECOVERY.md](./DISASTER_RECOVERY.md) for detailed procedures.**

**Quick Backup Check:**
1. Log into Base44 Console
2. Navigate to Database → Backups
3. Verify latest backup timestamp
4. Verify backup size is reasonable

**Quick Restore Test:**
[Procedure to be documented]

---

### 2.7 Deploy Hotfix

**Urgent Fix Procedure (Bypassing Normal Process):**

1. **Create hotfix branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-issue
   ```

2. **Make minimal fix**
   - Fix only the critical issue
   - Do NOT include unrelated changes

3. **Test locally**
   ```bash
   npm run build
   npm run preview
   ```

4. **Create PR with "HOTFIX" label**
   - Skip normal review if SEV1
   - Get approval from on-call engineer

5. **Merge and deploy**
   ```bash
   git merge hotfix/critical-issue
   git push origin main
   ```

6. **Monitor closely**
   - Watch error rates
   - Watch performance metrics
   - Be ready to rollback

7. **Post-deployment**
   - Notify team
   - Document in incident ticket
   - Schedule proper fix for next sprint

---

## 3. Monitoring and Alerts

### 3.1 Interpreting Alerts

**High Error Rate Alert:**
- Check recent deployments
- Review error types in monitoring
- Follow [Section 1.2](#12-high-error-rate)

**Slow Response Time Alert:**
- Check monitoring dashboard for bottlenecks
- Follow [Section 1.3](#13-slow-performance)

**Uptime Alert (Down):**
- Follow [Section 1.1](#11-complete-outage)

**High Traffic Alert:**
- Monitor performance under load
- Scale if needed (contact Base44 support)
- Check for DDoS attack (unusual traffic patterns)

---

## 4. On-Call Procedures

### 4.1 On-Call Responsibilities
- Respond to pages within 15 minutes
- Investigate and mitigate incidents
- Escalate if needed (see escalation matrix)
- Document incidents in ticket system
- Conduct post-mortems for SEV1/SEV2

### 4.2 Escalation Matrix

| Severity | Response Time | Escalation After |
|----------|---------------|------------------|
| SEV1 | Immediate | 30 minutes |
| SEV2 | 1 hour | 2 hours |
| SEV3 | 4 hours | Next business day |
| SEV4 | 24 hours | No escalation |

**Escalation Contacts:**
1. On-Call Engineer: [Name TBD] - [Phone/Slack TBD]
2. Engineering Lead: [Name TBD] - [Phone/Slack TBD]
3. CTO: [Name TBD] - [Phone TBD]
4. Base44 Support: support@base44.com

---

## 5. Regular Maintenance Tasks

### Daily Tasks
- [ ] Review error logs
- [ ] Check monitoring dashboards
- [ ] Verify backup completion
- [ ] Review security alerts (npm audit)

### Weekly Tasks
- [ ] Review performance trends
- [ ] Update dependencies (if patches available)
- [ ] Review and respond to user feedback
- [ ] Test backup restore procedure

### Monthly Tasks
- [ ] Comprehensive performance audit
- [ ] Security vulnerability scan
- [ ] Review and update documentation
- [ ] Conduct disaster recovery drill

---

**Priority:** P0 - CRITICAL  
**Estimated Documentation Time:** 3 days  
**Assigned To:** [Unassigned]  
**Target Completion:** [Not Set]

---

*This placeholder was created during the 2026-01-21 documentation audit.*
*RISK: On-call engineers cannot respond effectively without runbooks.*
