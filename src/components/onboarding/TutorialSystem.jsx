import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TutorialHighlight from '@/components/onboarding/TutorialHighlight';

/**
 * Manages tutorial state, triggers, and execution
 * Tracks which tutorials user has seen/completed
 */
export default function TutorialSystem({ tutorialId = null, onComplete = null }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: profile } = useQuery({
    queryKey: ['onboarding-profile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserOnboardingProfile.filter({ user_email: user.email });
      return profiles[0];
    }
  });

  const { data: tutorials = {} } = useQuery({
    queryKey: ['tutorials-config'],
    queryFn: async () => {
      const response = await fetch('/config/onboardingFlow.json');
      const config = await response.json();
      return config.tutorials || {};
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates) => {
      if (!profile) return;
      return base44.entities.UserOnboardingProfile.update(profile.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-profile'] });
    }
  });

  const startTutorial = (id) => {
    setCurrentStep(0);
    setIsActive(true);

    updateProfileMutation.mutate({
      tutorials: {
        ...profile?.tutorials,
        started_tutorials: [...(profile?.tutorials?.started_tutorials || []), id]
      }
    });
  };

  const completeTutorial = (id) => {
    setIsActive(false);
    updateProfileMutation.mutate({
      tutorials: {
        ...profile?.tutorials,
        completed_tutorials: [...(profile?.tutorials?.completed_tutorials || []), id]
      }
    });
    onComplete?.(id);
  };

  const dismissTutorial = (id) => {
    setIsActive(false);
    updateProfileMutation.mutate({
      tutorials: {
        ...profile?.tutorials,
        dismissed_tutorials: [...(profile?.tutorials?.dismissed_tutorials || []), id]
      }
    });
  };

  const handleNext = () => {
    if (currentStep < (currentTutorial?.steps?.length || 0) - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    completeTutorial(tutorialId);
  };

  // Get tutorial config
  const currentTutorial = tutorialId ? tutorials[tutorialId] : null;
  const tutorialSteps = currentTutorial?.steps || [];

  if (!isActive || !currentTutorial) return null;

  return (
    <TutorialHighlight
      step={tutorialSteps[currentStep]}
      stepIndex={currentStep}
      totalSteps={tutorialSteps.length}
      onNext={handleNext}
      onSkip={() => dismissTutorial(tutorialId)}
      onComplete={handleComplete}
    />
  );
}

/**
 * Hook to check if tutorial should be triggered
 */
export function useTutorialTrigger(config) {
  const { data: profile } = useQuery({
    queryKey: ['onboarding-profile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserOnboardingProfile.filter({ user_email: user.email });
      return profiles[0];
    }
  });

  const evaluateTrigger = () => {
    if (!profile) return false;
    
    const { event, condition } = config;
    const activationMetrics = profile.activation_metrics || {};

    switch (event) {
      case 'first_portfolio_access':
        return condition === 'no_ideas_yet' && !activationMetrics.first_portfolio_idea_added_at;
      case 'first_home_access':
        return condition === 'no_deals_viewed' && !activationMetrics.first_deal_viewed_at;
      default:
        return false;
    }
  };

  return evaluateTrigger();
}