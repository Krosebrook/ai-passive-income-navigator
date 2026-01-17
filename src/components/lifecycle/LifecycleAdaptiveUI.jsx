import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Applies adaptive UI settings based on lifecycle state
 * Manages tutorials, guidance density, feature prominence
 */
export default function LifecycleAdaptiveUI({ children }) {
  const [adaptiveSettings, setAdaptiveSettings] = useState({
    show_tutorials: true,
    insight_density: 'medium',
    guidance_mode: 'hands_on',
    feature_prominence: 'activation_focused'
  });

  // Fetch lifecycle state
  const { data: lifecycleState } = useQuery({
    queryKey: ['lifecycle-state'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        const states = await base44.entities.LifecycleState.filter({
          user_email: user.email
        });
        return states[0] || null;
      } catch {
        return null;
      }
    }
  });

  // Update adaptive settings when state changes
  useEffect(() => {
    if (!lifecycleState) return;

    const state = lifecycleState.current_state;
    const stateSettings = {
      new: {
        show_tutorials: true,
        guidance_mode: 'hands_on',
        insight_density: 'low',
        feature_prominence: 'activation_focused'
      },
      activated: {
        show_tutorials: true,
        guidance_mode: 'balanced',
        insight_density: 'medium',
        feature_prominence: 'early_wins'
      },
      engaged: {
        show_tutorials: false,
        guidance_mode: 'balanced',
        insight_density: 'medium',
        feature_prominence: 'capability_unlocks'
      },
      power_user: {
        show_tutorials: false,
        guidance_mode: 'autonomous',
        insight_density: 'high',
        feature_prominence: 'advanced_features'
      },
      at_risk: {
        show_tutorials: false,
        guidance_mode: 'hands_on',
        insight_density: 'low',
        feature_prominence: 'value_reminders'
      },
      dormant: {
        show_tutorials: false,
        guidance_mode: 'minimal',
        insight_density: 'low',
        feature_prominence: 'reactivation_path'
      },
      returning: {
        show_tutorials: false,
        guidance_mode: 'balanced',
        insight_density: 'medium',
        feature_prominence: 'context_restore'
      }
    };

    setAdaptiveSettings(stateSettings[state] || stateSettings.new);
  }, [lifecycleState]);

  // Apply settings via data attributes
  return (
    <div
      data-lifecycle-state={lifecycleState?.current_state}
      data-show-tutorials={adaptiveSettings.show_tutorials}
      data-guidance-mode={adaptiveSettings.guidance_mode}
      data-insight-density={adaptiveSettings.insight_density}
      data-feature-prominence={adaptiveSettings.feature_prominence}
    >
      {children}
    </div>
  );
}