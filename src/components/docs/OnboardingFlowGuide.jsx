import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronRight, Sparkles } from 'lucide-react';

export default function OnboardingFlowGuide() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Onboarding Wizard Flow</h1>
        <p className="text-lg text-gray-600">Complete user journey documentation</p>
      </div>

      {/* Step 1 */}
      <StepCard
        number={1}
        title="Welcome!"
        component="WelcomeStep.jsx"
        isOptional={false}
      >
        <StepContent
          microcopy="Welcome to FlashFusion! Let's set up your personalized journey to passive income. This quick setup helps us tailor opportunities, insights, and connections just for you."
          uiIdeas="Full-screen hero with engaging graphics, 'Get Started' button"
          dataFields={[]}
          aiInsight="None (introductory step)"
          validation="None"
        />
      </StepCard>

      {/* Step 2 */}
      <StepCard
        number={2}
        title="Your Passive Income Vision"
        component="Integrated in wizard"
        isOptional={false}
      >
        <StepContent
          microcopy="What's your primary goal for passive income? And how much time can you realistically commit each week?"
          uiIdeas="Card layout, radio buttons for passive_income_goal, slider for time_commitment"
          dataFields={['passive_income_goal', 'time_commitment']}
          aiInsight="Based on goal + time commitment, AI suggests investment automation level"
          validation="Required field: passive_income_goal"
          contextualHelp="Tooltip explaining typical hour ranges (0-2 hrs, 2-5 hrs, 5+ hrs)"
        />
      </StepCard>

      {/* Step 3 */}
      <StepCard
        number={3}
        title="Deal Sourcing Criteria"
        component="DealSourcingStep.jsx"
        isOptional={false}
      >
        <StepContent
          microcopy="Tell us about your ideal deal. What kind of opportunities are you looking for?"
          uiIdeas="Multi-select dropdowns, sliders for investment range, segmented control for risk"
          dataFields={[
            'target_industries',
            'investment_size_min',
            'investment_size_max',
            'preferred_deal_structures',
            'geo_preferences',
            'risk_tolerance'
          ]}
          aiInsight="Real-time suggestions based on selected industries and risk level"
          validation="Logical check: min investment < max investment"
          contextualHelp="Examples of deal structures, industry tooltips"
          dynamicBranching="If risk_tolerance = 'very_conservative', hide high-risk deal types"
        />
      </StepCard>

      {/* Step 4 */}
      <StepCard
        number={4}
        title="Portfolio Goals"
        component="PortfolioGoalsStep.jsx"
        isOptional={false}
      >
        <StepContent
          microcopy="How do you envision your portfolio growing? What's your strategy for building wealth?"
          uiIdeas="Sliders for returns, radio buttons for timeline, multi-select for sectors"
          dataFields={[
            'time_horizon',
            'target_return_percentage',
            'diversification_preference',
            'sector_priorities',
            'asset_class_priorities'
          ]}
          aiInsight="If short-term + high returns: AI warns about higher risk"
          validation="Return percentage: 0-100"
          contextualHelp="Explanations of diversification strategies"
        />
      </StepCard>

      {/* Step 5 */}
      <StepCard
        number={5}
        title="Community & Collaboration"
        component="CommunityPreferencesStep.jsx"
        isOptional={false}
      >
        <StepContent
          microcopy="Connect with a thriving community of investors. How would you like to engage?"
          uiIdeas="Multi-select for peer groups, radio for notification frequency, toggle for privacy"
          dataFields={[
            'peer_group_interests',
            'networking_vs_knowledge',
            'community_notification_frequency',
            'profile_visibility',
            'allow_collaboration_requests'
          ]}
          aiInsight="Suggests relevant peer groups based on previous answers"
          validation="None (all optional)"
          contextualHelp="Privacy setting explanations"
        />
      </StepCard>

      {/* Step 6 */}
      <StepCard
        number={6}
        title="Advanced Learning Modules"
        component="AdvancedModulesStep.jsx"
        isOptional={true}
      >
        <StepContent
          microcopy="Ready to go deeper? Select advanced modules to receive guided tutorials and AI-powered coaching."
          uiIdeas="Card layout for each module with toggle switches"
          dataFields={['advanced_modules (array)']}
          aiInsight="Recommends modules based on experience level and goals"
          validation="None (fully optional step)"
          contextualHelp="Brief description of each module (M&A, Financial Modeling, etc.)"
        >
          <div className="mt-3 space-y-2">
            <ModuleOption title="Complex Financial Modeling" level="Advanced" duration="~15 min" />
            <ModuleOption title="M&A Fundamentals" level="Advanced" duration="~20 min" />
            <ModuleOption title="Comprehensive Due Diligence" level="Intermediate" duration="~12 min" />
            <ModuleOption title="Investment Syndication" level="Advanced" duration="~10 min" />
          </div>
        </StepContent>
      </StepCard>

      {/* Step 7 */}
      <StepCard
        number={7}
        title="Review & Confirm"
        component="ReviewStep.jsx"
        isOptional={false}
      >
        <StepContent
          microcopy="Almost done! Please review your preferences. You can always change these later in your profile settings."
          uiIdeas="Read-only summary with 'Edit' buttons per section, 'Confirm & Finish' CTA"
          dataFields={['All previously captured data']}
          aiInsight="Final personalization summary"
          validation="Ensures all required fields are completed"
        />
      </StepCard>

      {/* Step 8 */}
      <StepCard
        number={8}
        title="All Set!"
        component="CompleteStep.jsx"
        isOptional={false}
      >
        <StepContent
          microcopy="You're all set! Your personalized FlashFusion experience awaits. We're now tailoring your dashboard and recommendations."
          uiIdeas="Success message, quick action buttons (Discover Deals, My Portfolio, Community)"
          dataFields={[]}
          aiInsight="Triggers generateOnboardingNudges function for post-onboarding prompts"
          validation="None"
        />
      </StepCard>

      {/* Data Schema */}
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            Final User Profile Schema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-xs">
            <code>{`Entity: UserPreferences

{
  "has_completed_onboarding": boolean,
  "passive_income_goal": "side_income" | "supplement" | "replace_job" | "financial_freedom",
  "time_commitment": number (0-4 scale),
  "risk_tolerance": "very_conservative" | "conservative" | "moderate" | "aggressive" | "very_aggressive",
  "existing_skills": string[],
  "target_industries": string[],
  "investment_size_min": number,
  "investment_size_max": number,
  "preferred_deal_structures": string[],
  "geo_preferences": string[],
  "time_horizon": "short_term" | "medium_term" | "long_term",
  "target_return_percentage": number,
  "diversification_preference": "focused" | "moderately_diversified" | "highly_diversified",
  "sector_priorities": string[],
  "asset_class_priorities": string[],
  "peer_group_interests": string[],
  "networking_vs_knowledge": "networking_focused" | "balanced" | "knowledge_focused",
  "community_notification_frequency": "real_time" | "daily" | "weekly" | "monthly",
  "profile_visibility": "public" | "network_only" | "private",
  "allow_collaboration_requests": boolean,
  "advanced_modules": string[]
}`}</code>
          </pre>
        </CardContent>
      </Card>

      {/* Features Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Key Onboarding Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <FeatureItem text="Conditional branching based on user responses" />
            <FeatureItem text="Real-time AI insights at each step" />
            <FeatureItem text="Progress indicators with step completion" />
            <FeatureItem text="Contextual help (tooltips, examples)" />
            <FeatureItem text="Input validation and logical checks" />
            <FeatureItem text="Summary review screen with edit capabilities" />
            <FeatureItem text="Post-onboarding AI-driven nudges for feature discovery" />
            <FeatureItem text="Friendly, minimal-friction language throughout" />
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function StepCard({ number, title, component, isOptional, children }) {
  return (
    <Card className="border-l-4 border-violet-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold">
              {number}
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Component: {component}</p>
            </div>
          </div>
          {isOptional && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
              Optional
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function StepContent({ microcopy, uiIdeas, dataFields, aiInsight, validation, contextualHelp, dynamicBranching, children }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-1">MICROCOPY:</p>
        <p className="text-sm text-gray-700 italic">"{microcopy}"</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 mb-1">UI IDEAS:</p>
        <p className="text-sm text-gray-700">{uiIdeas}</p>
      </div>

      {dataFields.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">DATA FIELDS CAPTURED:</p>
          <div className="flex flex-wrap gap-2">
            {dataFields.map((field, idx) => (
              <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                {field}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-gray-500 mb-1">AI INSIGHT:</p>
        <p className="text-sm text-gray-700">{aiInsight}</p>
      </div>

      {validation && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">VALIDATION:</p>
          <p className="text-sm text-gray-700">{validation}</p>
        </div>
      )}

      {contextualHelp && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">CONTEXTUAL HELP:</p>
          <p className="text-sm text-gray-700">{contextualHelp}</p>
        </div>
      )}

      {dynamicBranching && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">DYNAMIC BRANCHING:</p>
          <p className="text-sm text-gray-700">{dynamicBranching}</p>
        </div>
      )}

      {children}
    </div>
  );
}

function ModuleOption({ title, level, duration }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded border">
      <Check className="w-4 h-4 text-green-600" />
      <span className="text-sm font-medium flex-1">{title}</span>
      <Badge variant="outline" className="text-xs">{level}</Badge>
      <Badge variant="outline" className="text-xs text-gray-500">{duration}</Badge>
    </div>
  );
}

function FeatureItem({ text }) {
  return (
    <li className="flex items-start gap-2 text-sm text-gray-700">
      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
      {text}
    </li>
  );
}