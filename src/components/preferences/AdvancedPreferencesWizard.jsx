import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DealCriteriaStep from './steps/DealCriteriaStep';
import PortfolioGoalsStep from './steps/PortfolioGoalsStep';
import IntegrationPreferencesStep from './steps/IntegrationPreferencesStep';
import { CheckCircle2 } from 'lucide-react';

const STEPS = [
  { id: 'deal_criteria', title: 'Deal Criteria', component: DealCriteriaStep },
  { id: 'portfolio_goals', title: 'Portfolio Goals', component: PortfolioGoalsStep },
  { id: 'integrations', title: 'Tool Integrations', component: IntegrationPreferencesStep }
];

export default function AdvancedPreferencesWizard({ open, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({});
  const queryClient = useQueryClient();

  const { data: existingPrefs } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const prefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
      return prefs[0] || {};
    },
    enabled: open
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      const existing = await base44.entities.UserPreferences.filter({ created_by: user.email });
      
      if (existing.length > 0) {
        return base44.entities.UserPreferences.update(existing[0].id, data);
      } else {
        return base44.entities.UserPreferences.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      onClose();
    }
  });

  const StepComponent = STEPS[currentStep].component;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = (stepData) => {
    setPreferences(prev => ({ ...prev, ...stepData }));
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      updateMutation.mutate({ ...existingPrefs, ...preferences, ...stepData });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1a0f2e] border-[#2d1e50]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Advanced Preferences Setup</DialogTitle>
          <p className="text-sm text-gray-400">
            Fine-tune your deal matching and portfolio management
          </p>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">
              Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
            </span>
            <span className="text-gray-400">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                index < currentStep 
                  ? 'bg-green-500 border-green-500' 
                  : index === currentStep 
                    ? 'bg-[#8b85f7] border-[#8b85f7]' 
                    : 'border-[#2d1e50]'
              }`}>
                {index < currentStep ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-sm font-bold text-white">{index + 1}</span>
                )}
              </div>
              <span className={`text-sm ${index <= currentStep ? 'text-white' : 'text-gray-600'}`}>
                {step.title}
              </span>
            </div>
          ))}
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
            <StepComponent 
              onNext={handleNext}
              initialData={{ ...existingPrefs, ...preferences }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-[#2d1e50]">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          
          <div className="text-xs text-gray-500">
            {currentStep === STEPS.length - 1 ? 'Completing will save all preferences' : 'You can skip and return later'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}