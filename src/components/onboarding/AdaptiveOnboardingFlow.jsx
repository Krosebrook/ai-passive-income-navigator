import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import WelcomeStep from './adaptive-steps/WelcomeStep';
import PreferencesStep from './adaptive-steps/PreferencesStep';
import RiskProfileStep from './adaptive-steps/RiskProfileStep';
import FeatureIntroStep from './adaptive-steps/FeatureIntroStep';
import QuickStartStep from './adaptive-steps/QuickStartStep';
import CompletionStep from './adaptive-steps/CompletionStep';

export default function AdaptiveOnboardingFlow({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({});
  const [personalizedSteps, setPersonalizedSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      initializeOnboarding();
    }
  }, [isOpen]);

  async function initializeOnboarding() {
    try {
      const user = await base44.auth.me();
      const existingState = await base44.entities.OnboardingState.filter({
        user_email: user.email
      });

      if (existingState.length > 0) {
        const state = existingState[0];
        setOnboardingData(state);
        setCurrentStep(state.completed_steps?.length || 0);
      } else {
        // Create new onboarding state
        const newState = await base44.entities.OnboardingState.create({
          user_email: user.email,
          started_at: new Date().toISOString(),
          activation_status: 'in_progress'
        });
        setOnboardingData(newState);
      }
    } catch (error) {
      console.error('Error initializing onboarding:', error);
    }
  }

  async function generatePersonalizedFlow(preferences) {
    setIsLoading(true);
    try {
      // Generate personalized step sequence based on preferences
      const baseSteps = [
      { id: 'welcome', component: WelcomeStep },
      { id: 'preferences', component: PreferencesStep },
      { id: 'risk_profile', component: RiskProfileStep }];


      // Add feature intros based on risk tolerance
      const featureSteps = [];
      if (preferences.risk_tolerance === 'conservative' || preferences.risk_tolerance === 'very_conservative') {
        featureSteps.push({
          id: 'feature_analysis',
          component: FeatureIntroStep,
          props: { feature: 'analysis', title: 'AI Analysis Tools', description: 'Learn how to use detailed deal analysis' }
        });
      } else {
        featureSteps.push({
          id: 'feature_sourcing',
          component: FeatureIntroStep,
          props: { feature: 'sourcing', title: 'Deal Sourcing', description: 'Discover how to source high-potential deals' }
        });
      }

      // Add quick-start based on goals
      featureSteps.push({
        id: 'quick_start',
        component: QuickStartStep,
        props: { preferences }
      });

      const allSteps = [...baseSteps, ...featureSteps, { id: 'completion', component: CompletionStep }];
      setPersonalizedSteps(allSteps);
    } catch (error) {
      console.error('Error generating personalized flow:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStepComplete(stepData) {
    try {
      const user = await base44.auth.me();
      const updatedSteps = [...(onboardingData.completed_steps || []), {
        step_id: personalizedSteps[currentStep]?.id,
        completed_at: new Date().toISOString(),
        data_collected: stepData
      }];

      await base44.entities.OnboardingState.update(onboardingData.id, {
        completed_steps: updatedSteps
      });

      // Generate personalized flow after preferences step
      if (currentStep === 1 && stepData) {
        await generatePersonalizedFlow(stepData);
      }

      // Award points for completing onboarding steps
      await base44.functions.invoke('awardPoints', {
        event_type: 'profile_completed',
        points: 50,
        description: `Completed onboarding step: ${personalizedSteps[currentStep]?.id}`
      });

      if (currentStep < personalizedSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Mark onboarding as complete
        await base44.entities.OnboardingState.update(onboardingData.id, {
          completed_at: new Date().toISOString(),
          activation_status: 'value_achieved'
        });
        onClose();
      }
    } catch (error) {
      console.error('Error completing step:', error);
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  if (personalizedSteps.length === 0) {
    generatePersonalizedFlow({});
    return null;
  }

  const CurrentStepComponent = personalizedSteps[currentStep]?.component;
  const stepProps = personalizedSteps[currentStep]?.props || {};
  const progress = (currentStep + 1) / personalizedSteps.length * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#3e2370] p-6 opacity-100 rounded fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-w-3xl border-[#2d1e50] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-orange-300 text-2xl font-bold tracking-tight flex items-center gap-2">Welcome to FlashFusion


          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Step {currentStep + 1} of {personalizedSteps.length}</span>
            <span className="text-[#8b85f7]">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}>

            {CurrentStepComponent &&
            <CurrentStepComponent
              onComplete={handleStepComplete}
              onBack={handleBack}
              canGoBack={currentStep > 0}
              isLoading={isLoading}
              {...stepProps} />

            }
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>);

}