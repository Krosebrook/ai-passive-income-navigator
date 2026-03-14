# Documentation

Welcome to the AI Passive Income Navigator documentation.

## 📍 You Are Here: `/docs`

This directory contains all technical documentation for the AI Passive Income Navigator platform.

---

## 📚 Quick Navigation

| I want to... | Go to |
|---|---|
| **Get started as a developer** | [DEVELOPMENT.md](./DEVELOPMENT.md) |
| **Understand the architecture** | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| **Use the API** | [API.md](./API.md) |
| **Deploy the application** | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| **Monitor production** | [operations/](./operations/) |
| **Handle security** | [security/](./security/) |
| **Understand features** | [features/](./features/) |
| **Review legal requirements** | [legal/](./legal/) |
| **Browse all documentation** | [INDEX.md](./INDEX.md) |

---

## 📂 Documentation Structure

```
docs/
├── README.md (you are here)
├── INDEX.md                      # Full documentation index & navigation
│
├── Core Guides
│   ├── ARCHITECTURE.md           # System architecture overview
│   ├── DEVELOPMENT.md            # Dev setup
│   ├── TESTING.md                # Testing guide
│   ├── DEPLOYMENT.md             # Deployment guide
│   ├── API.md                    # API overview
│   ├── TROUBLESHOOTING.md        # Common issues
│   ├── JSDOC_EXAMPLES.md         # Code documentation standards
│   └── TECHNICAL_RECOMMENDATIONS.md
│
├── architecture/                 # System Design
│   ├── ARCHITECTURE_DECISIONS.md # ADRs
│   └── DATA_MODEL.md             # Database schemas & relationships
│
├── api/                          # Detailed API Documentation
│   ├── ERROR_HANDLING.md         # Error codes & retry strategies
│   └── cloud-functions/
│       └── REFERENCE.md          # All cloud functions reference
│
├── operations/                   # Operational Docs
│   ├── MONITORING.md             # Observability & alerting
│   ├── DISASTER_RECOVERY.md      # Backup/restore & DR plan
│   ├── PERFORMANCE_BASELINE.md   # SLAs & performance targets
│   └── RUNBOOK.md                # Operational procedures
│
├── security/                     # Security Docs
│   ├── INCIDENT_RESPONSE.md      # Security incident procedures
│   └── SECURITY_RECOMMENDATIONS.md
│
├── features/                     # Feature Documentation
│   └── deal-pipeline.md          # Deal pipeline feature
│
├── legal/                        # Legal Documents
│   ├── PRIVACY_POLICY.md         # Privacy Policy
│   └── TERMS_OF_SERVICE.md       # Terms of Service
│
├── product/                      # Product Documentation
│   ├── EXECUTIVE_SUMMARY.md      # Executive overview
│   ├── PRODUCT_AUDIT.md          # Technical & business audit
│   ├── PRODUCT_ROADMAP.md        # 3-month roadmap
│   └── IMPLEMENTATION_GUIDE.md   # Quick-start guide
│
└── audits/                       # Audit Reports
    ├── DOCUMENTATION_AUDIT.md
    ├── CODE_AUDIT.md
    ├── REFACTORING_SUMMARY.md
    ├── REFACTORING_COMPLETION_REPORT.md
    └── MISSING_DOCUMENTATION_INVENTORY.md
```

---

## 🎯 Documentation Status

### Legend
- ✅ **Complete** - Comprehensive, up-to-date, production-ready
- ⚠️ **Incomplete** - Exists but missing critical sections
- ❌ **Not Started** - Placeholder only, needs to be written
- 🔄 **Outdated** - Needs review and updates

### By Priority

#### P0 - CRITICAL (Production Blockers)
- ⚠️ [api/cloud-functions/REFERENCE.md](./api/cloud-functions/REFERENCE.md) - 74 functions need full contracts
- ✅ [api/ERROR_HANDLING.md](./api/ERROR_HANDLING.md) - Error handling strategy
- ✅ [architecture/DATA_MODEL.md](./architecture/DATA_MODEL.md) - Database schemas
- ✅ [operations/DISASTER_RECOVERY.md](./operations/DISASTER_RECOVERY.md) - Backup/restore
- ✅ [operations/MONITORING.md](./operations/MONITORING.md) - Observability
- ✅ [operations/RUNBOOK.md](./operations/RUNBOOK.md) - Operational procedures
- ✅ [security/INCIDENT_RESPONSE.md](./security/INCIDENT_RESPONSE.md) - Security incidents
- ✅ [legal/PRIVACY_POLICY.md](./legal/PRIVACY_POLICY.md) - LEGAL REQUIREMENT (template — review with counsel)
- ✅ [legal/TERMS_OF_SERVICE.md](./legal/TERMS_OF_SERVICE.md) - LEGAL REQUIREMENT (template — review with counsel)

#### P1 - High Priority (Quality Gates)
- ✅ [architecture/ARCHITECTURE_DECISIONS.md](./architecture/ARCHITECTURE_DECISIONS.md) - ADRs
- ✅ [operations/PERFORMANCE_BASELINE.md](./operations/PERFORMANCE_BASELINE.md) - SLAs
- ⚠️ [TESTING.md](./TESTING.md) - Incomplete test strategy
- ✅ [features/deal-pipeline.md](./features/deal-pipeline.md) - Deal pipeline feature

#### P2 - Medium Priority (Best Practices)
- ❌ Component library documentation
- ❌ State management guide
- ❌ Accessibility documentation
- ❌ Analytics events taxonomy

#### P3 - Low Priority (Nice to Have)
- ❌ Glossary
- ❌ FAQ
- ❌ Onboarding checklist
- ❌ SEO strategy

---

## 🚨 Remaining Gaps

The following documentation still needs attention before production launch:

1. **Cloud Functions Reference** (P0) - 74 functions need full input/output contracts in [api/cloud-functions/REFERENCE.md](./api/cloud-functions/REFERENCE.md)
2. **Legal Review** (P0) - Privacy Policy and Terms of Service templates must be reviewed by legal counsel before publishing
3. **Testing Strategy** (P1) - [TESTING.md](./TESTING.md) needs expanded test patterns and coverage targets

---

## 📖 How to Use This Documentation

### For New Developers
1. Start with [DEVELOPMENT.md](./DEVELOPMENT.md) - Set up your environment
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the system
3. Review [../CONTRIBUTING.md](../CONTRIBUTING.md) - Learn our workflow
4. Browse [features/](./features/) - Understand what we're building

### For Operators/SRE
1. Read [operations/RUNBOOK.md](./operations/RUNBOOK.md)
2. Review [operations/MONITORING.md](./operations/MONITORING.md)
3. Study [security/INCIDENT_RESPONSE.md](./security/INCIDENT_RESPONSE.md)
4. Understand [operations/DISASTER_RECOVERY.md](./operations/DISASTER_RECOVERY.md)

### For Product Managers
1. Review [product/PRODUCT_ROADMAP.md](./product/PRODUCT_ROADMAP.md) - Product strategy
2. Browse [features/](./features/) - Feature specifications
3. Check [product/PRODUCT_AUDIT.md](./product/PRODUCT_AUDIT.md) - Current state assessment

### For Security Team
1. Read [security/INCIDENT_RESPONSE.md](./security/INCIDENT_RESPONSE.md)
2. Review [../SECURITY.md](../SECURITY.md) - Security policy
3. Study [api/cloud-functions/REFERENCE.md](./api/cloud-functions/REFERENCE.md)

---

## 📝 Documentation Standards

All documentation in this repository follows these standards:

### Format
- **Markdown** - All docs use markdown (.md)
- **Clear headings** - H1 for title, H2 for sections
- **Code examples** - Include working code samples
- **Links** - Use relative links between docs
- **Status badges** - Indicate document status (Complete, Incomplete, Not Started)

### Structure
```markdown
# Document Title

**Status:** [Status Badge]

---

## Purpose

Clear description of what this document covers.

## Sections

### Section 1
Content...

### Section 2
Content...

---

**Priority:** P0/P1/P2/P3
**Assigned To:** [Name]
**Last Updated:** YYYY-MM-DD
```

### Maintenance
- Review quarterly (every 3 months)
- Update after major changes
- Archive outdated versions
- Keep changelog in git history

---

## 🤝 Contributing to Documentation

Found a gap? Want to improve docs? See [../CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

### Quick Steps
1. Identify documentation gap
2. Create issue using [documentation template](../.github/ISSUE_TEMPLATE/documentation.md)
3. Create branch: `docs/your-doc-name`
4. Write or update documentation
5. Submit pull request
6. Get review from tech lead or architect
7. Merge and celebrate! 🎉

---

## 📞 Documentation Help

- **Questions?** Create an issue with "documentation" label
- **Gaps found?** See [DOCUMENTATION_AUDIT.md](./audits/DOCUMENTATION_AUDIT.md)
- **Need review?** Tag `@tech-lead` in PR

---

## 📊 Documentation Metrics

**Current Status (as of 2026-03-14):**
- **Total Docs:** 38+ markdown files
- **Complete:** 22 (P0 blockers resolved)
- **Incomplete:** 4 (cloud functions reference, testing guide, and P2/P3 items)
- **Production Ready:** ⚠️ Nearly (legal templates need counsel review; cloud functions need full contracts)

**Remaining Before Production:**
- Cloud functions reference — full input/output contracts for all 74 functions
- Legal documents — counsel review of Privacy Policy and Terms of Service templates
- Testing guide — expand coverage targets and patterns

---

## 🗺️ Documentation Roadmap

See [audits/DOCUMENTATION_AUDIT.md](./audits/DOCUMENTATION_AUDIT.md) for the comprehensive audit history.

**Completed:** All P0 critical production blockers  
**Completed:** All P1 quality gate documentation  
**Next:** P2 medium-priority (component library, state management, accessibility)  
**Ongoing:** Maintenance and updates as features evolve

---

**For the complete documentation audit and gap analysis, see:**
📋 [audits/DOCUMENTATION_AUDIT.md](./audits/DOCUMENTATION_AUDIT.md)

---

*Last Updated: 2026-03-14*
*Maintained by: Development Team*
