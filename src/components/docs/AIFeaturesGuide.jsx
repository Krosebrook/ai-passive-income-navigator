import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, TrendingUp, Users, Target, Brain, Zap } from 'lucide-react';

export default function AIFeaturesGuide() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-100 to-purple-100 rounded-full mb-4">
          <Sparkles className="w-5 h-5 text-violet-600" />
          <span className="font-semibold text-violet-900">AI-Powered Platform</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">FlashFusion AI Features</h1>
        <p className="text-lg text-gray-600">Comprehensive guide to AI-driven capabilities</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline AI</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Features at a Glance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FeatureCard
                  icon={TrendingUp}
                  title="Deal Pipeline Automation"
                  description="Auto-categorize, compare, and analyze deals with AI-powered insights"
                  status="Active"
                />
                <FeatureCard
                  icon={Target}
                  title="Smart Deal Sourcing"
                  description="AI scans online markets based on your criteria and presents matches"
                  status="Active"
                />
                <FeatureCard
                  icon={Brain}
                  title="Intelligent Onboarding"
                  description="Adaptive wizard with personalized insights and learning paths"
                  status="Active"
                />
                <FeatureCard
                  icon={Users}
                  title="Collaboration Matching"
                  description="AI suggests potential collaborators based on shared interests"
                  status="Active"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline AI */}
        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deal Pipeline AI Automation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Section
                title="1. Auto-Categorization"
                badge="categorizeDeal"
                description="Automatically categorizes incoming deals and assigns priority scores"
              >
                <CodeBlock>
{`// Triggers: Manual or automatic on deal creation
// Output: Categories (hot_lead, warm_lead, cold_lead, nurture, pass)
{
  "category": "hot_lead",
  "priority_score": 85,
  "match_quality": "excellent",
  "reasons": ["Strong ROI alignment", "Low risk profile"],
  "next_actions": ["Schedule due diligence", "Contact seller"],
  "follow_up_timeline": "within_24h"
}`}
                </CodeBlock>
              </Section>

              <Section
                title="2. Deal Comparison"
                badge="compareDeals"
                description="Side-by-side AI analysis of multiple deals"
              >
                <CodeBlock>
{`// Input: Array of deal IDs
// Output: Comprehensive comparison
{
  "best_overall": { "deal_title": "...", "reasoning": "..." },
  "comparison_table": [...],
  "best_for_scenarios": [
    { "scenario": "Best for low risk", "deal_title": "...", "reason": "..." }
  ],
  "final_recommendation": "..."
}`}
                </CodeBlock>
              </Section>

              <Section
                title="3. Summary Reports"
                badge="generateDealReport"
                description="Generates executive summaries with market context"
              >
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Executive summary (2-3 paragraphs)</li>
                  <li>Investment highlights (5-7 bullet points)</li>
                  <li>Risk analysis with mitigation strategies</li>
                  <li>Market context from internet research</li>
                  <li>Due diligence checklist (8-10 items)</li>
                  <li>Comparable deals analysis</li>
                  <li>Final recommendation (invest/pass/more_info)</li>
                </ul>
              </Section>

              <Section
                title="4. Nurturing Workflows"
                badge="DealNurturingWorkflow Entity"
                description="Automated follow-up sequences for deals"
              >
                <CodeBlock>
{`{
  "deal_id": "...",
  "workflow_stage": "follow_up",
  "scheduled_actions": [
    {
      "action_type": "email",
      "action_date": "2026-01-20T10:00:00Z",
      "action_description": "Send initial interest email",
      "completed": false
    }
  ],
  "engagement_score": 75,
  "ai_recommended_actions": ["Schedule call", "Request financials"]
}`}
                </CodeBlock>
              </Section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onboarding */}
        <TabsContent value="onboarding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Onboarding System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Section
                title="Onboarding Wizard Flow"
                description="7-step personalized setup process"
              >
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li><strong>Welcome</strong> - Introduction with benefits</li>
                  <li><strong>Passive Income Vision</strong> - Goals and time commitment</li>
                  <li><strong>Deal Sourcing Criteria</strong> - Investment preferences</li>
                  <li><strong>Portfolio Goals</strong> - Returns and diversification</li>
                  <li><strong>Community Preferences</strong> - Networking settings</li>
                  <li><strong>Advanced Modules</strong> (Optional) - M&A, Financial Modeling, etc.</li>
                  <li><strong>Review & Confirm</strong> - Summary with edit options</li>
                </ol>
              </Section>

              <Section
                title="Dynamic Features"
                description="Adaptive onboarding capabilities"
              >
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li><strong>Conditional Branching:</strong> Skip irrelevant questions based on previous answers</li>
                  <li><strong>AI Insights:</strong> Real-time personalized guidance at each step</li>
                  <li><strong>Progress Indicators:</strong> Visual progress with step completion</li>
                  <li><strong>Contextual Help:</strong> Tooltips and examples throughout</li>
                  <li><strong>Validation:</strong> Input checks and logical validations</li>
                </ul>
              </Section>

              <Section
                title="Advanced Modules"
                badge="AdvancedModulesStep"
                description="Optional learning paths for experienced users"
              >
                <div className="grid md:grid-cols-2 gap-3">
                  <ModuleCard title="Complex Financial Modeling" level="Advanced" duration="~15 min" />
                  <ModuleCard title="M&A Fundamentals" level="Advanced" duration="~20 min" />
                  <ModuleCard title="Due Diligence Mastery" level="Intermediate" duration="~12 min" />
                  <ModuleCard title="Investment Syndication" level="Advanced" duration="~10 min" />
                </div>
              </Section>

              <Section
                title="Post-Onboarding Nudges"
                badge="generateOnboardingNudges"
                description="AI-driven feature discovery prompts"
              >
                <CodeBlock>
{`// Triggers after onboarding completion
// Generates 3-5 personalized nudges based on:
// - User preferences
// - Selected advanced modules
// - Activity patterns
// - Unexplored features

{
  "nudge_type": "feature_discovery",
  "target_feature": "deal_sourcing",
  "title": "Ready to discover your first deal?",
  "message": "Based on your criteria, we found 12 opportunities...",
  "action_label": "Explore Deals",
  "priority": 8
}`}
                </CodeBlock>
              </Section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collaboration */}
        <TabsContent value="collaboration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Collaboration Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Section
                title="User Matching"
                badge="suggestCollaborators"
                description="AI suggests potential partners based on profiles"
              >
                <p className="text-sm text-gray-700 mb-3">
                  Analyzes investment criteria, interests, activity patterns, and portfolio overlaps to recommend collaboration opportunities.
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Shared investment interests</li>
                  <li>Complementary skills and experience</li>
                  <li>Similar risk tolerance and goals</li>
                  <li>Geographic proximity (if relevant)</li>
                </ul>
              </Section>

              <Section
                title="Financial Analysis"
                badge="analyzeFinancials"
                description="AI-powered deal and portfolio analysis"
              >
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Risk assessment scoring</li>
                  <li>ROI projections with scenarios</li>
                  <li>Automated due diligence checklists</li>
                  <li>Market context integration</li>
                  <li>Red flag detection</li>
                </ul>
              </Section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Reference */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backend Functions API Reference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <APIReference
                functionName="categorizeDeal"
                input={{ dealId: "string" }}
                output={{
                  success: "boolean",
                  categorization: {
                    category: "string",
                    priority_score: "number",
                    match_quality: "string",
                    reasons: "array",
                    next_actions: "array",
                    follow_up_timeline: "string"
                  }
                }}
              />

              <APIReference
                functionName="compareDeals"
                input={{ dealIds: ["string", "string", "..."] }}
                output={{
                  success: "boolean",
                  comparison: {
                    comparison_table: "array",
                    best_overall: "object",
                    best_for_scenarios: "array",
                    key_differentiators: "array",
                    final_recommendation: "string"
                  }
                }}
              />

              <APIReference
                functionName="generateDealReport"
                input={{ dealId: "string" }}
                output={{
                  success: "boolean",
                  report: {
                    executive_summary: "string",
                    investment_highlights: "array",
                    risk_analysis: "array",
                    market_context: "string",
                    financial_overview: "object",
                    due_diligence_checklist: "array",
                    comparable_deals: "array",
                    final_recommendation: "string"
                  },
                  generated_at: "ISO date string"
                }}
              />

              <APIReference
                functionName="generateOnboardingNudges"
                input={{}}
                output={{
                  success: "boolean",
                  nudges: "array of OnboardingNudge objects"
                }}
              />

              <APIReference
                functionName="sourceDealOpportunities"
                input={{ criteriaId: "string" }}
                output={{
                  success: "boolean",
                  deals: "array of SourcedDealOpportunity objects",
                  count: "number"
                }}
              />

              <APIReference
                functionName="suggestCollaborators"
                input={{}}
                output={{
                  success: "boolean",
                  suggestions: "array of user match objects"
                }}
              />

              <APIReference
                functionName="analyzeFinancials"
                input={{
                  dealId: "string (optional)",
                  portfolioId: "string (optional)"
                }}
                output={{
                  success: "boolean",
                  analysis: {
                    risk_score: "number",
                    roi_projection: "object",
                    due_diligence: "array",
                    recommendation: "string"
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components
function FeatureCard({ icon: Icon, title, description, status }) {
  return (
    <div className="p-4 border rounded-lg bg-gradient-to-br from-gray-50 to-white">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-violet-100 rounded-lg">
          <Icon className="w-5 h-5 text-violet-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{title}</h4>
            <Badge className="bg-green-100 text-green-800 border-green-300">{status}</Badge>
          </div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, badge, description, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {badge && <Badge variant="outline" className="text-xs">{badge}</Badge>}
      </div>
      {description && <p className="text-sm text-gray-600 mb-3">{description}</p>}
      {children}
    </div>
  );
}

function CodeBlock({ children }) {
  return (
    <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-xs">
      <code>{children}</code>
    </pre>
  );
}

function ModuleCard({ title, level, duration }) {
  return (
    <div className="p-3 border rounded-lg bg-white">
      <h5 className="font-medium text-gray-900 mb-1">{title}</h5>
      <div className="flex gap-2">
        <Badge variant="outline" className="text-xs">{level}</Badge>
        <Badge variant="outline" className="text-xs text-gray-500">{duration}</Badge>
      </div>
    </div>
  );
}

function APIReference({ functionName, input, output }) {
  return (
    <div className="border-l-4 border-violet-500 pl-4">
      <h4 className="font-mono font-semibold text-violet-600 mb-2">{functionName}</h4>
      <div className="space-y-2">
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">INPUT:</p>
          <CodeBlock>{JSON.stringify(input, null, 2)}</CodeBlock>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">OUTPUT:</p>
          <CodeBlock>{JSON.stringify(output, null, 2)}</CodeBlock>
        </div>
      </div>
    </div>
  );
}