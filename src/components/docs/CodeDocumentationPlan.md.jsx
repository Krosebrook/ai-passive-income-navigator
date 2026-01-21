# FlashFusion Codebase Documentation Plan

**Generated:** January 21, 2026  
**Status:** Planning Phase  
**Goal:** Complete documentation of all pages, components, entities, functions, and configuration files

---

## Documentation Structure

```
components/docs/
├── CodeDocumentationPlan.md (this file)
├── templates/
│   ├── PageTemplate.md
│   ├── ComponentTemplate.md
│   ├── FunctionTemplate.md
│   ├── EntityTemplate.md
│   └── AgentTemplate.md
├── pages/
│   ├── Home.md
│   ├── Dashboard.md
│   ├── Portfolio.md
│   └── [...]
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── deals/
│   └── [...]
├── functions/
│   ├── generateInvestmentStrategy.md
│   └── [...]
└── entities/
    ├── SourcedDealOpportunity.md
    └── [...]
```

---

## Documentation Templates

### 1. Page Template
```markdown
# [Page Name]

**Path:** `pages/[PageName].js`  
**Route:** `/page-name`  
**Access Level:** Public / Authenticated / Admin

## Purpose
[What problem does this page solve? What feature does it provide?]

## User Journey
1. User navigates to...
2. User sees...
3. User can...

## Key Components
- `ComponentName` - [purpose]
- `AnotherComponent` - [purpose]

## Data Dependencies
- **Entities:** [list entities used]
- **Functions:** [list backend functions called]
- **Integrations:** [list external APIs]

## State Management
- [Key state variables and their purpose]

## User Actions
- [List of actions users can perform]

## Related Pages
- [Links to related pages]
```

### 2. Component Template
```markdown
# [Component Name]

**Path:** `components/[category]/[ComponentName].jsx`  
**Type:** UI Component / Business Logic / HOC / Hook

## Purpose
[One-sentence description of what this component does]

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| propName | string | Yes | - | Description |

## Internal State
- `stateName`: [purpose and when it updates]

## Dependencies
- **Components:** [list]
- **Hooks:** [list]
- **Utilities:** [list]

## Usage Example
\`\`\`jsx
import ComponentName from '@/components/category/ComponentName';

<ComponentName 
  propName="value"
  onAction={handleAction}
/>
\`\`\`

## Visual Behavior
[Describe how it looks and behaves for UI components]

## Business Logic
[Describe key logic for non-UI components]
```

### 3. Function Template
```markdown
# [Function Name]

**Path:** `functions/[functionName].js`  
**Endpoint:** `base44.functions.invoke('functionName', payload)`  
**Platform:** Deno Deploy

## Purpose
[What backend task does this function perform?]

## Authentication
- **Required:** Yes / No
- **Role:** Any / Admin only
- **Validation:** [How user authentication is checked]

## Request Payload
\`\`\`typescript
{
  param1: string;      // Description
  param2?: number;     // Optional description
}
\`\`\`

## Response
\`\`\`typescript
{
  success: boolean;
  data: {
    result: string;
  };
  error?: string;
}
\`\`\`

## Side Effects
- **Database:** [Entities created/updated/deleted]
- **External APIs:** [Which APIs are called]
- **Notifications:** [Emails/alerts sent]

## Error Handling
- [List possible error scenarios]

## Dependencies
- **Entities:** [list]
- **Integrations:** [list]
- **External APIs:** [list]

## Example Usage
\`\`\`javascript
const response = await base44.functions.invoke('functionName', {
  param1: 'value'
});
\`\`\`
```

### 4. Entity Template
```markdown
# [Entity Name]

**Path:** `entities/[EntityName].json`  
**Collection:** [EntityName]

## Purpose
[What real-world concept does this entity represent?]

## Schema

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| fieldName | string | Yes | - | Description |

## Built-in Fields
All entities automatically include:
- `id`: Unique identifier
- `created_date`: Timestamp of creation
- `updated_date`: Timestamp of last update
- `created_by`: Email of user who created the record

## Relationships
- **References:** [Other entities this references]
- **Referenced By:** [Other entities that reference this]

## Usage Patterns
- [Common query patterns]
- [Typical use cases]

## Security Rules
- [Who can read/write this entity]

## Example Record
\`\`\`json
{
  "id": "abc123",
  "fieldName": "value",
  "created_date": "2026-01-21T10:00:00Z"
}
\`\`\`
```

---

## Documentation Priority (Phase 1-5)

### Phase 1: Core Infrastructure ✅ (Priority: Critical)
- [ ] `Layout.js` - Application shell
- [ ] `pages/Home.js` - Landing page
- [ ] `pages/Dashboard.js` - Main dashboard
- [ ] Core entities (User, OnboardingState, UserPreferences)

### Phase 2: Pages (Priority: High)
- [ ] `pages/Portfolio.js`
- [ ] `pages/AICoach.js`
- [ ] `pages/DealPipeline.js`
- [ ] `pages/UserPreferences.js`
- [ ] `pages/Community.js`
- [ ] `pages/ProfileSettings.js`
- [ ] `pages/Admin.js`
- [ ] `pages/Trends.js`
- [ ] `pages/IdeaDetail.js`
- [ ] `pages/Analytics.js`
- [ ] `pages/DataManagement.js`
- [ ] `pages/Landing.js`
- [ ] `pages/Bookmarks.js`
- [ ] `pages/Collaborate.js`
- [ ] `pages/DealDiscovery.js`
- [ ] `pages/Documentation.js`
- [ ] `pages/Forum.js`
- [ ] `pages/ForumPost.js`
- [ ] `pages/Integrations.js`
- [ ] `pages/Learn.js`

### Phase 3: Critical Components (Priority: High)

#### Dashboard Components
- [ ] `components/dashboard/DealPerformanceMetrics.jsx`
- [ ] `components/dashboard/MarketPerformanceWidget.jsx`
- [ ] `components/dashboard/AIInsightsSummary.jsx`
- [ ] `components/dashboard/CustomizableWidgets.jsx`
- [ ] `components/dashboard/RecommendedIdeas.jsx`

#### Onboarding Components
- [ ] `components/onboarding/LowFrictionOnboarding.jsx`
- [ ] `components/onboarding/OutcomeSelector.jsx`
- [ ] `components/onboarding/QuickProfileStep.jsx`
- [ ] `components/onboarding/ValueExposureCard.jsx`
- [ ] `components/onboarding/PersonalizedNudgeSystem.jsx`
- [ ] `components/onboarding/DeferredSetupManager.jsx`
- [ ] `components/onboarding/ContextualGuidance.jsx`
- [ ] `components/onboarding/interactive-steps/` (all steps)
- [ ] `components/onboarding/steps/` (all steps)

#### Deal Components
- [ ] `components/deals/AIGeneratedDeals.jsx`
- [ ] `components/deals/NewDealsFeed.jsx`
- [ ] `components/deals/SourcedOpportunitiesPanel.jsx`
- [ ] `components/deals/DealFeedbackModal.jsx`
- [ ] `components/deals/DealInsightsPanel.jsx`
- [ ] `components/deals/AIDealsAdvisor.jsx`
- [ ] `components/deals/DealAnalyzer.jsx`
- [ ] `components/deals/DealComparisonTool.jsx`
- [ ] `components/deals/AIFinancialAnalysis.jsx`

#### Pipeline Components
- [ ] `components/pipeline/KanbanBoard.jsx`
- [ ] `components/pipeline/DealDetailsModal.jsx`
- [ ] `components/pipeline/WorkflowBuilder.jsx`
- [ ] `components/pipeline/TaskManager.jsx`
- [ ] `components/pipeline/AnalyticsDashboard.jsx`
- [ ] `components/pipeline/DealCard.jsx`
- [ ] `components/pipeline/AddDealModal.jsx`
- [ ] `components/pipeline/StageManager.jsx`
- [ ] `components/pipeline/AutomationRulesManager.jsx`

### Phase 4: Feature Components (Priority: Medium)

#### AI Components
- [ ] `components/ai/AIInvestmentAdvisor.jsx`
- [ ] `components/ai/AIInvestmentCoach.jsx`
- [ ] `components/ai/AIAssistantChat.jsx`
- [ ] `components/ai/AIGuideChat.jsx`

#### Market Components
- [ ] `components/market/MarketDataFeed.jsx`
- [ ] `components/market/MarketAlertManager.jsx`
- [ ] `components/market/DealMarketAnalysis.jsx`

#### Portfolio Components
- [ ] `components/portfolio/PortfolioCard.jsx`
- [ ] `components/portfolio/PortfolioAnalyticsDashboard.jsx`
- [ ] `components/portfolio/RebalancingSuggestions.jsx`
- [ ] `components/portfolio/PerformanceTracker.jsx`
- [ ] `components/portfolio/TaskManager.jsx`

#### Ideas Components
- [ ] `components/ideas/IdeaCard.jsx`
- [ ] `components/ideas/IdeaGeneratorModal.jsx`
- [ ] `components/ideas/CategoryFilter.jsx`
- [ ] `components/ideas/SearchBar.jsx`
- [ ] `components/ideas/IdeaValidator.jsx`

#### Community Components
- [ ] `components/community/SuccessStoriesBrowser.jsx`
- [ ] `components/community/StorySubmissionForm.jsx`
- [ ] `components/community/CommunityInsights.jsx`

#### Forum Components
- [ ] `components/forum/ForumPostModal.jsx`
- [ ] `components/forum/ForumAnswer.jsx`

#### Collaboration Components
- [ ] `components/collaboration/CommentSection.jsx`
- [ ] `components/collaboration/InvestmentGroups.jsx`
- [ ] `components/collaboration/SharedWatchlists.jsx`
- [ ] `components/collaboration/CollaborationSuggestions.jsx`

#### Analytics Components
- [ ] `components/analytics/UserEngagementMetrics.jsx`
- [ ] `components/analytics/ConversionRateChart.jsx`
- [ ] `components/analytics/PortfolioPerformanceCharts.jsx`
- [ ] `components/analytics/DealSourcingChart.jsx`
- [ ] `components/analytics/AnalyticsFilters.jsx`
- [ ] `components/analytics/IntegrationPerformance.jsx`

#### Finance Components
- [ ] `components/finance/FinancialDashboard.jsx`
- [ ] `components/finance/FinancialEntry.jsx`
- [ ] `components/finance/PerformanceCharts.jsx`
- [ ] `components/finance/ExpenseTracker.jsx`
- [ ] `components/finance/RevenueForecast.jsx`
- [ ] `components/finance/TaxEstimator.jsx`
- [ ] `components/finance/ROICalculator.jsx`

#### Enrichment Components
- [ ] `components/enrichment/EnrichmentModal.jsx`
- [ ] `components/enrichment/ViabilityScore.jsx`

#### Trends Components
- [ ] `components/trends/TrendCard.jsx`
- [ ] `components/trends/TrendAnalysisPanel.jsx`
- [ ] `components/trends/TrendVisualization.jsx`
- [ ] `components/trends/EmergingNiches.jsx`
- [ ] `components/trends/AlertSetupModal.jsx`

### Phase 5: Supporting Components (Priority: Low)

#### UI Components
- [ ] `components/ui/button.jsx`
- [ ] `components/ui/card.jsx`
- [ ] `components/ui/input.jsx`
- [ ] `components/ui/dialog.jsx`
- [ ] `components/ui/tabs.jsx`
- [ ] `components/ui/select.jsx`
- [ ] `components/ui/badge.jsx`
- [ ] `components/ui/progress.jsx`
- [ ] `components/ui/slider.jsx`
- [ ] `components/ui/switch.jsx`
- [ ] `components/ui/label.jsx`
- [ ] `components/ui/textarea.jsx`
- [ ] `components/ui/calendar.jsx`
- [ ] `components/ui/popover.jsx`
- [ ] `components/ui/PageHeader.jsx`
- [ ] `components/ui/LoadingSpinner.jsx`
- [ ] `components/ui/ParallaxBackground.jsx`
- [ ] `components/ui/ScrollProgress.jsx`
- [ ] `components/ui/LiveActivityFeed.jsx`
- [ ] `components/ui/AnimatedCounter.jsx`
- [ ] `components/ui/ROICalculator.jsx`
- [ ] `components/ui/TestimonialCarousel.jsx`
- [ ] `components/ui/EmptyState.jsx`

#### Lifecycle Components
- [ ] `components/lifecycle/LifecycleAdaptiveUI.jsx`
- [ ] `components/activation/ActivationGuideWrapper.jsx`
- [ ] `components/activation/ActivationGuidanceCard.jsx`
- [ ] `components/activation/ActivationNudgeEngine.jsx`
- [ ] `components/activation/CommunityFirstActivation.jsx`
- [ ] `components/activation/DealFirstActivation.jsx`
- [ ] `components/activation/PortfolioFirstActivation.jsx`
- [ ] `components/retention/RetentionHubWrapper.jsx`
- [ ] `components/retention/HabitLoopCard.jsx`
- [ ] `components/retention/WeeklyDigestPreview.jsx`
- [ ] `components/poweruser/PowerUserHub.jsx`
- [ ] `components/poweruser/PowerUserUnlockNotification.jsx`
- [ ] `components/poweruser/PowerUserValueMetrics.jsx`
- [ ] `components/poweruser/MonetizationPrompt.jsx`

#### Guidance Components
- [ ] `components/guidance/ProactiveGuidanceSystem.jsx`
- [ ] `components/guidance/BehaviorTriggers.jsx`
- [ ] `components/guidance/ContextualTooltip.jsx`
- [ ] `components/guidance/hooks/useGuidanceTip.jsx`

#### Preferences Components
- [ ] `components/preferences/AdvancedPreferencesWizard.jsx`
- [ ] `components/preferences/steps/` (all steps)

#### Monetization Components
- [ ] `components/monetization/MonetizationModal.jsx`
- [ ] `components/monetization/MonetizationIntegrations.jsx`
- [ ] `components/monetization/PricingStrategyTool.jsx`
- [ ] `components/monetization/FinancialProjectionsTool.jsx`

#### Marketing Components
- [ ] `components/marketing/MarketingContentGenerator.jsx`

#### Content Components
- [ ] `components/content/ContentAssistant.jsx`
- [ ] `components/content/SEOContentModal.jsx`

#### Mentorship Components
- [ ] `components/mentorship/MentorMarketplace.jsx`

#### Predictions Components
- [ ] `components/predictions/FinancialPredictions.jsx`

#### Roadmap Components
- [ ] `components/roadmap/PersonalizedRoadmapModal.jsx`

#### Learn Components
- [ ] `components/learn/ResourceCard.jsx`
- [ ] `components/learn/ResourceModal.jsx`

#### Integrations Components
- [ ] `components/integrations/IntegrationManager.jsx`

#### Backup Components
- [ ] `components/backup/BackupStatus.jsx`

#### Export Components
- [ ] `components/export/ExportModal.jsx`

#### Paywall Components
- [ ] `components/paywall/TierGate.jsx`

#### PWA Components
- [ ] `components/pwa/PWAInstallPrompt.jsx`

#### SEO Components
- [ ] `components/seo/SEOHead.jsx`

#### Utils Components
- [ ] `components/utils/errorTracking.js`
- [ ] `components/utils/validation.js`

#### Data Components
- [ ] `components/data/ideasCatalog.js`

#### Other Components
- [ ] `components/ErrorBoundary.jsx`
- [ ] `components/UserNotRegisteredError.jsx`

### Phase 6: Backend Functions

#### AI Functions
- [ ] `functions/generateInvestmentStrategy.js`
- [ ] `functions/generateDealInsights.js`
- [ ] `functions/predictDealPerformance.js`
- [ ] `functions/suggestPortfolioAdjustments.js`
- [ ] `functions/performDealDueDiligence.js`
- [ ] `functions/generateAIDeals.js`
- [ ] `functions/aiSourceAndAnalyzeDeals.js`
- [ ] `functions/generateIdeas.js`
- [ ] `functions/validatePassiveIncomeIdea.js`
- [ ] `functions/analyzeIdeaViability.js`
- [ ] `functions/generatePersonalizedRoadmap.js`
- [ ] `functions/generateFinancialPrediction.js`
- [ ] `functions/generateFinancialProjections.js`
- [ ] `functions/generatePricingStrategy.js`
- [ ] `functions/generateRecommendations.js`
- [ ] `functions/generateOnboardingInsights.js`
- [ ] `functions/generateOnboardingNudges.js`
- [ ] `functions/generateNudges.js`
- [ ] `functions/personalizeOnboarding.js`

#### Market Functions
- [ ] `functions/fetchMarketData.js`
- [ ] `functions/analyzeMarketImpact.js`
- [ ] `functions/analyzeMarketTrends.js`
- [ ] `functions/detectMarketRisks.js`
- [ ] `functions/proactivelySourceDeals.js`

#### Deal Functions
- [ ] `functions/sourceDealOpportunities.js`
- [ ] `functions/sourceDealOpportunitiesExternal.js`
- [ ] `functions/searchDealPlatforms.js`
- [ ] `functions/analyzeDeal.js`
- [ ] `functions/categorizeDeal.js`
- [ ] `functions/compareDeals.js`
- [ ] `functions/generateDealReport.js`
- [ ] `functions/learnFromUserFeedback.js`
- [ ] `functions/suggestDealWorkflow.js`

#### Pipeline Functions
- [ ] `functions/calculatePipelineAnalytics.js`
- [ ] `functions/notifyDealUpdate.js`
- [ ] `functions/sendDealReminders.js`
- [ ] `functions/executePipelineAutomation.js`

#### Content Functions
- [ ] `functions/generateContent.js`
- [ ] `functions/generateMarketingContent.js`
- [ ] `functions/generateSEOContent.js`
- [ ] `functions/scrapeWebContent.js`

#### Analytics Functions
- [ ] `functions/analyzeFinancials.js`
- [ ] `functions/generatePerformanceReport.js`
- [ ] `functions/analyzeSuccessStories.js`

#### Lifecycle Functions
- [ ] `functions/evaluateLifecycleState.js`
- [ ] `functions/evaluateActivationProgress.js`
- [ ] `functions/evaluateRetentionProgress.js`
- [ ] `functions/evaluatePowerUserEligibility.js`
- [ ] `functions/determineActivationPath.js`
- [ ] `functions/detectChurnRisk.js`
- [ ] `functions/checkReEngagementTrigger.js`
- [ ] `functions/triggerLifecycleIntervention.js`
- [ ] `functions/triggerHabitLoop.js`
- [ ] `functions/generateWeeklyDigest.js`

#### Integration Functions
- [ ] `functions/integrateFinancialData.js`
- [ ] `functions/suggestCollaborators.js`

#### System Functions
- [ ] `functions/sendNotification.js`
- [ ] `functions/recordError.js`
- [ ] `functions/createUserBackup.js`
- [ ] `functions/exportUserData.js`
- [ ] `functions/registerServiceWorker.js`
- [ ] `functions/executeRebalancing.js`

#### Configuration Functions
- [ ] `functions/onboardingFlowConfig.js`
- [ ] `functions/activationFlowConfig.js`
- [ ] `functions/retentionFlowConfig.js`
- [ ] `functions/lifecycleFlowConfig.js`
- [ ] `functions/powerUserFlowConfig.js`

### Phase 7: Entities

#### Core Entities
- [ ] `entities/User.json`
- [ ] `entities/UserPreferences.json`
- [ ] `entities/OnboardingState.json`
- [ ] `entities/ActivationState.json`
- [ ] `entities/RetentionState.json`
- [ ] `entities/PowerUserState.json`
- [ ] `entities/LifecycleState.json`

#### Deal Entities
- [ ] `entities/SourcedDealOpportunity.json`
- [ ] `entities/DealPipeline.json`
- [ ] `entities/DealStage.json`
- [ ] `entities/DealTask.json`
- [ ] `entities/DealReminder.json`
- [ ] `entities/DealComment.json`
- [ ] `entities/DealAnalysis.json`
- [ ] `entities/DealSourcingCriteria.json`
- [ ] `entities/DealNurturingWorkflow.json`

#### Market Entities
- [ ] `entities/MarketAlert.json`
- [ ] `entities/MarketDataSnapshot.json`

#### Portfolio Entities
- [ ] `entities/PortfolioIdea.json`
- [ ] `entities/PortfolioTask.json`
- [ ] `entities/PortfolioAlert.json`
- [ ] `entities/IdeaEnrichment.json`

#### Investment Entities
- [ ] `entities/InvestmentStrategy.json`
- [ ] `entities/InvestmentAlert.json`
- [ ] `entities/InvestmentGroup.json`
- [ ] `entities/PortfolioAdjustmentSuggestion.json`

#### Community Entities
- [ ] `entities/ForumPost.json`
- [ ] `entities/ForumAnswer.json`
- [ ] `entities/PostRating.json`
- [ ] `entities/IdeaComment.json`
- [ ] `entities/SharedIdea.json`
- [ ] `entities/SharedWatchlist.json`
- [ ] `entities/SuccessStory.json`

#### Feedback Entities
- [ ] `entities/AIDealsUserFeedback.json`
- [ ] `entities/IdeaRating.json`
- [ ] `entities/GuidanceTip.json`

#### Performance Entities
- [ ] `entities/PerformanceMetric.json`
- [ ] `entities/FinancialData.json`
- [ ] `entities/TaxEstimate.json`
- [ ] `entities/FinancialPrediction.json`
- [ ] `entities/PerformanceReport.json`

#### Content Entities
- [ ] `entities/ContentGeneration.json`
- [ ] `entities/Resource.json`

#### Other Entities
- [ ] `entities/Bookmark.json`
- [ ] `entities/FollowedTrend.json`
- [ ] `entities/TrendAlert.json`
- [ ] `entities/PersonalizedRoadmap.json`
- [ ] `entities/Mentor.json`
- [ ] `entities/MentorshipSession.json`
- [ ] `entities/OnboardingProgress.json`
- [ ] `entities/OnboardingNudge.json`
- [ ] `entities/DashboardPreference.json`
- [ ] `entities/PipelineAutomationRule.json`
- [ ] `entities/IntegrationConfig.json`
- [ ] `entities/UserOnboardingProfile.json`
- [ ] `entities/Subscription.json`
- [ ] `entities/UserBackup.json`
- [ ] `entities/ErrorLog.json`

### Phase 8: Agents
- [ ] `agents/ai_assistant.json`
- [ ] `agents/ai_guide.json`

---

## Documentation Standards

### File Naming
- Use PascalCase for component docs: `DealPerformanceMetrics.md`
- Use camelCase for function docs: `generateInvestmentStrategy.md`
- Use PascalCase for entity docs: `SourcedDealOpportunity.md`

### Content Requirements
1. **Always include:** Purpose, dependencies, usage examples
2. **For UI components:** Include visual description and props
3. **For functions:** Include payload, response, and side effects
4. **For entities:** Include schema, relationships, and example records

### Code Examples
- Use syntax highlighting with language tags
- Include realistic, working examples
- Show both success and error cases where relevant

### Cross-References
- Link to related components, pages, and entities
- Use relative links: `[ComponentName](../components/dashboard/ComponentName.md)`

---

## Progress Tracking

**Total Files:** ~300+  
**Documented:** 0  
**In Progress:** 0  
**Remaining:** 300+

### Current Sprint
- [ ] Phase 1: Core Infrastructure (5 files)
- [ ] Phase 2: Pages (20 files)

---

## Implementation Workflow

1. **Read File:** Use `read_file` to get the current file content
2. **Analyze:** Understand the component's purpose, props, and dependencies
3. **Generate:** Create markdown documentation following the template
4. **Review:** Ensure all sections are complete and accurate
5. **Update Tracker:** Mark the file as documented in this plan

---

## Maintenance

- **Update Frequency:** After major feature additions or refactors
- **Review Cycle:** Quarterly review of all documentation
- **Version Control:** Documentation should be updated alongside code changes

---

## Notes

- Some components may have been refactored or moved since initial analysis
- Backend functions may have additional integrations not listed
- Entity relationships should be validated against actual usage patterns
- Documentation should reflect current implementation, not ideal state

---

**Next Steps:**
1. Approve this plan
2. Begin Phase 1 documentation
3. Iterate through phases systematically
4. Update tracker as files are documented