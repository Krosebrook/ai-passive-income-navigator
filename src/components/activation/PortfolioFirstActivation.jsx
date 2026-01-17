import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, TrendingUp } from 'lucide-react';
import ActivationGuidanceCard from '@/components/activation/ActivationGuidanceCard';

/**
 * Portfolio-First Activation Path
 * Guides users to set goals and see projections
 */
export default function PortfolioFirstActivation({ activationState, onboardingProfile }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissedAt, setDismissedAt] = useState(null);

  const steps = [
    {
      id: 'portfolio_first_review',
      title: 'Set Portfolio Goals',
      description: 'Define your investment targets and strategy',
      icon: Target,
      action: 'Configure',
      target: 'profile_settings'
    },
    {
      id: 'portfolio_first_projection',
      title: 'See Projections',
      description: 'Visualize potential returns and benchmarks',
      icon: TrendingUp,
      action: 'View',
      target: 'portfolio_analytics'
    },
    {
      id: 'portfolio_first_deal_connect',
      title: 'Browse Aligned Deals',
      description: 'Find investments matching your targets',
      icon: Zap,
      action: 'Explore',
      target: 'home_page'
    }
  ];

  const completed = activationState.milestones?.portfolio_goal_configured?.completed || false;

  if (completed || dismissedAt) {
    return null;
  }

  const progress = Object.values(activationState.milestones || {})
    .filter(m => m.completed).length / steps.length * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <ActivationGuidanceCard
        title="Build Your Investment Strategy"
        subtitle="Set goals and discover aligned opportunities"
        steps={steps}
        currentStep={currentStep}
        progress={progress}
        onDismiss={() => setDismissedAt(Date.now())}
        onStepComplete={() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))}
      />
    </motion.div>
  );
}