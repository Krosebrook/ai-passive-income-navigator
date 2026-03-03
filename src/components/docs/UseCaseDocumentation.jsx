# FlashFusion — Use Case Documentation
### Inner, Outer & End User Stakeholder Framework

> **Version:** 1.0 | **Date:** March 2026 | **Platform:** FlashFusion AI Investment Intelligence Platform

---

## Overview

This document outlines the complete stakeholder use case map for FlashFusion across three user tiers:

| Tier | Definition | Who They Are |
|------|------------|--------------|
| **Inner Users** | Internal operators & builders who configure, manage, and extend the platform | Admins, developers, data engineers, product teams |
| **Outer Users** | Intermediaries or power users who leverage the platform to serve others | Financial advisors, fund managers, coaches, community leaders |
| **End Users** | The ultimate consumers of the platform's value | Retail investors, passive income seekers, entrepreneurs |

---

## 1. INNER USER USE CASES
*"The Builders & Operators"*

Inner users are those who administer, configure, and scale the FlashFusion platform. They interact primarily through the Admin panel, backend functions, automation rules, and data management tools.

---

### 1.1 Platform Administration

**Actor:** App Admin / Platform Owner

| Use Case | Description | Key Feature Used |
|----------|-------------|-----------------|
| **User Lifecycle Management** | Invite new users, assign roles (admin/user), manage access levels | Admin Panel → User Management, `base44.users.inviteUser` |
| **Content & Deal Moderation** | Review AI-generated deals for quality, flag or remove irrelevant sourced opportunities | Admin → SourcedDealOpportunity management |
| **Gamification Configuration** | Define badges, set point thresholds, configure achievement criteria to drive engagement | Badge entity, GamificationEvent, `awardPoints` function |
| **Onboarding Flow Customization** | Tune AI onboarding prompts, update guidance tips, set activation nudges | GuidanceTip entity, OnboardingNudge entity, AIOnboardingFlow |
| **Market Data Pipeline Management** | Schedule and monitor automated market snapshots, ensure data freshness | MarketDataSnapshot entity, Scheduled Automations |
| **Error Monitoring & Audit** | Review ErrorLog entries, track failed function calls, monitor system health | ErrorLog entity, `recordError` function |

---

### 1.2 Data & AI Configuration

**Actor:** Developer / Data Engineer

| Use Case | Description | Key Feature Used |
|----------|-------------|-----------------|
| **Prompt Engineering** | Refine AI prompts for deal screening, financial forecasting, onboarding plans | `screenAndRankDeals.js`, `forecastPortfolioPerformance.js`, `generatePersonalizedOnboarding.js` |
| **Automation Rules** | Configure entity-triggered automations (e.g., auto-email on new deal, backup on data create) | Entity Automations, `create_automation` |
| **Scheduled Intelligence Jobs** | Run market data refreshes, proactive deal sourcing, rebalancing checks on a schedule | Scheduled Automations, `proactivelySourceDeals`, `fetchRealTimeMarketData` |
| **Backup & Restore Operations** | Initiate full platform backups, restore from snapshot for disaster recovery | `automatedBackup.js`, `restoreBackup.js`, BackupManager UI |
| **API Secret Management** | Rotate and manage third-party API keys (Perplexity, OpenAI, Firecrawl, Anthropic) | Secrets management, Deno environment variables |
| **Custom Deal Pipeline Stages** | Create, reorder, and configure Kanban pipeline stages for deal tracking | DealStage entity, StageManager component |

---

### 1.3 Analytics & Business Intelligence

**Actor:** Product Manager / Business Analyst

| Use Case | Description | Key Feature Used |
|----------|-------------|-----------------|
| **Platform Engagement Analytics** | Track DAU/MAU, feature adoption rates, conversion funnel performance | Analytics page, `generatePredictiveInsights` |
| **Deal Sourcing Quality Metrics** | Measure AI deal match scores over time, track user acceptance vs. dismissal rates | AIDealsUserFeedback entity, `learnFromUserFeedback` |
| **Lifecycle State Analysis** | Monitor user distribution across activation, retention, and power user states | LifecycleState, ActivationState, RetentionState, PowerUserState entities |
| **Gamification Effectiveness** | Analyze badge earn rates, point accumulation, and correlation with retention | GamificationEvent, UserAchievement entities |
| **Onboarding Funnel Optimization** | Identify drop-off points in the AI onboarding wizard, A/B different flows | OnboardingProgress, OnboardingState entities |
| **Revenue & Subscription Tracking** | Monitor active subscriptions, tier upgrades, churn | Subscription entity |

---

## 2. OUTER USER USE CASES
*"The Power Users & Intermediaries"*

Outer users leverage FlashFusion's intelligence layer to serve a client base, run communities, or offer advisory services. They operate with elevated access and use the platform's AI tools as a professional tool.

---

### 2.1 Independent Financial Advisor / Wealth Coach

**Actor:** Certified Financial Planner, Investment Coach, Wealth Advisor

| Use Case | Description | Key Feature Used |
|----------|-------------|-----------------|
| **Client Portfolio Forecasting** | Run AI-powered financial forecasts for client portfolios across bear/base/bull scenarios | `forecastPortfolioPerformance`, FinancialForecastPanel |
| **Deal Screening for Clients** | Screen and rank investment opportunities against specific client risk/return criteria | `screenAndRankDeals`, DealScreener component |
| **Due Diligence Reports** | Generate automated AI due diligence reports on specific deals to present to clients | `generateDueDiligenceReport`, DueDiligenceAssistant |
| **Risk Assessment Briefings** | Produce structured risk analyses for client portfolios including mitigation strategies | `generateRiskAssessment`, EnhancedAIAdvisor |
| **Investment Strategy Documents** | Generate AI-personalized investment strategy recommendations aligned to client goals | `generateInvestmentStrategy`, InvestmentStrategy entity |
| **Market Intelligence Briefings** | Share real-time market sentiment, sector analysis, and trend summaries with clients | MarketIntelligencePanel, EnhancedMarketIntelligence |
| **Expert Content Publishing** | Publish market commentary, deal reviews, and educational articles for community members | ExpertContent entity, ExpertContentHub |

---

### 2.2 Investment Group / Fund Manager

**Actor:** Angel investor syndicate lead, investment club founder, micro-VC

| Use Case | Description | Key Feature Used |
|----------|-------------|-----------------|
| **Co-Investment Group Management** | Create and manage investment groups, pool capital tracking, manage member roles | InvestmentGroup entity, InvestmentGroupsHub |
| **Deal Pipeline Collaboration** | Share deals across team members in a shared Kanban pipeline with stage tracking | DealPipeline entity, KanbanBoard, DealDetailsModal |
| **Automated Deal Sourcing** | Configure criteria and let AI continuously source relevant deals for the fund's thesis | DealSourcingCriteria entity, `proactivelySourceDeals` |
| **Shared Watchlist Publishing** | Create and share curated watchlists of deals with subscribers in the community | SharedWatchlist entity, SharedWatchlistManager |
| **Pipeline Automation Rules** | Set trigger-based workflow automations (e.g., auto-assign tasks when deal enters stage) | PipelineAutomationRule entity, WorkflowBuilder |
| **Deal Nurturing Workflows** | Define multi-step nurturing sequences for deals in early negotiation stages | DealNurturingWorkflow entity |
| **Performance Reporting** | Generate structured performance reports for LPs or stakeholders | `generatePerformanceReport`, PerformanceReport entity |

---

### 2.3 Community Leader / Mentor

**Actor:** Investment educator, online community manager, financial mentor

| Use Case | Description | Key Feature Used |
|----------|-------------|-----------------|
| **Mentorship Session Management** | Schedule, track, and document 1:1 or group mentorship sessions | Mentor, MentorshipSession entities, MentorMarketplace |
| **Success Story Curation** | Collect and publish community success stories to inspire and attract new members | SuccessStory entity, SuccessStoriesBrowser |
| **Community Forum Moderation** | Manage Q&A forum posts, highlight best answers, drive engagement | ForumPost, ForumAnswer entities, Forum page |
| **Resource Library Management** | Curate and publish educational resources, guides, and templates | Resource entity, Learn page |
| **Member Onboarding Guidance** | Design personalized learning paths and contextual nudges for new community members | PersonalizedRoadmap entity, GuidanceTip entity |
| **Leaderboard & Engagement** | Manage community leaderboards, award points for contributions | `getLeaderboard`, `awardPoints`, Leaderboard component |

---

## 3. END USER USE CASES
*"The Investors & Passive Income Seekers"*

End users are retail investors, entrepreneurs, and passive income seekers who use FlashFusion to discover, analyze, and act on investment opportunities aligned with their financial goals.

---

### 3.1 Passive Income Seeker (Core Persona)

**Actor:** Individual looking to replace or supplement employment income

| Use Case | Description | Key Feature Used |
|----------|-------------|-----------------|
| **AI-Guided Onboarding** | Complete a personalized onboarding wizard that builds an investment profile and learning path | AIOnboardingFlow, `generatePersonalizedOnboarding` |
| **Discover Aligned Deals** | Browse AI-sourced deals filtered by personal risk tolerance, industry, and investment size | NewDealsFeed, AutoDiscoveredDeals, DealScreener |
| **Screen & Rank Opportunities** | Run custom deal screening against personal criteria to surface best-fit opportunities | DealScreener, `screenAndRankDeals` |
| **Save & Track Deals** | Add promising deals to a personal pipeline, move through stages, track progress | DealPipeline page, KanbanBoard, DealCard |
| **Portfolio Financial Tracking** | Log revenue, expenses, and ROI for active income streams over time | FinancialEntry, PerformanceCharts |
| **AI Financial Forecasting** | Generate bear/base/bull portfolio growth forecasts with actionable optimization advice | FinancialForecastPanel, `forecastPortfolioPerformance` |
| **Portfolio Rebalancing** | Receive AI recommendations for rebalancing across income streams for optimal allocation | PredictiveRebalancingPanel, `generatePredictiveRebalancing` |
| **Track Financial Goals** | Set income targets (e.g., $5K/month passive) and track progress against milestones | FinancialGoal entity, `trackFinancialGoals` |
| **Earn Achievements** | Unlock badges and points for completing milestones (first deal saved, first investment, etc.) | GamifiedOnboarding, BadgeDisplay, `checkAndAwardBadges` |

---

### 3.2 Active Deal Scout

**Actor:** Investor actively seeking specific deal types (equity, revenue share, licensing)

| Use Case | Description | Key Feature Used |
|----------|-------------|-----------------|
| **Custom Deal Screening** | Define screening criteria (industry, deal structure, min/max investment, risk) and run AI screen | DealScreener, `screenAndRankDeals` |
| **AI Deal Due Diligence** | Trigger deep AI analysis on a specific deal (red flags, actionable steps, viability summary) | `performDealDueDiligence`, DueDiligenceAssistant |
| **Deal Structure Comparison** | Compare multiple deal structure variations (equity vs. revenue share) for the same opportunity | `generateDealStructureVariations`, DealStructureComparison |
| **Deal Performance Correlation** | Analyze how news sentiment correlates with performance of deals in watchlist | `correlateNewsWithPerformance`, DealPerformanceCorrelation |
| **Market Alert Setup** | Configure alerts for specific industries or metrics that trigger notifications | MarketAlert entity, MarketAlertManager |
| **Emerging Opportunity Detection** | Monitor AI-detected nascent trends before they become mainstream | EmergingOpportunitiesPanel, `detectEmergingTrends` |
| **Pipeline Task Management** | Create tasks and reminders tied to specific deals (e.g., "Follow up with founder on 3/15") | DealTask, DealReminder entities, TaskManager |

---

### 3.3 Portfolio Investor

**Actor:** Individual with an existing multi-asset portfolio seeking optimization

| Use Case | Description | Key Feature Used |
|----------|-------------|-----------------|
| **Portfolio Analytics Dashboard** | View total invested, current value, ROI, IRR, and industry breakdown in one view | PortfolioAnalyticsDashboard, `calculatePortfolioMetrics` |
| **Scenario Planning** | Simulate market multiplier scenarios (0.5x–2x) to stress-test portfolio value | PortfolioAnalyticsDashboard (Scenario slider) |
| **AI Forecasting with Goals** | Input a target portfolio value and receive AI projections with gap analysis | FinancialForecastPanel, `forecastPortfolioPerformance` |
| **Risk Factor Analysis** | Get an AI-generated breakdown of portfolio risk factors with severity and mitigation | FinancialForecastPanel → Risk Factors section |
| **Investment Alerts** | Receive proactive alerts for market risks, portfolio imbalances, rebalancing needs | InvestmentAlert entity, `detectMarketRisks` |
| **External Account Connection** | Link brokerage/bank accounts for unified portfolio view | ExternalAccount entity, ExternalAccountsManager |
| **What-If Scenarios** | Model hypothetical portfolio changes ("What if I add $10K to tech?") | `generateWhatIfScenario`, EnhancedAIAdvisor |

---

### 3.4 Community Participant

**Actor:** Investor seeking peer learning, collaboration, and validation

| Use Case | Description | Key Feature Used |
|----------|-------------|-----------------|
| **Join Investment Groups** | Discover and join investment clubs aligned to personal focus areas | InvestmentGroup entity, Community page |
| **Follow Expert Watchlists** | Subscribe to curated watchlists from verified community experts | SharedWatchlist entity, SharedWatchlistManager |
| **Read Expert Analysis** | Access in-depth market commentary and deal reviews from verified experts | ExpertContent entity, ExpertContentHub |
| **Ask & Answer in Forum** | Post questions about investment strategies, deals, or market conditions | ForumPost, ForumAnswer entities, Forum page |
| **Rate & Review Content** | Rate expert articles and watchlists to surface best community content | ContentRating entity |
| **Collaboration on Deals** | Tag collaborators on pipeline deals, co-analyze opportunities | CollaborationSuggestions, CommentSection |
| **Leaderboard & Social Proof** | Compete on gamification leaderboard, earn visibility through activity | Leaderboard, PointsDisplay, BadgeDisplay |

---

## 4. CROSS-CUTTING USE CASES

These use cases span multiple user tiers and represent the platform's key AI-driven value loops.

| Use Case | Inner | Outer | End User |
|----------|-------|-------|----------|
| **AI Deal Sourcing Loop** | Configure criteria & automations | Source deals for clients | Discover aligned opportunities |
| **Financial Forecasting** | Monitor accuracy & prompt quality | Present forecasts to clients | Plan personal financial future |
| **Onboarding Personalization** | Tune AI prompts & nudges | Guide new community members | Complete personalized setup |
| **Market Intelligence** | Schedule data refreshes | Brief clients on market state | Stay informed on relevant trends |
| **Gamification Loop** | Configure badges & point rules | Run leaderboards for community | Earn rewards for milestones |
| **Deal Pipeline** | Monitor system performance | Manage client deal flow | Track personal investment journey |

---

## 5. KEY TECHNICAL INTEGRATIONS BY USE CASE

| Use Case Category | AI Provider | Backend Function |
|-------------------|-------------|-----------------|
| Deal Screening & Ranking | Perplexity AI (sonar-pro) | `screenAndRankDeals.js` |
| Financial Forecasting | Perplexity AI (sonar-pro) | `forecastPortfolioPerformance.js` |
| Market Intelligence | Perplexity AI + Firecrawl | `analyzeMarketTrendsEnhanced.js`, `fetchRealTimeMarketData.js` |
| Deal Due Diligence | Anthropic (Claude) / OpenAI | `performDealDueDiligence.js`, `generateDueDiligenceReport.js` |
| Onboarding Plans | Perplexity AI | `generatePersonalizedOnboarding.js` |
| Risk Assessment | OpenAI / Perplexity | `generateRiskAssessment.js`, `detectPortfolioRisks.js` |
| Content Generation | OpenAI | `generateContent.js`, `generateMarketingContent.js` |
| Trend Detection | Perplexity + Firecrawl | `detectEmergingTrends.js`, `forecastIndustryDemand.js` |
| Deal Sourcing | Firecrawl + Perplexity | `proactivelySourceDeals.js`, `searchDealPlatforms.js` |

---

## 6. MARKET CONTEXT

Based on industry research (2025):

- AI investment in fintech is projected to hit **$53.3B by 2030** (ETNA, 2025)
- **6 in 10 investment firms** now use AI for deeper customer analysis (Grant Thornton, 2025)
- AI agents in financial services growing from **$691M (2025) → $6.7B (2033)** at 31.5% CAGR (MindStudio)
- Wealth management leaders are deploying AI for: account monitoring, life-event triggers, personalized outreach, and autonomous rebalancing (EY GenAI Survey, 2025)
- **FlashFusion** addresses the underserved retail investor & passive income seeker segment — democratizing tools previously only available at institutional scale

---

*Document auto-generated from platform architecture analysis. Keep updated as new features ship.*