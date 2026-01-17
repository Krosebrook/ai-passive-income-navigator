import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Lightbulb, X } from 'lucide-react';
import ACTIVATION_CONFIG from '@/functions/activationFlowConfig';

/**
 * Smart nudge engine for activation
 * Evaluates triggers and displays contextual nudges with cooldown logic
 */
export default function ActivationNudgeEngine({ activationState }) {
  const [currentNudge, setCurrentNudge] = useState(null);
  const [cooldownActive, setCooldownActive] = useState(false);
  const queryClient = useQueryClient();

  // Evaluate activation progress
  const { data: progressData } = useQuery({
    queryKey: ['activation-progress', activationState?.id],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('evaluateActivationProgress');
        return response.data;
      } catch (error) {
        console.error('Failed to evaluate progress:', error);
        return null;
      }
    },
    enabled: !!activationState,
    refetchInterval: 30000 // Every 30 seconds
  });

  // Evaluate which nudges should trigger
  useEffect(() => {
    if (!progressData) return;
    if (cooldownActive) return;

    const applicableNudges = [];
    const nudgeRules = ACTIVATION_CONFIG.nudge_rules || [];
    const dismissedNudges = activationState?.nudges?.dismissed_nudges || [];
    const shownNudges = activationState?.nudges?.shown_nudges || [];

    // Day 3 re-engagement
    if (
      progressData.days_since_onboarding === 3 &&
      progressData.completed_milestones.length === 0 &&
      !shownNudges.includes('inactivity_day3')
    ) {
      applicableNudges.push({
        id: 'inactivity_day3',
        message: '💡 Want help finding your first deal?',
        actionLabel: 'Get started',
        surface: 'banner'
      });
    }

    // First deal celebration
    if (
      progressData.completed_milestones.includes('first_deal_saved') &&
      !shownNudges.includes('first_deal_celebration')
    ) {
      applicableNudges.push({
        id: 'first_deal_celebration',
        message: '🎉 Nice! You\'re building momentum. Want to explore more matches?',
        actionLabel: 'Find more',
        surface: 'toast'
      });
    }

    // Day 7 activation check
    if (
      progressData.days_since_onboarding === 7 &&
      !progressData.activated &&
      !shownNudges.includes('day7_activation_check')
    ) {
      applicableNudges.push({
        id: 'day7_activation_check',
        message: '👋 Your personalized deals are waiting. Let\'s help you find the right fit.',
        actionLabel: 'Browse deals',
        surface: 'banner'
      });
    }

    // Set highest priority nudge
    if (applicableNudges.length > 0) {
      setCurrentNudge(applicableNudges[0]);
      setCooldownActive(true);

      // Auto dismiss after cooldown
      setTimeout(() => {
        setCooldownActive(false);
      }, ACTIVATION_CONFIG.cooldown_logic.between_nudges_minutes * 60 * 1000);
    }
  }, [progressData, cooldownActive]);

  const dismissNudgeMutation = useMutation({
    mutationFn: async (nudgeId) => {
      if (!activationState) return;

      return base44.entities.ActivationState.update(activationState.id, {
        nudges: {
          ...activationState.nudges,
          dismissed_nudges: [
            ...(activationState.nudges?.dismissed_nudges || []),
            nudgeId
          ]
        }
      });
    },
    onSuccess: () => {
      setCurrentNudge(null);
      queryClient.invalidateQueries({ queryKey: ['activation-state'] });
    }
  });

  if (!currentNudge) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={currentNudge.id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 15 }}
        className={`fixed ${
          currentNudge.surface === 'banner'
            ? 'top-20 left-0 right-0 mx-4'
            : 'bottom-6 right-6 max-w-sm'
        } z-40`}
      >
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Gradient indicator */}
          <div className="h-1 bg-gradient-to-r from-[#8b85f7] to-[#00b7eb]" />

          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <Lightbulb className="w-5 h-5 text-[#8b85f7] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-900">{currentNudge.message}</p>
              </div>
              <button
                onClick={() => dismissNudgeMutation.mutate(currentNudge.id)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => dismissNudgeMutation.mutate(currentNudge.id)}
                className="text-xs flex-1"
              >
                Dismiss
              </Button>
              <Button
                size="sm"
                className="bg-[#8b85f7] hover:bg-[#7a75e8] text-xs flex-1"
              >
                {currentNudge.actionLabel}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}