import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AnimatePresence } from 'framer-motion';
import DealFirstActivation from '@/components/activation/DealFirstActivation';
import PortfolioFirstActivation from '@/components/activation/PortfolioFirstActivation';
import CommunityFirstActivation from '@/components/activation/CommunityFirstActivation';
import ActivationNudgeEngine from '@/components/activation/ActivationNudgeEngine';

/**
 * Main wrapper for post-onboarding activation system
 * Determines path and renders appropriate activation guide
 */
export default function ActivationGuideWrapper() {
  const queryClient = useQueryClient();
  const [pathDetermined, setPathDetermined] = useState(false);

  // Fetch onboarding profile
  const { data: onboardingProfile } = useQuery({
    queryKey: ['onboarding-profile'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.UserOnboardingProfile.filter({
          user_email: user.email
        });
        return profiles[0] || null;
      } catch {
        return null;
      }
    }
  });

  // Fetch activation state
  const { data: activationState } = useQuery({
    queryKey: ['activation-state'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        const states = await base44.entities.ActivationState.filter({
          user_email: user.email
        });
        return states[0] || null;
      } catch {
        return null;
      }
    }
  });

  // Determine activation path if needed
  const determinePathMutation = useMutation({
    mutationFn: async () => {
      if (!onboardingProfile) return null;

      const response = await base44.functions.invoke('determineActivationPath', {
        onboardingProfileId: onboardingProfile.id
      });

      return response.data?.path;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activation-state'] });
      setPathDetermined(true);
    }
  });

  // Auto-determine path on first load
  useEffect(() => {
    if (onboardingProfile && !activationState && !pathDetermined) {
      determinePathMutation.mutate();
    } else if (activationState) {
      setPathDetermined(true);
    }
  }, [onboardingProfile, activationState]);

  if (!activationState || !pathDetermined) {
    return null; // Still determining path
  }

  // Skip if already activated
  if (activationState.activated) {
    return null;
  }

  // Render appropriate activation path
  const pathComponents = {
    deal_first: DealFirstActivation,
    portfolio_first: PortfolioFirstActivation,
    community_first: CommunityFirstActivation
  };

  const PathComponent = pathComponents[activationState.activation_path];

  return (
    <>
      <AnimatePresence>
        {PathComponent && (
          <PathComponent
            activationState={activationState}
            onboardingProfile={onboardingProfile}
          />
        )}
      </AnimatePresence>

      {/* Smart nudge engine runs independently */}
      <ActivationNudgeEngine activationState={activationState} />
    </>
  );
}