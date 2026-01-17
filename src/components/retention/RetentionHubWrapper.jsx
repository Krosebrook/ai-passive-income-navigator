import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AnimatePresence } from 'framer-motion';
import HabitLoopCard from '@/components/retention/HabitLoopCard';
import WeeklyDigestPreview from '@/components/retention/WeeklyDigestPreview';

/**
 * Wrapper for retention system - displays active habit loops and digest
 * Runs in background on main pages
 */
export default function RetentionHubWrapper() {
  const [dismissedLoops, setDismissedLoops] = useState([]);
  const [showDigest, setShowDigest] = useState(false);

  // Fetch retention state
  const { data: retentionState } = useQuery({
    queryKey: ['retention-state'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        const states = await base44.entities.RetentionState.filter({
          user_email: user.email
        });
        return states[0] || null;
      } catch {
        return null;
      }
    },
    refetchInterval: 300000 // 5 minutes
  });

  // Evaluate retention progress
  const { data: progressData } = useQuery({
    queryKey: ['retention-progress', retentionState?.id],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('evaluateRetentionProgress');
        return response.data;
      } catch {
        return null;
      }
    },
    enabled: !!retentionState,
    refetchInterval: 600000 // 10 minutes
  });

  // Trigger habit loops based on user activity
  const triggerHabitLoop = async (action, metadata = {}) => {
    try {
      const response = await base44.functions.invoke('triggerHabitLoop', {
        trigger_action: action,
        metadata
      });

      if (response.data?.triggered_loop) {
        // Loop was triggered - it will display
      }
    } catch (error) {
      console.error('Failed to trigger habit loop:', error);
    }
  };

  // Auto-trigger loops based on user actions
  useEffect(() => {
    if (!progressData) return;

    // Example: trigger discovery loop if user recently saved a deal
    if (progressData.active_habit_loops?.some(l => l.id === 'discovery_loop')) {
      // Could trigger based on specific actions
    }
  }, [progressData]);

  if (!retentionState || !progressData) {
    return null;
  }

  // Get active loops that haven't been dismissed
  const activeLoops = (progressData.active_habit_loops || []).filter(
    loop => !dismissedLoops.includes(loop.id)
  );

  return (
    <>
      <AnimatePresence>
        {/* Display habit loops */}
        {activeLoops.map((loop) => (
          <HabitLoopCard
            key={loop.id}
            loop={loop}
            onComplete={() => setDismissedLoops([...dismissedLoops, loop.id])}
            onDismiss={() => setDismissedLoops([...dismissedLoops, loop.id])}
          />
        ))}

        {/* Weekly digest preview */}
        {showDigest && (
          <WeeklyDigestPreview
            retentionState={retentionState}
            onClose={() => setShowDigest(false)}
          />
        )}
      </AnimatePresence>

      {/* Expose trigger function for parent components */}
      {typeof window !== 'undefined' && (
        // eslint-disable-next-line no-console
        console.log('Retention hub ready - triggerHabitLoop available')
      )}
    </>
  );
}