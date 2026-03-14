# Data Model Documentation

**Version:** 1.0  
**Last Updated:** 2026-01-19  
**Platform:** Base44 BaaS (NoSQL document collections)

---

## Table of Contents

- [Overview](#overview)
- [Collections](#collections)
  - [ideas](#ideas)
  - [portfolioItems](#portfolioitems)
  - [bookmarks](#bookmarks)
  - [preferences](#preferences)
  - [marketData](#marketdata)
  - [communityPosts](#communityposts)
  - [comments](#comments)
  - [analytics](#analytics)
  - [deals](#deals)
  - [DealAnalysis](#dealanalysis)
  - [SourcedDealOpportunity](#sourceddealopportunity)
  - [DealPipeline](#dealpipeline)
  - [DealStage](#dealstage)
  - [DealTask](#dealtask)
  - [DealSourcingCriteria](#dealsourcingcriteria)
- [Relationships](#relationships)
- [Validation Rules](#validation-rules)
- [Indexing Strategy](#indexing-strategy)
- [Data Lifecycle](#data-lifecycle)

---

## Overview

The AI Passive Income Navigator uses Base44's NoSQL document store. All collections are scoped per user via `created_by` (the authenticated user's email). Documents are JSON objects; there is no rigid schema enforcement at the database layer — validation is performed in cloud functions and client-side Zod schemas.

**Conventions:**
- All documents include `created_date` and `updated_date` (ISO 8601 timestamps) managed by Base44.
- `created_by` stores the user's email address and acts as the ownership/tenancy key.
- Enumerated string fields are documented with allowed values.
- Monetary values are stored as `number` (USD by default unless noted).
- Scores are `number` in the range `0–100` unless noted.

---

## Collections

### `ideas`

Stores passive income opportunity ideas discovered or created by the user.

```typescript
interface Idea {
  id: string;                        // Base44 auto-generated UUID
  created_by: string;                // User email (owner)
  created_date: string;              // ISO 8601
  updated_date: string;              // ISO 8601

  // Core fields
  title: string;                     // Required. Max 200 chars.
  description: string;               // Required. Max 5000 chars.
  category: IdeaCategory;            // Required. See enum below.
  status: IdeaStatus;                // Required. Default: "new"

  // Financial estimates
  estimated_income_min: number;      // Monthly USD, >= 0
  estimated_income_max: number;      // Monthly USD, >= estimated_income_min
  initial_investment: number;        // USD, >= 0
  time_to_profit_months: number;     // Integer, >= 0
  effort_level: EffortLevel;         // "low" | "medium" | "high"

  // AI-generated fields
  ai_viability_score: number;        // 0–100, populated by analyzeIdeaViability
  ai_risk_score: number;             // 0–100, higher = riskier
  ai_market_analysis: object;        // Structured market data from LLM
  ai_recommendation: string;         // "strong_buy" | "buy" | "hold" | "avoid"

  // Metadata
  tags: string[];                    // User-defined tags
  source: IdeaSource;                // Where the idea came from
  is_bookmarked: boolean;            // Denormalized for performance
  notes: string;                     // Free-text user notes
}

type IdeaCategory =
  | "digital_products"
  | "content_creation"
  | "affiliate_marketing"
  | "saas"
  | "real_estate"
  | "dividend_investing"
  | "peer_lending"
  | "ecommerce"
  | "licensing"
  | "dropshipping"
  | "nft_crypto"
  | "other";

type IdeaStatus = "new" | "researching" | "active" | "paused" | "abandoned" | "completed";
type EffortLevel = "low" | "medium" | "high";
type IdeaSource = "ai_generated" | "community" | "manual" | "imported";
```

---

### `portfolioItems`

Tracks active passive income streams in the user's portfolio.

```typescript
interface PortfolioItem {
  id: string;
  created_by: string;
  created_date: string;
  updated_date: string;

  // Identity
  name: string;                      // Required. Max 200 chars.
  description: string;               // Max 2000 chars.
  category: IdeaCategory;            // Same enum as ideas
  idea_id: string | null;            // Optional reference to originating idea

  // Status
  status: PortfolioStatus;           // Required
  start_date: string;                // ISO 8601 date when tracking began
  end_date: string | null;           // ISO 8601, null if still active

  // Financial tracking
  initial_investment: number;        // Actual investment made, USD
  monthly_income_target: number;     // Goal monthly income, USD
  monthly_income_actual: number;     // Last recorded monthly income, USD
  total_income_earned: number;       // Cumulative income, USD
  total_expenses: number;            // Cumulative expenses, USD

  // Performance
  roi_percentage: number;            // (total_income - total_expenses) / initial_investment * 100
  performance_trend: "improving" | "stable" | "declining";

  // Metadata
  platform: string;                  // e.g., "Gumroad", "Amazon KDP"
  url: string;                       // Link to the income stream
  notes: string;
  tags: string[];
  income_history: IncomeEntry[];     // Monthly income log
}

type PortfolioStatus = "planning" | "active" | "paused" | "completed" | "failed";

interface IncomeEntry {
  month: string;                     // "YYYY-MM"
  income: number;                    // USD
  expenses: number;                  // USD
  notes: string;
}
```

---

### `bookmarks`

User-saved ideas, community posts, or deals for later review.

```typescript
interface Bookmark {
  id: string;
  created_by: string;
  created_date: string;
  updated_date: string;

  entity_type: "idea" | "community_post" | "deal" | "market_data";
  entity_id: string;                 // ID of the bookmarked entity
  entity_title: string;              // Denormalized title for display
  notes: string;                     // User annotation
  tags: string[];
  folder: string;                    // Optional grouping folder name
}
```

---

### `preferences`

Per-user application settings and investment criteria.

```typescript
interface Preferences {
  id: string;
  created_by: string;
  created_date: string;
  updated_date: string;

  // Investment criteria
  risk_tolerance: "low" | "medium" | "high";
  max_initial_investment: number;    // USD
  target_monthly_income: number;     // USD
  preferred_categories: IdeaCategory[];
  max_time_to_profit_months: number;
  min_profit_margin: number;         // Percentage 0–100

  // Deal sourcing criteria (mirrors DealSourcingCriteria)
  min_market_size: number;           // USD
  max_competition_level: "low" | "medium" | "high";

  // UI preferences
  dashboard_layout: "grid" | "list";
  currency: string;                  // ISO 4217, default "USD"
  timezone: string;                  // IANA timezone string
  email_notifications: boolean;
  notification_frequency: "daily" | "weekly" | "monthly" | "off";

  // Onboarding
  onboarding_completed: boolean;
  onboarding_step: number;
  experience_level: "beginner" | "intermediate" | "advanced";
}
```

---

### `marketData`

Cached or fetched market intelligence snapshots.

```typescript
interface MarketData {
  id: string;
  created_by: string;
  created_date: string;
  updated_date: string;

  category: IdeaCategory;
  data_source: string;               // e.g., "fetchMarketData", "fetchRealTimeMarketData"
  fetch_date: string;                // ISO 8601

  // Market metrics
  market_size_usd: number;
  growth_rate_pct: number;           // Annual %
  saturation_level: "low" | "medium" | "high";
  trend_direction: "rising" | "stable" | "declining";
  sentiment_score: number;           // 0–100

  // Aggregated data
  top_opportunities: object[];
  top_risks: object[];
  news_summary: string;
  raw_data: object;                  // Full LLM response payload

  ttl_hours: number;                 // Cache expiry hint, default 24
}
```

---

### `communityPosts`

User-created posts in the community feed (tips, success stories, questions).

```typescript
interface CommunityPost {
  id: string;
  created_by: string;
  created_date: string;
  updated_date: string;

  title: string;                     // Required, max 300 chars
  body: string;                      // Required, max 10000 chars (Markdown)
  post_type: CommunityPostType;
  category: IdeaCategory | "general";

  // Engagement
  like_count: number;
  comment_count: number;             // Denormalized
  view_count: number;
  is_pinned: boolean;
  is_featured: boolean;

  // Author info (denormalized)
  author_name: string;
  author_avatar_url: string | null;

  tags: string[];
  attachments: Attachment[];
}

type CommunityPostType = "tip" | "success_story" | "question" | "discussion" | "resource";

interface Attachment {
  url: string;
  type: "image" | "pdf" | "link";
  title: string;
}
```

---

### `comments`

Comments on community posts.

```typescript
interface Comment {
  id: string;
  created_by: string;
  created_date: string;
  updated_date: string;

  post_id: string;                   // Reference to communityPosts.id
  parent_comment_id: string | null;  // Null for top-level, set for replies
  body: string;                      // Max 5000 chars (Markdown)
  like_count: number;
  is_deleted: boolean;               // Soft delete flag

  // Denormalized author
  author_name: string;
  author_avatar_url: string | null;
}
```

---

### `analytics`

User activity and engagement events for personalization and insights.

```typescript
interface AnalyticsEvent {
  id: string;
  created_by: string;
  created_date: string;

  event_type: AnalyticsEventType;
  entity_type: string | null;        // e.g., "idea", "deal", "portfolio_item"
  entity_id: string | null;

  // Session context
  session_id: string;
  page_path: string;
  referrer: string | null;

  // Event payload
  properties: Record<string, unknown>;

  // Performance
  duration_ms: number | null;
  error_code: string | null;
}

type AnalyticsEventType =
  | "page_view"
  | "idea_created"
  | "idea_analyzed"
  | "deal_viewed"
  | "deal_added_to_pipeline"
  | "portfolio_item_added"
  | "search_performed"
  | "filter_applied"
  | "ai_chat_message"
  | "onboarding_step_completed"
  | "feature_used";
```

---

### `deals`

Generic deal records (simplified; full pipeline uses `DealPipeline`).

```typescript
interface Deal {
  id: string;
  created_by: string;
  created_date: string;
  updated_date: string;

  name: string;                      // Required, max 300 chars
  description: string;
  category: IdeaCategory;
  source_url: string | null;

  // Scores (AI-populated)
  overall_score: number;             // 0–100
  risk_score: number;                // 0–100
  reward_score: number;              // 0–100
  ai_recommendation: string;        // "strong_buy" | "buy" | "hold" | "avoid"

  // Financial
  asking_price: number | null;
  annual_revenue: number | null;
  profit_margin_pct: number | null;

  pipeline_id: string | null;        // Link to DealPipeline if in pipeline
  status: "sourced" | "analyzing" | "in_pipeline" | "archived";
  tags: string[];
}
```

---

### `DealAnalysis`

Detailed AI analysis results for a deal (created by `analyzeDeal` function).

```typescript
interface DealAnalysis {
  id: string;
  created_by: string;
  created_date: string;

  deal_name: string;
  deal_description: string;
  deal_category: IdeaCategory;
  user_criteria: DealUserCriteria;

  analysis_results: {
    overall_score: number;
    risk_score: number;
    reward_score: number;
    market_analysis: {
      market_size_estimate: string;
      growth_rate: string;
      saturation_level: string;
      score: number;
    };
    competition_analysis: {
      competition_level: "low" | "medium" | "high";
      key_competitors: string[];
      competitive_advantages: string[];
      score: number;
    };
    profitability_analysis: {
      estimated_timeline_months: number;
      expected_profit_margin: number;
      revenue_potential: string;
      score: number;
    };
    risk_factors: RiskFactor[];
    opportunities: string[];
    recommendation: "strong_buy" | "buy" | "hold" | "avoid";
    recommendation_reasoning: string;
    market_data_timestamp: string;
    document_analysis_included: boolean;
    scenarios: EconomicScenario[] | null;
  };

  criteria_match: {
    market_size_match: boolean;
    competition_match: boolean;
    timeline_match: boolean;
    profit_margin_match: boolean;
    overall_match_percentage: number;
  };
}

interface RiskFactor {
  factor: string;
  severity: "low" | "medium" | "high" | "critical";
  mitigation: string;
}

interface EconomicScenario {
  scenario_name: "optimistic" | "base_case" | "pessimistic";
  probability: string;
  revenue_impact_pct: number;
  profit_margin_impact: number;
  timeline_adjustment_months: number;
  risk_level: string;
  key_triggers: string[];
  recommended_actions: string[];
}

interface DealUserCriteria {
  min_market_size: number;
  max_competition_level: "low" | "medium" | "high";
  max_profitability_timeline_months: number;
  min_profit_margin: number;
  required_initial_investment: number;
  risk_tolerance: "low" | "medium" | "high";
}
```

---

### `SourcedDealOpportunity`

Deals discovered by AI sourcing functions (`aiSourceAndAnalyzeDeals`, `scrapeDealPlatforms`).

```typescript
interface SourcedDealOpportunity {
  id: string;
  created_by: string;
  created_date: string;
  updated_date: string;

  // Deal identity
  name: string;
  description: string;
  category: IdeaCategory;
  source_platform: string;           // e.g., "Flippa", "MicroAcquire", "Empire Flippers"
  source_url: string;
  listing_date: string | null;

  // Financial snapshot (from listing)
  asking_price: number | null;
  annual_revenue: number | null;
  annual_profit: number | null;
  multiple: number | null;           // Price / annual profit multiple

  // AI categorization (set by categorizeDeal)
  ai_category: "hot_lead" | "warm_lead" | "cold_lead" | "nurture" | "pass";
  ai_priority_score: number;         // 0–100
  ai_match_quality: "excellent" | "good" | "fair" | "poor";

  // Pipeline linkage
  pipeline_id: string | null;
  status: "new" | "reviewed" | "in_pipeline" | "passed" | "archived";
}
```

---

### `DealPipeline`

A deal actively being tracked through the pipeline stages.

```typescript
interface DealPipeline {
  id: string;
  created_by: string;
  created_date: string;
  updated_date: string;

  name: string;
  description: string;
  category: IdeaCategory;
  source_opportunity_id: string | null;

  // Current state
  stage: PipelineStage;
  stage_history: StageHistoryEntry[];

  // Financial
  asking_price: number | null;
  offer_price: number | null;
  final_price: number | null;
  projected_roi_pct: number | null;
  projected_monthly_income: number | null;

  // Dates
  target_close_date: string | null;
  actual_close_date: string | null;

  // AI insights
  ai_insights: object | null;        // from generateDealInsights
  ai_report_url: string | null;      // from generateDealReport
  due_diligence_report: object | null;

  // Workflow
  assigned_workflow: string | null;  // from suggestDealWorkflow
  automation_enabled: boolean;
  priority: "low" | "medium" | "high" | "critical";
  notes: string;
  tags: string[];
}

type PipelineStage =
  | "sourcing"
  | "initial_review"
  | "analysis"
  | "negotiation"
  | "due_diligence"
  | "execution"
  | "monitoring"
  | "completed"
  | "archived";

interface StageHistoryEntry {
  stage: PipelineStage;
  entered_at: string;                // ISO 8601
  exited_at: string | null;
  notes: string;
  changed_by: string;               // User email
}
```

---

### `DealStage`

Configuration for pipeline stage ordering and automation rules.

```typescript
interface DealStage {
  id: string;
  created_by: string;
  created_date: string;
  updated_date: string;

  name: string;                      // Display name
  order: number;                     // Sort position, 0-indexed
  description: string;
  color: string;                     // Hex color for Kanban display
  is_terminal: boolean;              // true for "completed" / "archived"
  auto_advance_criteria: object | null;
  checklist_items: ChecklistItem[];
}

interface ChecklistItem {
  id: string;
  label: string;
  is_required: boolean;
  order: number;
}
```

---

### `DealTask`

Action items associated with a deal in the pipeline.

```typescript
interface DealTask {
  id: string;
  created_by: string;
  created_date: string;
  updated_date: string;

  pipeline_id: string;               // Reference to DealPipeline.id
  stage: PipelineStage;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  due_date: string | null;           // ISO 8601
  completed_at: string | null;
  assigned_to: string;               // User email
  is_ai_generated: boolean;          // Created by suggestDealWorkflow
}
```

---

### `DealSourcingCriteria`

User-defined filters for AI-powered deal sourcing.

```typescript
interface DealSourcingCriteria {
  id: string;
  created_by: string;
  created_date: string;
  updated_date: string;

  name: string;                      // Criteria set name, e.g., "Conservative SaaS"
  is_default: boolean;               // One active default per user

  categories: IdeaCategory[];
  min_annual_revenue: number;
  max_asking_price: number;
  min_profit_margin_pct: number;
  max_multiple: number;              // Price/profit multiple ceiling
  min_years_operating: number;
  max_competition_level: "low" | "medium" | "high";
  risk_tolerance: "low" | "medium" | "high";
  geographic_focus: string[];        // Country codes, e.g., ["US", "CA"]
  exclude_keywords: string[];
  require_keywords: string[];
}
```

---

## Relationships

```
preferences (1) ──── (1) user
ideas       (many) ─ (1) user
  └── bookmarks reference ideas
  └── portfolioItems may reference ideas (via idea_id)

DealSourcingCriteria (many) ─ (1) user
SourcedDealOpportunity (many) ─ (1) user
  └── DealPipeline references SourcedDealOpportunity (via source_opportunity_id)
    └── DealTask (many) references DealPipeline
    └── DealAnalysis references deal by name (denormalized)

communityPosts (many) ─ (1) user
  └── comments (many) reference communityPosts (via post_id)
  └── bookmarks can reference communityPosts

analytics (many) ─ (1) user
marketData (many) ─ (1) user (or shared)
```

---

## Validation Rules

| Field | Rule |
|-------|------|
| `ideas.title` | Required, 1–200 chars |
| `ideas.estimated_income_max` | Must be ≥ `estimated_income_min` |
| `ideas.ai_viability_score` | 0–100, set by cloud function only |
| `portfolioItems.roi_percentage` | Calculated field, not user-writable |
| `communityPosts.body` | Required, max 10,000 chars, Markdown sanitized |
| `DealPipeline.stage` | Must be valid `PipelineStage` enum value |
| `DealPipeline.stage_history` | Append-only; entries must be chronological |
| `DealSourcingCriteria.is_default` | Enforce one `true` per user in cloud function |
| `preferences.currency` | Must be valid ISO 4217 code |

---

## Indexing Strategy

Base44 automatically indexes `id` and `created_by`. For performance-critical queries, the following filter patterns are used:

| Collection | Common Filter | Notes |
|------------|--------------|-------|
| `ideas` | `created_by`, `status`, `category` | Filtered list views |
| `portfolioItems` | `created_by`, `status` | Dashboard aggregation |
| `DealPipeline` | `created_by`, `stage` | Kanban board |
| `DealTask` | `pipeline_id`, `status`, `due_date` | Task board |
| `communityPosts` | `post_type`, `category` | Community feed |
| `comments` | `post_id` | Thread loading |
| `analytics` | `created_by`, `event_type`, `created_date` | Reporting |

---

## Data Lifecycle

| Collection | Retention | Archival Strategy |
|------------|-----------|-------------------|
| `ideas` | Indefinite | User can soft-delete (status: "abandoned") |
| `portfolioItems` | Indefinite | status: "completed" or "failed" |
| `DealPipeline` | Indefinite | stage: "archived" |
| `analytics` | 90 days rolling | Summarised into `preferences` fields |
| `marketData` | 24–72 hours | TTL-based; re-fetched on demand |
| `communityPosts` | Indefinite | Soft-delete (`is_deleted`) |
| `comments` | Indefinite | Soft-delete (`is_deleted: true`, body replaced with "[deleted]") |

---

*Related: [Architecture Documentation](../ARCHITECTURE.md) · [API Documentation](../API.md) · [Deal Pipeline Feature](../features/deal-pipeline.md)*

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
