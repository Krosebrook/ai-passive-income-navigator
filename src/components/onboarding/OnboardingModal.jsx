import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Rocket, Target, Clock, DollarSign, Zap, 
  ChevronRight, ChevronLeft, Sparkles, Check
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to AI Passive Income',
    subtitle: 'Let\'s personalize your experience'
  },
  {
    id: 'goal',
    title: 'What\'s your income goal?',
    subtitle: 'Help us recommend the right opportunities'
  },
  {
    id: 'time',
    title: 'How much time can you invest?',
    subtitle: 'Weekly hours you can dedicate'
  },
  {
    id: 'risk',
    title: 'What\'s your risk tolerance?',
    subtitle: 'This helps us match you with suitable ideas'
  },
  {
    id: 'skills',
    title: 'What skills do you have?',
    subtitle: 'Select all that apply'
  },
  {
    id: 'complete',
    title: 'You\'re all set!',
    subtitle: 'Let\'s find your perfect passive income idea'
  }
];

const INCOME_GOALS = [
  { value: 'side_income', label: 'Side Income', amount: '$500-$1,000/mo', icon: DollarSign },
  { value: 'supplement', label: 'Supplement Job', amount: '$1,000-$3,000/mo', icon: Target },
  { value: 'replace_job', label: 'Replace My Job', amount: '$3,000-$10,000/mo', icon: Rocket },
  { value: 'financial_freedom', label: 'Financial Freedom', amount: '$10,000+/mo', icon: Zap }
];

const SKILLS = [
  'Writing & Content', 'Design & Graphics', 'Marketing', 'Programming',
  'Video & Audio', 'Sales', 'Data Analysis', 'Teaching',
  'Social Media', 'Photography', 'Finance', 'Project Management'
];

export default function OnboardingModal({ open, onComplete }) {
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState({
    passive_income_goal: '',
    time_commitment: 2,
    risk_tolerance: 2,
    existing_skills: []
  });

  const progress = ((step + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete?.(preferences);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const toggleSkill = (skill) => {
    setPreferences(prev => ({
      ...prev,
      existing_skills: prev.existing_skills.includes(skill)
        ? prev.existing_skills.filter(s => s !== skill)
        : [...prev.existing_skills, skill]
    }));
  };

  const renderStepContent = () => {
    switch (STEPS[step].id) {
      case 'welcome':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              We'll ask you a few questions to personalize your experience and recommend the best passive income opportunities for you.
            </p>
          </motion.div>
        );

      case 'goal':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4"
          >
            {INCOME_GOALS.map((goal) => {
              const Icon = goal.icon;
              const isSelected = preferences.passive_income_goal === goal.value;
              return (
                <button
                  key={goal.value}
                  onClick={() => setPreferences(prev => ({ ...prev, passive_income_goal: goal.value }))}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    isSelected 
                      ? 'border-violet-500 bg-violet-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-violet-600' : 'text-gray-400'}`} />
                  <h4 className="font-semibold text-gray-900 mb-1">{goal.label}</h4>
                  <p className="text-sm text-gray-500">{goal.amount}</p>
                </button>
              );
            })}
          </motion.div>
        );

      case 'time':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8"
          >
            <div className="flex items-center justify-center gap-2 mb-8">
              <Clock className="w-8 h-8 text-violet-600" />
              <span className="text-4xl font-bold text-gray-900">
                {['1-5', '5-10', '10-20', '20-40', '40+'][preferences.time_commitment]} hours
              </span>
              <span className="text-xl text-gray-500">/week</span>
            </div>
            <Slider
              value={[preferences.time_commitment]}
              onValueChange={([value]) => setPreferences(prev => ({ ...prev, time_commitment: value }))}
              max={4}
              step={1}
              className="w-full max-w-md mx-auto"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-4 max-w-md mx-auto">
              <span>Minimal</span>
              <span>Full-time</span>
            </div>
          </motion.div>
        );

      case 'risk':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8"
          >
            <div className="text-center mb-8">
              <span className="text-4xl font-bold bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 bg-clip-text text-transparent">
                {['Very Conservative', 'Conservative', 'Moderate', 'Aggressive', 'Very Aggressive'][preferences.risk_tolerance]}
              </span>
            </div>
            <Slider
              value={[preferences.risk_tolerance]}
              onValueChange={([value]) => setPreferences(prev => ({ ...prev, risk_tolerance: value }))}
              max={4}
              step={1}
              className="w-full max-w-md mx-auto"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-4 max-w-md mx-auto">
              <span>Low Risk</span>
              <span>High Risk</span>
            </div>
          </motion.div>
        );

      case 'skills':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SKILLS.map((skill) => {
                const isSelected = preferences.existing_skills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      isSelected 
                        ? 'border-violet-500 bg-violet-50 text-violet-700' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <Check className="w-12 h-12 text-white" />
            </div>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              Based on your preferences, we've prepared personalized recommendations just for you.
            </p>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden" hideCloseButton>
        {/* Progress */}
        <div className="px-6 pt-6">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500 mt-2">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {STEPS[step].title}
          </h2>
          <p className="text-gray-500">{STEPS[step].subtitle}</p>
          
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 gap-2"
          >
            {step === STEPS.length - 1 ? 'Get Started' : 'Continue'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}