import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';
import ActivationGuidanceCard from '@/components/activation/ActivationGuidanceCard';

/**
 * Deal-First Activation Path
 * Guides users to view, understand, and save their first deal
 */
export default function DealFirstActivation({ activationState, onboardingProfile }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissedAt, setDismissedAt] = useState(null);

  const steps = [
    {
      id: 'deal_first_explore',
      title: 'Your AI-Matched Deals',
      description: 'We found deals tailored to your preferences',
      icon: Sparkles,
      action: 'Browse Deals',
      target: 'home_page'
    },
    {
      id: 'deal_first_save',
      title: 'Save Your First Deal',
      description: 'Bookmark one to investigate deeper',
      icon: TrendingUp,
      action: 'View Deals',
      target: 'home_page'
    },
    {
      id: 'deal_first_understand',
      title: 'Why This Deal?',
      description: 'See AI match score and personalized insights',
      icon: Sparkles,
      action: 'Learn More',
      target: 'deal_detail'
    }
  ];

  const completed = activationState.milestones?.first_deal_saved?.completed || false;

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
        title="Find Your First Deal"
        subtitle="3-step journey to your first investment insight"
        steps={steps}
        currentStep={currentStep}
        progress={progress}
        onDismiss={() => setDismissedAt(Date.now())}
        onStepComplete={() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))}
      />
    </motion.div>
  );
}