import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import PathSelector from '@/components/onboarding/PathSelector';
import WelcomeStep from '@/components/onboarding/steps/WelcomeStep';
import DealSourcingStep from '@/components/onboarding/steps/ComprehensiveDealSourcingStep';
import PortfolioGoalsStep from '@/components/onboarding/steps/ComprehensivePortfolioGoalsStep';
import CommunityStep from '@/components/onboarding/steps/ComprehensiveCommunityStep';
import ReviewStep from '@/components/onboarding/steps/ReviewStep';
import { X } from 'lucide-react';
import { ONBOARDING_CONFIG } from '@/functions/onboardingFlowConfig';

const STEP_COMPONENTS = {
  WelcomeStep,
  DealSourcingStep,
  PortfolioGoalsStep,
  CommunityStep,
  ReviewStep
};

export default function AdvancedOnboardingWizard({ open = true, onComplete = null }) {
  const queryClient = useQueryClient();
  const [selectedPath, setSelectedPath] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [preferences, setPreferences] = useState({
    deal_sourcing: {},
    portfolio_goals: {},
    community: {}
  });

  const pathSteps = selectedPath 
    ? ONBOARDING_CONFIG.paths[selectedPath]?.steps?.map(id => 
        ONBOARDING_CONFIG.steps.find(s => s.id === id)
      ).filter(Boolean)
    : [];

  const currentStep = pathSteps[currentStepIndex];
  const progress = selectedPath ? ((currentStepIndex + 1) / pathSteps.length) * 100 : 0;

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      const user = await base44.auth.me();
      const existing = await base44.entities.UserOnboardingProfile.filter({ 
        user_email: user.email 
      });

      const data = {
        user_email: user.email,
        onboarding_path: selectedPath,
        completion_status: 'full_completed',
        preferences,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        ...profileData
      };

      if (existing.length > 0) {
        return base44.entities.UserOnboardingProfile.update(existing[0].id, data);
      } else {
        return base44.entities.UserOnboardingProfile.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-profile'] });
      onComplete?.(preferences);
    }
  });

  const handleStepComplete = (stepData) => {
    setPreferences(prev => ({
      ...prev,
      ...stepData
    }));
    setCompletedSteps([...completedSteps, currentStep.id]);

    if (currentStepIndex < pathSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < pathSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep.skippable) {
      handleNext();
    }
  };

  const handleFinalSubmit = async () => {
    await updateProfileMutation.mutateAsync({
      completed_steps: completedSteps
    });
  };

  // Not selected path yet - show path selector
  if (!selectedPath) {
    return (
      <Dialog open={open}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Welcome to FlashFusion</DialogTitle>
            <DialogDescription>
              AI-powered deal sourcing and portfolio management
            </DialogDescription>
          </DialogHeader>
          <PathSelector onSelectPath={setSelectedPath} />
        </DialogContent>
      </Dialog>
    );
  }

  // Show current step
  const StepComponent = currentStep?.component ? STEP_COMPONENTS[currentStep.component] : null;

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <button
            onClick={() => {}}
            className="absolute right-4 top-4 opacity-50 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
          <DialogTitle>{currentStep?.title}</DialogTitle>
          <DialogDescription>{currentStep?.description}</DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              Step {currentStepIndex + 1} of {pathSteps.length}
            </span>
            <span className="text-gray-600 text-xs">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep?.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {StepComponent && (
              <StepComponent
                onComplete={handleStepComplete}
                initialData={preferences}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-3 justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            Back
          </Button>

          <div className="flex gap-2">
            {currentStep?.skippable && (
              <Button
                variant="ghost"
                onClick={handleSkip}
              >
                Skip
              </Button>
            )}

            {currentStepIndex < pathSteps.length - 1 ? (
              <Button
                className="bg-[#8b85f7] hover:bg-[#7a75e8]"
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleFinalSubmit}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? 'Completing...' : 'Get Started'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}