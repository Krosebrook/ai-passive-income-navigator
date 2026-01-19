import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, ArrowRight, Check, Target, TrendingUp, 
  Brain, Rocket, ChevronRight
} from 'lucide-react';
import WelcomeStep from './interactive-steps/WelcomeStep';
import QuickPreferencesStep from './interactive-steps/QuickPreferencesStep';
import FeatureTourStep from './interactive-steps/FeatureTourStep';
import FirstGoalStep from './interactive-steps/FirstGoalStep';
import CompletionStep from './interactive-steps/CompletionStep';

const STEPS = [
  { id: 'welcome', title: 'Welcome', component: WelcomeStep },
  { id: 'preferences', title: 'Quick Setup', component: QuickPreferencesStep },
  { id: 'features', title: 'Feature Tour', component: FeatureTourStep },
  { id: 'goal', title: 'First Goal', component: FirstGoalStep },
  { id: 'complete', title: 'Ready!', component: CompletionStep }
];

export default function InteractiveOnboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const queryClient = useQueryClient();

  const { data: preferences } = useQuery({
    queryKey: ['user-preferences-onboarding'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const prefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
      return prefs[0];
    }
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      const existingPrefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
      
      if (existingPrefs.length > 0) {
        return base44.entities.UserPreferences.update(existingPrefs[0].id, data);
      } else {
        return base44.entities.UserPreferences.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences-onboarding'] });
    }
  });

  useEffect(() => {
    // Show onboarding if user hasn't completed it
    if (preferences && !preferences.has_completed_onboarding) {
      setIsOpen(true);
    }
  }, [preferences]);

  const handleNext = (stepData) => {
    setUserData({ ...userData, ...stepData });
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    // Save all collected data
    await updatePreferencesMutation.mutateAsync({
      ...userData,
      has_completed_onboarding: true
    });

    setIsOpen(false);
    if (onComplete) onComplete();
  };

  const CurrentStepComponent = STEPS[currentStep].component;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl bg-[#0f0618] border-[#2d1e50] p-0 overflow-hidden">
        <div className="relative">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#1a0f2e]">
            <motion.div
              className="h-full bg-gradient-to-r from-[#8b85f7] to-[#00b7eb]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-[#2d1e50]">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 ${
                  index <= currentStep ? 'text-[#8b85f7]' : 'text-gray-600'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    index < currentStep
                      ? 'bg-[#8b85f7] border-[#8b85f7]'
                      : index === currentStep
                      ? 'border-[#8b85f7] bg-[#8b85f7]/20'
                      : 'border-gray-600 bg-transparent'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>
                <span className="text-sm font-medium hidden md:block">{step.title}</span>
                {index < STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 ml-2 hidden lg:block" />
                )}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CurrentStepComponent
                  onNext={handleNext}
                  onComplete={handleComplete}
                  userData={userData}
                  isLastStep={currentStep === STEPS.length - 1}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}