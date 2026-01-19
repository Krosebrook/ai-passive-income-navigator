import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useGuidance } from './ProactiveGuidanceSystem';
import { useLocation } from 'react-router-dom';

const GUIDANCE_TIPS = {
  'deal_criteria_revisit': {
    id: 'deal_criteria_revisit',
    title: 'Still exploring deal criteria?',
    message: 'Refining your deal criteria helps AI find better matches. Consider setting specific revenue ranges or risk preferences.',
    action: {
      label: 'Configure Now',
      handler: () => window.location.href = '/ProfileSettings'
    },
    triggerCondition: (context) => context.pageVisits['ProfileSettings'] >= 3 && !context.hasAdvancedPreferences
  },
  'portfolio_incomplete': {
    id: 'portfolio_incomplete',
    title: 'Complete your portfolio setup',
    message: 'Setting allocation targets and risk limits helps track your progress and stay on strategy.',
    action: {
      label: 'Set Goals',
      handler: () => window.location.href = '/ProfileSettings'
    },
    triggerCondition: (context) => context.portfolioCount > 0 && !context.hasPortfolioGoals
  },
  'ai_deals_unused': {
    id: 'ai_deals_unused',
    title: 'Try AI-generated deals',
    message: 'AI can find personalized opportunities based on your preferences. Generate deals tailored to your goals.',
    action: {
      label: 'Generate Deals',
      handler: () => window.location.href = '/AICoach'
    },
    triggerCondition: (context) => context.daysActive >= 3 && context.aiDealsGenerated === 0
  },
  'integration_available': {
    id: 'integration_available',
    title: 'Connect your tools',
    message: 'Sync with Stripe, Airtable, or Zapier to automate tracking and stay on top of your portfolio.',
    action: {
      label: 'View Integrations',
      handler: () => window.location.href = '/ProfileSettings'
    },
    triggerCondition: (context) => context.portfolioCount >= 3 && context.enabledIntegrations === 0
  },
  'analytics_explore': {
    id: 'analytics_explore',
    title: 'Track your performance',
    message: 'View detailed analytics on deal sourcing, conversions, and portfolio growth to optimize your strategy.',
    action: {
      label: 'View Analytics',
      handler: () => window.location.href = '/Analytics'
    },
    triggerCondition: (context) => context.dealsInPipeline >= 5 && context.pageVisits['Analytics'] === 0
  },
  'frequent_bouncer': {
    id: 'frequent_bouncer',
    title: 'Need help getting started?',
    message: 'Looks like you\'re exploring. Try the quick onboarding to set up your preferences and get personalized recommendations.',
    action: {
      label: 'Quick Setup',
      handler: () => {
        const event = new CustomEvent('trigger-onboarding');
        window.dispatchEvent(event);
      }
    },
    triggerCondition: (context) => {
      const totalVisits = Object.values(context.pageVisits).reduce((sum, v) => sum + v, 0);
      return totalVisits >= 10 && !context.hasCompletedOnboarding;
    }
  }
};

export default function BehaviorTriggers() {
  const location = useLocation();
  const { showTip, trackPageVisit, pageVisits, dismissedTips } = useGuidance();

  const { data: preferences } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const prefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
      return prefs[0];
    }
  });

  const { data: portfolioIdeas = [] } = useQuery({
    queryKey: ['portfolio-ideas'],
    queryFn: () => base44.entities.PortfolioIdea.list()
  });

  const { data: dealPipeline = [] } = useQuery({
    queryKey: ['deal-pipeline'],
    queryFn: () => base44.entities.DealPipeline.list()
  });

  const { data: aiDeals = [] } = useQuery({
    queryKey: ['ai-generated-deals'],
    queryFn: () => base44.entities.SourcedDealOpportunity.filter({ is_generated: true })
  });

  useEffect(() => {
    const pageName = location.pathname.replace('/', '') || 'Home';
    trackPageVisit(pageName);
  }, [location.pathname]);

  useEffect(() => {
    const context = {
      pageVisits,
      hasAdvancedPreferences: !!(preferences?.target_allocation),
      hasPortfolioGoals: !!(preferences?.target_return),
      portfolioCount: portfolioIdeas.length,
      aiDealsGenerated: aiDeals.length,
      enabledIntegrations: preferences?.enabled_integrations?.length || 0,
      dealsInPipeline: dealPipeline.length,
      hasCompletedOnboarding: preferences?.has_completed_onboarding,
      daysActive: 3 // Placeholder - could track from user creation date
    };

    // Check each tip's trigger condition
    for (const tip of Object.values(GUIDANCE_TIPS)) {
      const alreadyDismissed = dismissedTips.some(t => t.tip_id === tip.id && t.dismissed_at);
      const alreadyShown = dismissedTips.find(t => t.tip_id === tip.id);
      
      // Don't show if dismissed or shown more than 3 times
      if (alreadyDismissed || (alreadyShown?.shown_count >= 3)) continue;

      if (tip.triggerCondition(context)) {
        // Add delay to avoid showing immediately
        setTimeout(() => showTip(tip), 2000);
        break; // Only show one tip at a time
      }
    }
  }, [pageVisits, preferences, portfolioIdeas, dealPipeline, aiDeals, dismissedTips]);

  return null;
}