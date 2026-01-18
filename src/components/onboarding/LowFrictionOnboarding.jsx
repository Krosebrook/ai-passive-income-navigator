import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import OutcomeSelector from './OutcomeSelector';
import QuickProfileStep from './QuickProfileStep';
import ValueExposureCard from './ValueExposureCard';
import { Sparkles } from 'lucide-react';

const STEPS = {
  OUTCOME: 'outcome',
  QUICK_PROFILE: 'quick_profile',
  VALUE_EXPOSURE: 'value_exposure',
  COMPLETE: 'complete'
};

export default function LowFrictionOnboarding({ open = true, onComplete }) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(STEPS.OUTCOME);
  const [outcome, setOutcome] = useState(null);
  const [profile, setProfile] = useState({});
  const [startTime] = useState(Date.now());

  // Check if user already has preferences (skip onboarding)
  const { data: existingPrefs } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const prefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
      return prefs.length > 0 ? prefs[0] : null;
    }
  });

  // Check if user has incomplete onboarding state (resume)
  const { data: onboardingState } = useQuery({
    queryKey: ['onboarding-state'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const states = await base44.entities.OnboardingState.filter({ 
        user_email: user.email,
        activation_status: 'in_progress'
      });
      return states.length > 0 ? states[0] : null;
    }
  });

  // Sample deal for value exposure
  const sampleDeal = {
    title: 'SaaS Revenue Share Opportunity',
    description: 'Profitable email marketing SaaS with $50k MRR seeking growth partner',
    match_score: 87,
    roi: '45%',
    timeline: '18 mo',
    risk_level: profile.risk_tolerance === 'conservative' ? 'Low' : 'Medium'
  };

  // Create/update onboarding state
  const updateStateMutation = useMutation({
    mutationFn: async (stateData) => {
      const user = await base44.auth.me();
      const existing = await base44.entities.OnboardingState.filter({ 
        user_email: user.email,
        activation_status: 'in_progress'
      });

      const data = {
        user_email: user.email,
        started_at: existing.length > 0 ? existing[0].started_at : new Date().toISOString(),
        entry_mode: outcome ? 'outcome_first' : 'standard',
        selected_outcome: outcome,
        inferred_assumptions: outcome ? getInferredAssumptions(outcome) : null,
        activation_status: 'in_progress',
        ...stateData
      };

      if (existing.length > 0) {
        return base44.entities.OnboardingState.update(existing[0].id, data);
      } else {
        return base44.entities.OnboardingState.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-state'] });
    }
  });

  // Complete onboarding (first value action)
  const completeMutation = useMutation({
    mutationFn: async (firstValueAction) => {
      const user = await base44.auth.me();
      const timeToValue = Math.floor((Date.now() - startTime) / 1000);

      // Update onboarding state
      await updateStateMutation.mutateAsync({
        completed_at: new Date().toISOString(),
        first_value_action: firstValueAction,
        time_to_first_value_seconds: timeToValue,
        activation_status: 'value_achieved',
        transitioned_to_activation: true
      });

      // Create/update user preferences
      const existingPrefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
      const prefData = {
        has_completed_onboarding: true,
        time_commitment: profile.time_commitment,
        risk_tolerance: profile.risk_tolerance,
        ...getInferredAssumptions(outcome)
      };

      if (existingPrefs.length > 0) {
        await base44.entities.UserPreferences.update(existingPrefs[0].id, prefData);
      } else {
        await base44.entities.UserPreferences.create(prefData);
      }

      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      onComplete?.({ outcome, profile, timeToValue });
    }
  });

  const getInferredAssumptions = (outcomeId) => {
    const mappings = {
      passive_income: {
        time_commitment: 2,
        risk_tolerance: 'moderate',
        time_horizon: 'medium_term',
        diversification_preference: 'moderately_diversified'
      },
      capital_growth: {
        time_commitment: 2,
        risk_tolerance: 'aggressive',
        time_horizon: 'long_term',
        diversification_preference: 'focused'
      },
      learn_deals: {
        time_commitment: 3,
        risk_tolerance: 'conservative',
        time_horizon: 'medium_term',
        diversification_preference: 'highly_diversified'
      },
      explore_only: {
        time_commitment: 1,
        risk_tolerance: 'conservative',
        time_horizon: 'short_term',
        diversification_preference: 'highly_diversified'
      }
    };
    return mappings[outcomeId] || null;
  };

  const handleOutcomeSelect = (selectedOutcome) => {
    setOutcome(selectedOutcome);
    setCurrentStep(STEPS.QUICK_PROFILE);
    updateStateMutation.mutate({
      selected_outcome: selectedOutcome,
      inferred_assumptions: getInferredAssumptions(selectedOutcome),
      completed_steps: [{ step_id: 'outcome', completed_at: new Date().toISOString() }]
    });
  };

  const handleOutcomeSkip = () => {
    setCurrentStep(STEPS.QUICK_PROFILE);
    updateStateMutation.mutate({
      entry_mode: 'standard',
      skipped_steps: ['outcome']
    });
  };

  const handleProfileComplete = (profileData) => {
    setProfile(profileData);
    setCurrentStep(STEPS.VALUE_EXPOSURE);
    updateStateMutation.mutate({
      completed_steps: [
        { step_id: 'outcome', completed_at: new Date().toISOString() },
        { step_id: 'quick_profile', completed_at: new Date().toISOString(), data_collected: profileData }
      ]
    });
  };

  const handleDealSave = async () => {
    // Create portfolio idea from sample deal
    await base44.entities.PortfolioIdea.create({
      title: sampleDeal.title,
      description: sampleDeal.description,
      status: 'exploring',
      priority: 'high',
      is_generated: true
    });

    // Complete onboarding
    completeMutation.mutate({
      type: 'deal_saved',
      triggered_at: new Date().toISOString(),
      entity_id: 'sample_deal_1',
      entity_type: 'PortfolioIdea'
    });
  };

  const handleViewAnalysis = () => {
    completeMutation.mutate({
      type: 'analysis_viewed',
      triggered_at: new Date().toISOString(),
      entity_id: 'sample_deal_1'
    });
  };

  // Skip onboarding if user already has preferences
  useEffect(() => {
    if (existingPrefs?.has_completed_onboarding) {
      onComplete?.({ skipped: true, reason: 'already_completed' });
    }
  }, [existingPrefs, onComplete]);

  const stepProgress = {
    [STEPS.OUTCOME]: 25,
    [STEPS.QUICK_PROFILE]: 50,
    [STEPS.VALUE_EXPOSURE]: 75,
    [STEPS.COMPLETE]: 100
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0f0618] border-[#2d1e50]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">FlashFusion Setup</h2>
            <p className="text-sm text-[#64748b]">~5 minutes to your first opportunity</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={stepProgress[currentStep]} className="h-2" />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === STEPS.OUTCOME && (
              <OutcomeSelector onSelect={handleOutcomeSelect} onSkip={handleOutcomeSkip} />
            )}

            {currentStep === STEPS.QUICK_PROFILE && (
              <QuickProfileStep onComplete={handleProfileComplete} initialData={profile} />
            )}

            {currentStep === STEPS.VALUE_EXPOSURE && (
              <ValueExposureCard 
                deal={sampleDeal}
                outcome={outcome}
                onSave={handleDealSave}
                onViewAnalysis={handleViewAnalysis}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}