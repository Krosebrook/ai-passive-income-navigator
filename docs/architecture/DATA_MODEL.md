# Data Model Documentation

**Status:** ⚠️ **Not Started** - CRITICAL Production Blocker

---

## Purpose

This document will define the complete data model for the AI Passive Income Navigator, including all collections, schemas, relationships, indexes, and data validation rules.

## Planned Sections

### 1. Collection Overview
- `ideas` - Passive income opportunity catalog
- `portfolioItems` - User portfolio tracking
- `bookmarks` - User bookmarked ideas
- `preferences` - User preferences and settings
- `marketData` - Market trends and analysis
- `communityPosts` - User-generated content
- `comments` - Post comments
- `analytics` - User analytics and metrics
- `deals` - Deal pipeline management (if exists)
- [Other collections to be documented]

### 2. Collection Schemas

For each collection:
- **Field definitions** (name, type, required, default)
- **Validation rules** (min/max length, format, enum values)
- **Indexes** (primary key, secondary indexes, full-text search)
- **Relationships** (foreign keys, references)

### 3. Data Relationships
- Entity-relationship diagrams
- One-to-many relationships
- Many-to-many relationships
- Referential integrity rules

### 4. Data Validation Rules
- Client-side validation (Zod schemas)
- Server-side validation (Base44 rules)
- Custom validation logic

### 5. Data Migration Strategy
- Schema versioning
- Backward compatibility
- Migration scripts
- Rollback procedures

### 6. Data Access Patterns
- Common query patterns
- Performance optimization (indexes)
- Caching strategy

---

## Example Schema (Template)

```typescript
// Collection: ideas
interface Idea {
  id: string;                    // Auto-generated UUID
  title: string;                 // Required, max 200 chars
  description: string;           // Required, max 5000 chars
  category: CategoryEnum;        // Required, enum
  difficulty: DifficultyEnum;    // Required, enum
  estimatedIncome: number;       // Optional, min 0
  timeCommitment: string;        // Optional
  requiredInvestment: number;    // Optional, min 0
  tags: string[];                // Optional array
  createdAt: Date;               // Auto-generated
  updatedAt: Date;               // Auto-updated
  createdBy: string;             // User ID (if user-generated)
}
```

---

**Priority:** P0 - CRITICAL  
**Estimated Documentation Time:** 3 days  
**Assigned To:** [Unassigned]  
**Target Completion:** [Not Set]

---

*This placeholder was created during the 2026-01-21 documentation audit.*
