import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, Check, Sparkles, Loader2 } from 'lucide-react';

import WelcomeStep from './steps/WelcomeStep';
import ComprehensiveDealSourcingStep from './steps/ComprehensiveDealSourcingStep';
import ComprehensivePortfolioGoalsStep from './steps/ComprehensivePortfolioGoalsStep';
import ComprehensiveCommunityStep from './steps/ComprehensiveCommunityStep';
import AdvancedModulesStep from './steps/AdvancedModulesStep';
import ReviewStep from './steps/ReviewStep';
import CompleteStep from './steps/CompleteStep';

const STEPS = [
  { id: 'welcome', title: 'Welcome!', component: WelcomeStep },
  { id: 'deal_sourcing', title: 'Deal Sourcing Criteria', component: ComprehensiveDealSourcingStep },
  { id: 'portfolio_goals', title: 'Portfolio Goals', component: ComprehensivePortfolioGoalsStep },
  { id: 'community', title: 'Community Preferences', component: ComprehensiveCommunityStep },
  { id: 'advanced_modules', title: 'Advanced Learning (Optional)', component: AdvancedModulesStep, optional: true },
  { id: 'review', title: 'Review & Confirm', component: ReviewStep },
  { id: 'complete', title: 'All Set!', component: CompleteStep }
];

export default function EnhancedOnboardingWizard({ open, onComplete }) {
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    // Basic
    passive_income_goal: 'side_income',
    time_commitment: 2,
    risk_tolerance: 'moderate',
    existing_skills: [],
    
    // Deal Sourcing
    target_industries: [],
    investment_size_min: 1000,
    investment_size_max: 50000,
    preferred_deal_structures: [],
    geo_preferences: [],
    
    // Portfolio Goals
    time_horizon: 'medium_term',
    target_return_percentage: 20,
    diversification_preference: 'moderately_diversified',
    sector_priorities: [],
    asset_class_priorities: [],
    
    // Community
    peer_group_interests: [],
    networking_vs_knowledge: 'balanced',
    community_notification_frequency: 'weekly',
    profile_visibility: 'network_only',
    allow_collaboration_requests: true,
    
    // Advanced Modules (optional)
    advanced_modules: []
  });

  const progress = ((step + 1) / STEPS.length) * 100;
  const CurrentStepComponent = STEPS[step].component;

  const updatePreferences = (updates) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      // Save preferences
      await base44.entities.UserPreferences.create({
        ...preferences,
        has_completed_onboarding: true
      });

      // Update user onboarding status
      await base44.auth.updateMe({
        has_completed_onboarding: true
      });

      // Generate personalized onboarding nudges
      try {
        await base44.functions.invoke('generateOnboardingNudges', {});
      } catch (error) {
        console.error('Failed to generate nudges:', error);
      }

      toast.success('Welcome to the platform!');
      onComplete?.(preferences);
    } catch (error) {
      console.error('Failed to save onboarding:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const canProceed = () => {
    switch (STEPS[step].id) {
      case 'welcome':
        return true;
      case 'deal_sourcing':
        return preferences.target_industries.length > 0;
      case 'portfolio_goals':
        return preferences.target_return_percentage > 0;
      case 'community':
        return true;
      case 'review':
        return true;
      case 'complete':
        return true;
      default:
        return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0" hideCloseButton>
        {/* Progress Bar */}
        <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b">
          <Progress value={progress} className="h-2 mb-3" />
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Step {step + 1} of {STEPS.length}</p>
              <h2 className="text-2xl font-bold text-gray-900">{STEPS[step].title}</h2>
            </div>
            {step > 0 && step < STEPS.length - 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(STEPS.length - 2)}
                className="text-gray-500"
              >
                Skip to review
              </Button>
            )}
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentStepComponent
                preferences={preferences}
                updatePreferences={updatePreferences}
                onNext={handleNext}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0 || isSaving}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSaving}
            className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0] hover:from-[#9a95ff] hover:to-[#6b4fff] gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : step === STEPS.length - 1 ? (
              <>
                <Check className="w-4 h-4" />
                Complete Setup
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}