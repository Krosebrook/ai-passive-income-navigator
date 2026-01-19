import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import WelcomeStep from './wizard-steps/WelcomeStep';
import GoalInputStep from './wizard-steps/GoalInputStep';
import PersonalizedStep from './wizard-steps/PersonalizedStep';
import PreferencesStep from './wizard-steps/PreferencesStep';
import FeatureTourStep from './wizard-steps/FeatureTourStep';
import FirstDealStep from './wizard-steps/FirstDealStep';
import CompletionStep from './wizard-steps/CompletionStep';

const STEPS = [
  { id: 'welcome', component: WelcomeStep, canSkip: false },
  { id: 'goal_input', component: GoalInputStep, canSkip: false },
  { id: 'personalized', component: PersonalizedStep, canSkip: false },
  { id: 'preferences', component: PreferencesStep, canSkip: true },
  { id: 'feature_tour', component: FeatureTourStep, canSkip: true },
  { id: 'first_deal', component: FirstDealStep, canSkip: false },
  { id: 'completion', component: CompletionStep, canSkip: false }
];

export default function AIOnboardingWizard({ isOpen, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const CurrentStepComponent = STEPS[currentStep].component;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = async (stepData) => {
    setWizardData(prev => ({ ...prev, ...stepData }));

    // If goal input step, get AI personalization
    if (STEPS[currentStep].id === 'goal_input') {
      setIsLoading(true);
      try {
        const result = await base44.functions.invoke('personalizeOnboarding', stepData);
        setWizardData(prev => ({ 
          ...prev, 
          personalization: result.data.personalization 
        }));
      } catch (error) {
        toast.error('Failed to personalize onboarding');
      } finally {
        setIsLoading(false);
      }
    }

    // If preferences step, save preferences
    if (STEPS[currentStep].id === 'preferences' && stepData.preferences) {
      try {
        await base44.entities.UserPreferences.create(stepData.preferences);
        queryClient.invalidateQueries(['user-preferences']);
      } catch (error) {
        console.error('Failed to save preferences:', error);
      }
    }

    // Move to next step
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (STEPS[currentStep].canSkip) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleComplete = async () => {
    try {
      // Mark onboarding as completed
      const states = await base44.entities.OnboardingState.filter({
        created_by: (await base44.auth.me()).email
      });

      if (states.length > 0) {
        await base44.entities.OnboardingState.update(states[0].id, {
          completed_at: new Date().toISOString(),
          activation_status: 'value_achieved'
        });
      }

      // Update user preferences to mark onboarding complete
      const prefs = await base44.entities.UserPreferences.filter({
        created_by: (await base44.auth.me()).email
      });

      if (prefs.length > 0) {
        await base44.entities.UserPreferences.update(prefs[0].id, {
          has_completed_onboarding: true
        });
      }

      queryClient.invalidateQueries();
      toast.success('Welcome to FlashFusion! 🎉');
      onComplete();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      onComplete();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-3xl bg-[#1a0f2e] border-[#2d1e50] text-white p-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Progress Bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#8b85f7]" />
              <span className="text-sm font-medium text-gray-400">
                Step {currentStep + 1} of {STEPS.length}
              </span>
            </div>
            <span className="text-sm text-[#8b85f7] font-semibold">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-[#0f0618]" />
        </div>

        {/* Step Content */}
        <div className="p-6 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentStepComponent
                data={wizardData}
                onNext={handleNext}
                onBack={handleBack}
                onSkip={handleSkip}
                isLoading={isLoading}
                canSkip={STEPS[currentStep].canSkip}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}