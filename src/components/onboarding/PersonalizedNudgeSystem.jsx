import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Lightbulb } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * Displays contextual nudges based on user behavior and preferences
 */
export default function PersonalizedNudgeSystem() {
  const [currentNudge, setCurrentNudge] = useState(null);
  const [nudgeIndex, setNudgeIndex] = useState(0);
  const queryClient = useQueryClient();

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

  const { data: nudges = [] } = useQuery({
    queryKey: ['nudges', onboardingProfile?.id],
    queryFn: async () => {
      if (!onboardingProfile) return [];
      
      try {
        const response = await base44.functions.invoke('generateNudges', {
          userId: onboardingProfile.user_email,
          profile: onboardingProfile
        });
        
        return response.data?.nudges || [];
      } catch (error) {
        console.error('Failed to generate nudges:', error);
        return [];
      }
    },
    enabled: !!onboardingProfile
  });

  const dismissNudgeMutation = useMutation({
    mutationFn: async (nudgeId) => {
      if (!onboardingProfile) return;
      
      return base44.entities.UserOnboardingProfile.update(onboardingProfile.id, {
        nudges: {
          ...onboardingProfile.nudges,
          dismissed_nudges: [
            ...(onboardingProfile.nudges?.dismissed_nudges || []),
            nudgeId
          ]
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-profile'] });
      queryClient.invalidateQueries({ queryKey: ['nudges'] });
      
      // Move to next nudge
      if (nudgeIndex < nudges.length - 1) {
        setNudgeIndex(nudgeIndex + 1);
        setCurrentNudge(nudges[nudgeIndex + 1]);
      } else {
        setCurrentNudge(null);
      }
    }
  });

  const actionNudgeMutation = useMutation({
    mutationFn: async (nudgeId) => {
      if (!onboardingProfile) return;
      
      return base44.entities.UserOnboardingProfile.update(onboardingProfile.id, {
        nudges: {
          ...onboardingProfile.nudges,
          actioned_nudges: [
            ...(onboardingProfile.nudges?.actioned_nudges || []),
            nudgeId
          ]
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-profile'] });
      dismissNudgeMutation.mutate(currentNudge?.id);
    }
  });

  // Set initial nudge
  useEffect(() => {
    if (nudges.length > 0 && !currentNudge) {
      setCurrentNudge(nudges[0]);
    }
  }, [nudges]);

  if (!currentNudge || !onboardingProfile) return null;

  const handleAction = () => {
    actionNudgeMutation.mutate(currentNudge.id);
    
    // Navigate to target page if specified
    if (currentNudge.targetPage) {
      window.location.href = createPageUrl(currentNudge.targetPage);
    }
  };

  const handleDismiss = () => {
    dismissNudgeMutation.mutate(currentNudge.id);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 15 }}
        className="fixed bottom-6 right-6 max-w-sm bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-40"
      >
        {/* Gradient top bar */}
        <div className="h-1 bg-gradient-to-r from-[#8b85f7] to-[#00b7eb]" />

        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-[#8b85f7] flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">
                {currentNudge.message}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismiss}
              className="text-xs flex-1"
              disabled={dismissNudgeMutation.isPending}
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              className="bg-[#8b85f7] hover:bg-[#7a75e8] text-xs flex-1"
              onClick={handleAction}
              disabled={actionNudgeMutation.isPending}
            >
              {currentNudge.actionLabel}
            </Button>
          </div>

          {/* Nudge counter */}
          {nudges.length > 1 && (
            <div className="flex gap-1 justify-center pt-1">
              {nudges.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-1.5 rounded-full transition-colors ${
                    i === nudgeIndex ? 'bg-[#8b85f7]' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}