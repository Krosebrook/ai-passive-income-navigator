import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Zap, BookOpen, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const QUICK_START_STEPS = [
  {
    id: 'goal',
    title: 'Your Primary Goal',
    question: 'What are you looking to achieve?',
    why: 'Understanding your goal helps us prioritize the right opportunities and features for you.',
    options: [
      { value: 'passive_income', label: 'Generate Passive Income', icon: '💰' },
      { value: 'capital_growth', label: 'Grow Capital', icon: '📈' },
      { value: 'learn_deals', label: 'Learn Deal Sourcing', icon: '🎓' },
      { value: 'explore_only', label: 'Just Exploring', icon: '🔍' }
    ]
  },
  {
    id: 'timeline',
    title: 'Your Timeline',
    question: 'When do you want to see results?',
    why: 'Your timeline determines which opportunities we prioritize - quick wins vs long-term plays.',
    options: [
      { value: '1_month', label: '1 Month', icon: '⚡' },
      { value: '3_months', label: '3 Months', icon: '🎯' },
      { value: '6_months', label: '6 Months', icon: '📅' },
      { value: '1_year', label: '1+ Years', icon: '🌱' }
    ]
  },
  {
    id: 'capital',
    title: 'Available Capital',
    question: 'How much can you invest?',
    why: 'We\'ll match you with deals that fit your budget and show the best potential returns.',
    options: [
      { value: 'under_5k', label: 'Under $5K', icon: '💵' },
      { value: '5k_25k', label: '$5K - $25K', icon: '💸' },
      { value: '25k_100k', label: '$25K - $100K', icon: '💰' },
      { value: 'over_100k', label: '$100K+', icon: '💎' }
    ]
  }
];

const COMPREHENSIVE_STEPS = [
  ...QUICK_START_STEPS,
  {
    id: 'risk',
    title: 'Risk Tolerance',
    question: 'How do you feel about risk?',
    why: 'This helps us balance your portfolio between safe, steady returns and higher-risk opportunities.',
    options: [
      { value: 'conservative', label: 'Conservative', icon: '🛡️', desc: 'Prioritize stability' },
      { value: 'moderate', label: 'Moderate', icon: '⚖️', desc: 'Balanced approach' },
      { value: 'aggressive', label: 'Aggressive', icon: '🚀', desc: 'Maximum growth' }
    ]
  },
  {
    id: 'industries',
    title: 'Industry Interests',
    question: 'Which industries interest you?',
    why: 'Focus on sectors you understand or want to learn about for better decision-making.',
    multiSelect: true,
    options: [
      { value: 'technology', label: 'Technology', icon: '💻' },
      { value: 'real_estate', label: 'Real Estate', icon: '🏠' },
      { value: 'ecommerce', label: 'E-commerce', icon: '🛒' },
      { value: 'saas', label: 'SaaS', icon: '☁️' },
      { value: 'finance', label: 'Finance', icon: '🏦' },
      { value: 'healthcare', label: 'Healthcare', icon: '⚕️' }
    ]
  }
];

export default function EnhancedOnboardingFlow({ open, onClose }) {
  const [pathChoice, setPathChoice] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const queryClient = useQueryClient();

  const steps = pathChoice === 'quick' ? QUICK_START_STEPS : COMPREHENSIVE_STEPS;
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      const existing = await base44.entities.UserPreferences.filter({ created_by: user.email });
      
      if (existing.length > 0) {
        return base44.entities.UserPreferences.update(existing[0].id, {
          ...data,
          has_completed_onboarding: true
        });
      } else {
        return base44.entities.UserPreferences.create({
          ...data,
          has_completed_onboarding: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      onClose();
    }
  });

  const handleAnswer = (value) => {
    if (currentStepData.multiSelect) {
      const current = answers[currentStepData.id] || [];
      const newValue = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      setAnswers({ ...answers, [currentStepData.id]: newValue });
    } else {
      setAnswers({ ...answers, [currentStepData.id]: value });
      
      if (currentStep < steps.length - 1) {
        setTimeout(() => setCurrentStep(currentStep + 1), 300);
      } else {
        saveMutation.mutate(answers);
      }
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      saveMutation.mutate(answers);
    }
  };

  if (!pathChoice) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl bg-[#1a0f2e] border-[#2d1e50]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">Welcome to FlashFusion! 👋</DialogTitle>
            <p className="text-gray-400 text-center mt-2">
              Let's get you set up. Choose your path:
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <motion.button
              onClick={() => setPathChoice('quick')}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-xl border-2 border-[#8b85f7] bg-[#8b85f7]/10 text-left hover:bg-[#8b85f7]/20 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-[#8b85f7] flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Quick Start</h3>
                  <p className="text-sm text-gray-400">2 minutes</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-3">
                Answer 3 quick questions and start finding deals immediately
              </p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>✓ Your primary goal</li>
                <li>✓ Timeline & budget</li>
                <li>✓ Instant AI recommendations</li>
              </ul>
            </motion.button>

            <motion.button
              onClick={() => setPathChoice('comprehensive')}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-xl border-2 border-[#00b7eb] bg-[#00b7eb]/10 text-left hover:bg-[#00b7eb]/20 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-[#00b7eb] flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Comprehensive Setup</h3>
                  <p className="text-sm text-gray-400">5 minutes</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-3">
                Deep dive into your preferences for personalized matching
              </p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>✓ All Quick Start questions</li>
                <li>✓ Risk tolerance & diversification</li>
                <li>✓ Industry preferences</li>
                <li>✓ Advanced filtering</li>
              </ul>
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#1a0f2e] border-[#2d1e50]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{currentStepData.title}</DialogTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <HelpCircle className="w-5 h-5 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-[#0f0618] border-[#2d1e50]">
                  <p className="text-sm">{currentStepData.why}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-gray-400 mt-2">{currentStepData.question}</p>
        </DialogHeader>

        <Progress value={progress} className="h-2 mb-4" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            {currentStepData.options.map((option) => {
              const isSelected = currentStepData.multiSelect
                ? (answers[currentStepData.id] || []).includes(option.value)
                : answers[currentStepData.id] === option.value;

              return (
                <motion.button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  whileHover={{ scale: 1.02 }}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-[#8b85f7] bg-[#8b85f7]/20'
                      : 'border-[#2d1e50] hover:border-[#8b85f7]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{option.icon}</span>
                    <div>
                      <div className="font-medium text-white">{option.label}</div>
                      {option.desc && (
                        <div className="text-sm text-gray-400">{option.desc}</div>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {currentStepData.multiSelect && (
          <div className="flex justify-between pt-4 border-t border-[#2d1e50]">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="bg-[#8b85f7] hover:bg-[#7a75e8]"
            >
              Continue
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}