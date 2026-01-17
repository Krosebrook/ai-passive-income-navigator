import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Star, MessageSquare } from 'lucide-react';
import ActivationGuidanceCard from '@/components/activation/ActivationGuidanceCard';

/**
 * Community-First Activation Path
 * Guides users to discover and join communities/follow experts
 */
export default function CommunityFirstActivation({ activationState, onboardingProfile }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissedAt, setDismissedAt] = useState(null);

  const steps = [
    {
      id: 'community_first_discover',
      title: 'Discover Communities',
      description: 'Explore groups and expert profiles',
      icon: Users,
      action: 'Browse',
      target: 'community_page'
    },
    {
      id: 'community_first_follow',
      title: 'Follow Experts',
      description: 'Subscribe to insights from experienced investors',
      icon: Star,
      action: 'Follow',
      target: 'community_page'
    },
    {
      id: 'community_first_join',
      title: 'Join a Group',
      description: 'Become member of investment community',
      icon: MessageSquare,
      action: 'Join',
      target: 'community_page'
    }
  ];

  const completed = activationState.milestones?.community_interaction?.completed || false;

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
        title="Connect & Learn"
        subtitle="Join communities and follow experts"
        steps={steps}
        currentStep={currentStep}
        progress={progress}
        onDismiss={() => setDismissedAt(Date.now())}
        onStepComplete={() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))}
      />
    </motion.div>
  );
}