# Feature: Deal Pipeline Management

**Version:** 1.0  
**Last Updated:** 2026-01-19

---

## Table of Contents

- [Feature Overview](#feature-overview)
- [Pipeline Stages](#pipeline-stages)
- [Key User Flows](#key-user-flows)
- [Data Model](#data-model)
- [Cloud Functions Reference](#cloud-functions-reference)
- [AI Capabilities](#ai-capabilities)
- [Automation System](#automation-system)
- [Analytics and Reporting](#analytics-and-reporting)
- [Notifications and Reminders](#notifications-and-reminders)
- [How to Use the Feature](#how-to-use-the-feature)
- [Configuration](#configuration)
- [Known Limitations](#known-limitations)

---

## Feature Overview

The Deal Pipeline is the core feature for users who want to move beyond idea discovery into actively sourcing, evaluating, and executing passive income opportunities. It provides a structured workflow — similar to a sales CRM — tailored to the lifecycle of a passive income deal (e.g., acquiring a content site, buying a dividend-paying stock portfolio, or launching a SaaS product).

### What It Does

- **Sourcing:** AI automatically finds and ranks deals from various platforms and categories based on the user's criteria
- **Analysis:** Deep AI-powered analysis with market data, financial projections, risk scoring, and economic scenario simulations
- **Pipeline Management:** Kanban-style board to move deals through stages from discovery to execution
- **Workflow Automation:** Automatically creates tasks, reminders, and follow-up actions when deals change stages
- **Insights and Reporting:** AI-generated insights, ROI forecasts, due diligence reports, and performance analytics

### Who Uses It

Users who are actively evaluating passive income opportunities — not just browsing ideas. Typical users have moved past the "learning" phase and are ready to transact.

---

## Pipeline Stages

Deals move through a sequential pipeline. Each stage has defined entry criteria, key activities, and exit conditions.

```
  ┌──────────┐   ┌────────────────┐   ┌──────────┐   ┌─────────────┐
  │ Sourcing │──▶│ Initial Review │──▶│ Analysis │──▶│ Negotiation │
  └──────────┘   └────────────────┘   └──────────┘   └─────────────┘
                                                              │
  ┌────────────┐   ┌───────────┐   ┌──────────────┐          │
  │ Monitoring │◀──│ Execution │◀──│ Due Diligence│◀─────────┘
  └────────────┘   └───────────┘   └──────────────┘
       │
       ▼
  ┌───────────┐
  │ Completed │
  └───────────┘
  (or Archived)
```

### Stage Descriptions

| Stage | Purpose | Key Activities | AI Support |
|-------|---------|---------------|-----------|
| **Sourcing** | Discover deals from platforms and AI suggestions | Browse sourced opportunities, set criteria | `aiSourceAndAnalyzeDeals`, `scrapeDealPlatforms`, `scoreDealOpportunities` |
| **Initial Review** | Quick assessment — pass or proceed? | Review AI categorisation, read summary | `categorizeDeal`, `categorizeDealWithAI` |
| **Analysis** | Deep dive — financial, market, risk | Run full analysis, compare with alternatives | `analyzeDeal`, `compareDeals`, `forecastDealROI` |
| **Negotiation** | Price and terms | Document offers, track counter-offers | `generateDealInsights`, `generateDealStructureVariations` |
| **Due Diligence** | Verify claims and assumptions | Checklist completion, document review | `performDealDueDiligence`, `generateDueDiligenceReport` |
| **Execution** | Close and execute | Final steps, paperwork, payment | `suggestDealWorkflow`, `executePipelineAutomation` |
| **Monitoring** | Track post-acquisition performance | Income tracking, milestone alerts | `sendDealReminders`, `calculatePipelineAnalytics` |
| **Completed** | Terminal — successful exit or maturity | Generate final performance report | `generateDealReport` |
| **Archived** | Terminal — passed or failed | Document learnings | — |

---

## Key User Flows

### Flow 1: AI-Sourced Deal → Pipeline

```
1. User configures DealSourcingCriteria (categories, budget, risk tolerance)
2. User clicks "Find Deals"
3. System invokes: aiSourceAndAnalyzeDeals → scrapeDealPlatforms → scoreDealOpportunities
4. Sourced deals appear in the "Sourcing" stage with AI scores
5. User reviews deal cards (name, category, AI match score, asking price)
6. User clicks "Add to Pipeline" → deal moves to "Initial Review"
7. categorizeDeal runs automatically → assigns hot/warm/cold lead label
8. User reviews the categorisation and moves to "Analysis" or passes
```

### Flow 2: Manual Deal Entry → Analysis

```
1. User clicks "Add Deal" and fills in name, description, category
2. Deal is created in "Initial Review" stage
3. User clicks "Analyse" → invokes analyzeDeal function
4. Analysis runs (8–25 seconds with LLM + web search)
5. Results appear: overall score, risk score, market analysis, recommendation
6. If analysis suggests "buy" or "strong_buy", user moves deal to "Negotiation"
```

### Flow 3: Stage Change → Automated Workflow

```
1. User drags deal from "Analysis" to "Negotiation" on the Kanban board
2. executePipelineAutomation is triggered by the stage change event
3. Active automation rules for "negotiation" stage are fetched
4. System automatically creates:
   - Task: "Research comparable deal prices" (due in 3 days)
   - Reminder: "Follow up with seller" (due in 7 days)
   - Email draft: Template for initial offer email
5. User sees new tasks appear in the deal's task list
```

### Flow 4: Due Diligence → Execution

```
1. User moves deal to "Due Diligence"
2. System invokes performDealDueDiligence → generates a due diligence checklist
3. generateDueDiligenceReport creates a structured report
4. User works through the checklist (financials verified, traffic confirmed, etc.)
5. When checklist is 100% complete, deal is eligible to move to "Execution"
6. suggestDealWorkflow generates a personalised closing workflow
7. User executes steps and moves deal to "Monitoring" or "Completed"
```

### Flow 5: Portfolio-Level Analytics

```
1. User navigates to "Pipeline Analytics" dashboard
2. calculatePipelineAnalytics is invoked
3. Returns:
   - Conversion rates by stage
   - Average deal cycle time
   - Revenue potential of pipeline
   - Stage bottlenecks
   - Task completion rates
4. Recharts render the analytics as bar, line, and funnel charts
```

---

## Data Model

The deal pipeline uses the following Base44 collections. See [DATA_MODEL.md](../architecture/DATA_MODEL.md) for full schema definitions.

### Primary Collections

| Collection | Purpose |
|-----------|---------|
| `DealSourcingCriteria` | User's filters for AI-powered deal sourcing |
| `SourcedDealOpportunity` | Raw deals found by sourcing functions |
| `DealPipeline` | Active deals being tracked through stages |
| `DealStage` | Stage configuration (order, colors, automation rules) |
| `DealTask` | Action items associated with a deal |
| `DealAnalysis` | Stored results from `analyzeDeal` function |

### Key Fields on `DealPipeline`

```typescript
{
  id: string,
  name: string,
  stage: PipelineStage,          // Current stage
  stage_history: StageHistoryEntry[], // Full audit trail
  asking_price: number | null,
  offer_price: number | null,
  projected_roi_pct: number | null,
  projected_monthly_income: number | null,
  ai_insights: object | null,    // From generateDealInsights
  due_diligence_report: object | null,
  assigned_workflow: string | null,
  automation_enabled: boolean,
  priority: "low" | "medium" | "high" | "critical",
}
```

### Stage History

Every stage transition is logged in `stage_history` (append-only):

```typescript
{
  stage: "negotiation",
  entered_at: "2026-01-19T14:32:00Z",
  exited_at: "2026-01-22T09:15:00Z",
  notes: "Offer submitted at $12,000",
  changed_by: "user@example.com"
}
```

---

## Cloud Functions Reference

### Sourcing Functions

| Function | Input | Output | Notes |
|----------|-------|--------|-------|
| `aiSourceAndAnalyzeDeals` | User criteria | Array of sourced deals with AI scores | Combines scraping + LLM analysis |
| `scrapeDealPlatforms` | Category, criteria | Raw deal listings | Web scraping + filtering |
| `searchDealPlatforms` | Search query, filters | Ranked deal list | Keyword-based search |
| `scoreDealOpportunities` | Array of deals, criteria | Deals with priority scores | Ranks by user criteria match |
| `sourceDealOpportunities` | Criteria | Sourced deals | General sourcing function |
| `sourceDealOpportunitiesExternal` | Criteria | External platform results | Fetches from external APIs |
| `proactivelySourceDeals` | User profile | Proactive suggestions | Background sourcing based on preferences |
| `originateNewDeals` | Category, budget | New deal ideas | Generates novel deal opportunities |

### Analysis Functions

| Function | Input | Output | Notes |
|----------|-------|--------|-------|
| `analyzeDeal` | `dealName`, `dealDescription`, `dealCategory`, `userCriteria`, `documentUrls?`, `runScenarios?` | Full analysis with scores, risks, opportunities | Core analysis function; uses real-time web data |
| `categorizeDeal` | `dealId` | Category label + priority score | Assigns hot/warm/cold/pass labels |
| `categorizeDealWithAI` | Deal data | AI-powered categorisation | Extended version with richer output |
| `compareDeals` | Array of deal IDs | Comparison matrix | Side-by-side analysis of multiple deals |
| `forecastDealROI` | Deal data, timeline | ROI projections | 3/6/12/24 month forecasts |
| `generateDealStructureVariations` | Deal data | 3 alternative deal structures | Creative structuring options |
| `predictDealPerformance` | Deal + historical data | Performance prediction | ML-based scoring |
| `screenAndRankDeals` | Array of deals, criteria | Ranked list | Bulk screening |

### Insights and Reporting Functions

| Function | Input | Output | Notes |
|----------|-------|--------|-------|
| `generateDealInsights` | `dealId` | AI insights on negotiation, risks, timing | Contextual deal coaching |
| `generateDealReport` | `dealId` | Formatted markdown report | Shareable deal summary |
| `generateDueDiligenceReport` | `dealId` | Structured DD checklist + findings | Comprehensive DD support |
| `performDealDueDiligence` | `dealId`, documents | Due diligence checklist + analysis | Automated DD process |

### Workflow and Automation Functions

| Function | Input | Output | Notes |
|----------|-------|--------|-------|
| `suggestDealWorkflow` | `dealId` | Personalised workflow with stages, tasks, email templates | AI-generated action plan |
| `executePipelineAutomation` | Stage change event | Created tasks, reminders, notifications | Triggered on stage change |
| `sendDealReminders` | Scheduled trigger | Reminder notifications sent | Runs on schedule |
| `notifyDealUpdate` | Deal update event | Notifications to assigned users | Event-driven notifications |

### Analytics Functions

| Function | Input | Output | Notes |
|----------|-------|--------|-------|
| `calculatePipelineAnalytics` | User's deals | Conversion rates, cycle times, stage distribution, revenue potential | Pipeline-wide metrics |

---

## AI Capabilities

### Deal Analysis (`analyzeDeal`)

The most powerful function in the pipeline. For each deal, it produces:

- **Overall Score (0–100):** Weighted average of market, competition, and profitability scores
- **Risk Score (0–100):** Higher = riskier
- **Reward Score (0–100):** Upside potential
- **Market Analysis:** Size, growth rate, saturation level
- **Competition Analysis:** Level, key competitors, competitive advantages
- **Profitability Analysis:** Timeline to profit, margin estimate, revenue potential
- **Risk Factors:** 3–5 risks with severity and mitigation strategies
- **Recommendation:** `strong_buy` | `buy` | `hold` | `avoid`
- **Economic Scenarios** (optional): Optimistic, base case, pessimistic projections

**Important:** The analysis uses `add_context_from_internet: true` for real-time market data. This adds 5–15 seconds to the response time but significantly improves accuracy.

### Deal Insights (`generateDealInsights`)

Context-aware coaching for the deal's current stage:
- Success probability score
- Negotiation strategies specific to the current stage
- Timing recommendations
- Leverage points and walk-away conditions
- Market timing analysis

### Workflow Suggestion (`suggestDealWorkflow`)

Generates a personalised workflow based on:
- Deal name, description, category, and current stage
- User's risk tolerance and time commitment preferences
- Recommended stages for the specific deal type
- Scheduled actions with relative timing (e.g., "follow up at day 3, week 1, week 2")
- Email templates for seller outreach

---

## Automation System

The pipeline automation system executes predefined rules when deals change stages.

### How Automation Works

1. A deal's `stage` field is updated (via UI or programmatically)
2. Base44 entity triggers fire `executePipelineAutomation` with the before/after state
3. The function fetches active `PipelineAutomationRule` records matching `trigger_stage`
4. For each matching rule, it executes the configured `actions` array

### Supported Action Types

| Action Type | What It Does | Required Config |
|------------|-------------|----------------|
| `create_task` | Creates a `DealTask` assigned to the deal owner | `task_title`, `task_description`, `task_priority`, `due_days_offset` |
| `create_reminder` | Creates a `DealReminder` | `reminder_message`, `reminder_days_offset` |
| `send_notification` | Triggers `sendNotification` function | `notification_type`, `message_template` |
| `update_deal_field` | Updates a field on the `DealPipeline` record | `field_name`, `field_value` |

### Enabling Automation

Automation is controlled per-deal via the `automation_enabled` flag on `DealPipeline`. It is `true` by default.

To disable automation for a specific deal:

```typescript
await base44.entities.DealPipeline.update(dealId, {
  automation_enabled: false
});
```

---

## Analytics and Reporting

### Pipeline Analytics (`calculatePipelineAnalytics`)

The analytics function calculates:

| Metric | Description |
|--------|-------------|
| **Deal cycle time** | Average days from creation to completion |
| **Conversion rate by stage** | % of deals that advance from each stage to the next |
| **Stage distribution** | Count of deals in each stage |
| **Revenue potential** | Sum of `projected_monthly_income` for all active deals |
| **Task completion rate** | % of tasks completed vs. overdue |
| **Won/lost ratio** | Completed vs. archived (passed) deals |

### Deal Report (`generateDealReport`)

The report function creates a comprehensive markdown document covering:
- Deal overview and investment thesis
- Financial projections (3, 6, 12, 24 months)
- Risk assessment with mitigation plans
- Market analysis summary
- Due diligence findings
- Recommended next steps

Reports are stored in the `DealPipeline.ai_report_url` field and can be downloaded or shared.

---

## Notifications and Reminders

### `sendDealReminders`

A scheduled function (runs daily) that:
1. Fetches all `DealReminder` records with `reminder_date <= today`
2. For each reminder, invokes `sendNotification`
3. Marks the reminder as sent

### `notifyDealUpdate`

Triggered on deal updates (stage changes, new analysis results):
- Notifies the deal owner via email (if email notifications are enabled)
- Updates the in-app notification feed

### In-App Notifications

The notification feed shows:
- AI analysis completed (with overall score)
- Stage changed (with new stage name)
- Overdue tasks
- Upcoming due diligence deadlines
- Reminder due dates

---

## How to Use the Feature

### Step 1: Configure Sourcing Criteria

1. Navigate to **Deal Pipeline** in the main navigation
2. Click **⚙️ Sourcing Settings**
3. Set your criteria:
   - Categories of interest (e.g., "saas", "content_creation")
   - Maximum asking price
   - Minimum annual revenue
   - Risk tolerance
   - Maximum deal multiple (price / annual profit)
4. Click **Save Criteria**

### Step 2: Source Deals

**Option A: AI Auto-Source**
1. Click **🤖 Find Deals**
2. Select categories to search
3. Wait 15–30 seconds for sourcing to complete
4. Review the sourced deals, sorted by AI match score

**Option B: Add Deal Manually**
1. Click **+ Add Deal**
2. Enter the deal name, description, category, and any known financial details
3. Click **Save**

### Step 3: Analyse a Deal

1. Click on a deal card to open the deal detail view
2. Click **🔬 Run Analysis**
3. Optionally: upload document URLs for analysing pitch decks or financial reports
4. Optionally: enable "Run Economic Scenarios" for bull/base/bear projections
5. Wait for the analysis to complete (8–25 seconds)
6. Review the analysis panel:
   - Overall score and recommendation badge
   - Risk and reward scores
   - Market, competition, and profitability breakdowns
   - Risk factors with mitigation strategies

### Step 4: Manage the Pipeline

1. The main Pipeline view is a Kanban board with columns for each stage
2. Drag deal cards between stages (triggers automation)
3. Click on a deal card to:
   - View the full analysis
   - Add notes
   - Complete tasks
   - View stage history
4. Use filters to narrow the board: by category, priority, or score range

### Step 5: Complete Due Diligence

1. When a deal is in "Due Diligence", click **📋 Generate DD Report**
2. Work through the generated checklist
3. Check off items as you verify them
4. Add findings notes for each item
5. When the checklist is complete, the deal is eligible to move to "Execution"

### Step 6: Post-Execution Monitoring

1. After moving a deal to "Monitoring", set up monthly income tracking
2. Log actual income each month via the income log
3. Review the AI-generated performance insights
4. Set reminders for quarterly reviews

---

## Configuration

### Sourcing Criteria Fields

| Field | Description | Default |
|-------|-------------|---------|
| `categories` | Deal categories to source | All categories |
| `min_annual_revenue` | Minimum annual revenue | $0 |
| `max_asking_price` | Maximum asking price | $50,000 |
| `min_profit_margin_pct` | Minimum profit margin % | 20% |
| `max_multiple` | Maximum price/profit multiple | 3x |
| `risk_tolerance` | low / medium / high | medium |
| `geographic_focus` | Country codes to focus on | ["US"] |
| `exclude_keywords` | Keywords to filter out | [] |

### Analysis Criteria

The analysis criteria (`userCriteria` in `analyzeDeal`) are drawn from user `preferences`:

| Field | Description |
|-------|-------------|
| `min_market_size` | Minimum market size for a viable deal |
| `max_competition_level` | Maximum acceptable competition level |
| `max_profitability_timeline_months` | Maximum months to break even |
| `min_profit_margin` | Minimum acceptable profit margin % |
| `required_initial_investment` | Available capital for the deal |
| `risk_tolerance` | User's risk appetite |

---

## Known Limitations

| Limitation | Impact | Workaround |
|-----------|--------|-----------|
| AI analysis may produce outdated market data | Medium | Re-run analysis for deals older than 30 days |
| `scrapeDealPlatforms` limited to public listing data | Medium | Add private deal details manually |
| LLM analysis can take up to 30 seconds | Low | Progress indicator shown; results are cached |
| No real-time notifications (polling only) | Low | Manual refresh or set reminders |
| Economic scenarios add significant latency | Low | Optional — disable if speed is priority |
| Pipeline automation rules are global (not per-user) | Medium | Track with GitHub issue; per-user rules planned |
| Deal comparison limited to 5 deals at once | Low | Run in batches |

---

*Related: [Data Model](../architecture/DATA_MODEL.md) · [API Documentation](../API.md) · [Error Handling](../api/ERROR_HANDLING.md)*
