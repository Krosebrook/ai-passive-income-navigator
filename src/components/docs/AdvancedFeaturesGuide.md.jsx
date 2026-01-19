# Advanced Features Guide

## Overview
FlashFusion includes advanced features for power users who want granular control over deal matching, portfolio management, and system integrations.

---

## Advanced Preferences Wizard

### Purpose
The Advanced Preferences Wizard allows users to set detailed criteria beyond basic onboarding, ensuring highly personalized deal matching and portfolio tracking.

### Features

#### 1. Deal Criteria Configuration
- **Growth Stages**: Filter deals by maturity (idea, MVP, early traction, growth, mature)
- **Financial Metrics**: 
  - Revenue range ($0K - $1000K+)
  - Minimum profit margin (0-100%)
  - Minimum customer base
- **Deal Freshness**: Show deals posted within 1-90 days
- **Verification**: Require verified financial data

**Why it matters**: Precise criteria reduce noise and surface only relevant opportunities.

#### 2. Portfolio Goals
- **Risk Profile**: Conservative, Moderate, or Aggressive
- **Asset Allocation**: Distribute across Digital, Physical, IP, Equity, Debt (must total 100%)
- **Diversification Rules**:
  - Maximum single position (5-50%)
  - Minimum number of positions (3-20)
- **Financial Goals**:
  - Target annual return (5-50%)
  - Time horizon (1-20 years)
- **Rebalancing**: Monthly, Quarterly, Semi-annual, or Annual

**Why it matters**: Clear goals enable performance tracking and prevent emotional decision-making.

#### 3. Integration Preferences
- **Available Integrations**:
  - Google Calendar (milestone sync)
  - Stripe (revenue tracking)
  - Airtable (deal export)
  - Zapier (workflow automation)
- **Notification Settings**: Control alerts for deals, updates, reminders, insights

**Why it matters**: Automation saves time and ensures you never miss critical updates.

### Accessing the Wizard
1. Navigate to Profile Settings
2. Click "Configure Advanced Settings" in the Advanced Preferences card
3. Complete the 3-step wizard

---

## Enhanced Onboarding System

### Quick Start vs Comprehensive Setup

#### Quick Start (2 minutes)
**Best for**: Users who want to start immediately
**Includes**:
- Primary goal selection
- Timeline preferences
- Available capital range

**Path**: 3 questions → Instant AI recommendations

#### Comprehensive Setup (5 minutes)
**Best for**: Users who want maximum personalization
**Includes**:
- All Quick Start questions
- Risk tolerance assessment
- Industry preferences (multi-select)
- Advanced filtering options

**Path**: 5 detailed steps → Highly tailored matching

### Progressive Disclosure
The system uses progressive disclosure to avoid overwhelming new users:
- Core questions first
- Advanced options revealed contextually
- "Why this matters" tooltips on every step
- Option to defer advanced setup for later

### Implementation Details
```jsx
// Trigger onboarding
<EnhancedOnboardingFlow 
  open={showOnboarding} 
  onClose={() => setShowOnboarding(false)}
/>
```

---

## AI Deal Generation

### How It Works
1. User clicks "Generate New Deals" in AI Coach tab
2. System analyzes user preferences, portfolio goals, and past behavior
3. LLM generates 5 personalized opportunities with:
   - Title and industry
   - Summary and detailed description
   - Estimated value and ROI
   - Time to ROI
   - Risk score (1-10)
   - Match score (0-100%)
   - Key opportunities (3 bullet points)
   - Key risks (2-3 bullet points)

### Deal Scoring
- **Match Score**: How well the deal aligns with user preferences
- **Risk Score**: Assessed difficulty and uncertainty (1=low, 10=high)
- **ROI Estimate**: Projected annual return percentage

### Actions
- **Save to Pipeline**: Adds deal to your deal pipeline for tracking
- **Dismiss**: Removes deal from view (tracked for preference learning)

### Best Practices
- Generate new deals weekly to stay current
- Review dismissed deals to improve AI matching
- Track saved deals through pipeline stages

---

## Portfolio Performance Analytics

### Available Charts

#### 1. Portfolio Growth
- Line chart showing portfolio value over time
- Comparison vs target trajectory
- 12-month historical view

#### 2. Asset Allocation
- Pie chart of current distribution
- Compare against target allocation
- Identify rebalancing needs

#### 3. Risk Distribution
- Bar chart showing Low/Medium/High risk breakdown
- Ensure diversification across risk levels

#### 4. Scenario Simulator
**Interactive tool** to model different outcomes:
- Adjust annual return (5-50%)
- Set time horizon (1-20 years)
- Compare conservative, moderate, aggressive strategies
- Visualize projected growth

### Key Metrics
- **Portfolio Value**: Total estimated value
- **YTD Return**: Year-to-date performance
- **Active Positions**: Number of current deals
- **Current vs Target**: Performance against goals

### Usage Tips
- Review analytics monthly
- Use scenario simulator before major allocations
- Adjust allocation when drift exceeds 5%
- Rebalance according to your preference schedule

---

## Proactive Guidance System

### Context-Aware Tooltips
Hover over any `(?)` icon to see:
- **What it is**: Feature description
- **How to use it**: Quick instructions
- **Why it matters**: Business value explanation

### Behavior-Triggered Tips
The system monitors user behavior and shows contextual guidance:

#### Trigger Conditions
1. **Deal Criteria Revisit**: User visits settings 3+ times without setting advanced preferences
2. **Portfolio Incomplete**: User has portfolio items but no goals set
3. **AI Deals Unused**: Active for 3+ days but never generated AI deals
4. **Integration Available**: 3+ portfolio items but no integrations enabled
5. **Analytics Explore**: 5+ deals in pipeline but never viewed analytics
6. **Frequent Bouncer**: 10+ page visits without completing onboarding

#### Tip Behavior
- Shows max 3 times per tip
- Dismissible (won't show again)
- Actionable (click to navigate/trigger action)
- Delayed 2s after trigger to avoid distraction

### Customization
Tips are tracked per user in the `GuidanceTip` entity:
- `tip_id`: Unique identifier
- `shown_count`: How many times displayed
- `dismissed_at`: When user dismissed it
- `interacted`: Whether user took the action

---

## Best Practices Summary

### For New Users
1. Complete onboarding (choose Quick or Comprehensive)
2. Generate first AI deals
3. Save 2-3 deals to pipeline
4. Set basic portfolio goals

### For Active Users
1. Review analytics monthly
2. Regenerate AI deals weekly
3. Update preferences as goals evolve
4. Enable integrations for automation

### For Power Users
1. Use Advanced Preferences Wizard
2. Fine-tune deal criteria regularly
3. Monitor portfolio allocation vs targets
4. Leverage scenario simulator for planning
5. Connect all relevant integrations

---

## Troubleshooting

### AI Deals Not Relevant?
- Update your preferences in Profile Settings
- Use Advanced Preferences Wizard for more granular control
- Dismiss irrelevant deals to train the AI

### Portfolio Not Tracking Correctly?
- Ensure target allocation totals 100%
- Set realistic return targets
- Update deal values as they change

### Too Many Notifications?
- Adjust notification preferences in Integration step
- Reduce rebalancing frequency
- Disable specific alert types

---

## Future Enhancements
- Machine learning-based preference inference
- Collaborative filtering (learn from similar users)
- Automated rebalancing suggestions
- Integration with more external platforms