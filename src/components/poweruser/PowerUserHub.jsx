import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AnimatePresence } from 'framer-motion';
import PowerUserUnlockNotification from '@/components/poweruser/PowerUserUnlockNotification';
import MonetizationPrompt from '@/components/poweruser/MonetizationPrompt';
import PowerUserValueMetrics from '@/components/poweruser/PowerUserValueMetrics';

/**
 * Central hub for power-user features
 * Manages tier unlocks, monetization, and value display
 */
export default function PowerUserHub() {
  const queryClient = useQueryClient();
  const [displayedUnlock, setDisplayedUnlock] = useState(null);
  const [displayedMoment, setDisplayedMoment] = useState(null);
  const [dismissedMoments, setDismissedMoments] = useState([]);

  // Fetch power-user state
  const { data: powerUserState } = useQuery({
    queryKey: ['power-user-state'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        const states = await base44.entities.PowerUserState.filter({
          user_email: user.email
        });
        return states[0] || null;
      } catch {
        return null;
      }
    }
  });

  // Evaluate power-user eligibility
  const evaluateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('evaluatePowerUserEligibility');
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['power-user-state'] });

      // Show tier unlock if new
      if (data.tier_unlocks && data.tier_unlocks.length > 0) {
        const firstNewUnlock = data.tier_unlocks[0];
        setDisplayedUnlock({
          id: firstNewUnlock,
          triggered_by: data.power_user_state?.capability_tiers?.[firstNewUnlock]?.triggered_by
        });
      }

      // Show monetization moment if eligible
      if (data.eligible_monetization_moments && data.eligible_monetization_moments.length > 0) {
        const nextMoment = data.eligible_monetization_moments.find(
          m => !dismissedMoments.includes(m)
        );
        if (nextMoment) {
          setDisplayedMoment({ id: nextMoment });
        }
      }
    }
  });

  // Auto-evaluate periodically
  useEffect(() => {
    evaluateMutation.mutate();
    const interval = setInterval(() => {
      evaluateMutation.mutate();
    }, 300000); // Every 5 minutes

    return () => clearInterval(interval);
  }, []);

  if (!powerUserState) {
    return null;
  }

  return (
    <>
      {/* Tier unlock notifications */}
      <AnimatePresence>
        {displayedUnlock && (
          <PowerUserUnlockNotification
            unlock={displayedUnlock}
            onDismiss={() => setDisplayedUnlock(null)}
            onExplore={() => {
              // Navigate to relevant feature
              setDisplayedUnlock(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Monetization prompts */}
      <AnimatePresence>
        {displayedMoment && (
          <MonetizationPrompt
            moment={displayedMoment}
            onUpgrade={() => {
              // Handle upgrade action
              setDisplayedMoment(null);
            }}
            onDismiss={() => {
              setDismissedMoments([...dismissedMoments, displayedMoment.id]);
              setDisplayedMoment(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Value metrics for power users */}
      {powerUserState.power_user_status !== 'prospect' && (
        <div className="hidden md:block">
          {/* Render metrics on dashboard or profile */}
          <PowerUserValueMetrics metrics={powerUserState.value_metrics} />
        </div>
      )}
    </>
  );
}