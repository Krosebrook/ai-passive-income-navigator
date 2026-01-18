import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Hook to manage deferred setup prompts and user preferences
 * Tracks what setup items are incomplete and triggers prompts contextually
 */
export function useDeferredSetup() {
  const queryClient = useQueryClient();
  const [activePrompt, setActivePrompt] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  // Fetch user preferences
  const { data: preferences } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const prefs = await base44.entities.UserPreferences.filter({ 
        created_by: user.email 
      });
      return prefs[0] || null;
    }
  });

  // Update preferences mutation
  const updatePreferences = useMutation({
    mutationFn: async (updates) => {
      const user = await base44.auth.me();
      const existing = await base44.entities.UserPreferences.filter({ 
        created_by: user.email 
      });

      if (existing.length > 0) {
        return base44.entities.UserPreferences.update(existing[0].id, updates);
      } else {
        return base44.entities.UserPreferences.create({
          ...updates,
          has_completed_onboarding: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    }
  });

  // Check if a setup area is incomplete
  const isIncomplete = (setupType) => {
    if (!preferences) return true;

    switch (setupType) {
      case 'industries':
        return !preferences.target_industries || preferences.target_industries.length === 0;
      case 'deal_structures':
        return !preferences.preferred_deal_structures || preferences.preferred_deal_structures.length === 0;
      case 'geo_preferences':
        return !preferences.geo_preferences || preferences.geo_preferences.length === 0;
      case 'notifications':
        return !preferences.community_notification_frequency;
      default:
        return false;
    }
  };

  // Trigger a deferred setup prompt
  const triggerPrompt = (setupType, config) => {
    if (isIncomplete(setupType)) {
      setActivePrompt({ type: setupType, ...config });
    }
  };

  // Open setup modal
  const openSetupModal = (setupType) => {
    setActiveModal(setupType);
    setActivePrompt(null);
  };

  // Close prompt
  const closePrompt = () => {
    setActivePrompt(null);
  };

  // Close modal
  const closeModal = () => {
    setActiveModal(null);
  };

  // Complete setup
  const completeSetup = async (updates) => {
    await updatePreferences.mutateAsync(updates);
    closeModal();
  };

  return {
    preferences,
    activePrompt,
    activeModal,
    isIncomplete,
    triggerPrompt,
    openSetupModal,
    closePrompt,
    closeModal,
    completeSetup
  };
}