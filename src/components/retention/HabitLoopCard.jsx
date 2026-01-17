import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Zap, TrendingUp, Users, ArrowRight, X } from 'lucide-react';

/**
 * Displays active habit loop with steps and reward messaging
 * Non-blocking, dismissible, progress-tracking
 */
export default function HabitLoopCard({ loop, onComplete, onDismiss }) {
  const [currentStep, setCurrentStep] = useState(0);

  const loopConfigs = {
    discovery_loop: {
      title: 'Deal Momentum',
      icon: Zap,
      color: 'from-[#8b85f7] to-[#6b4fff]',
      reward: 'Your deal feed just got smarter',
      momentum: loop?.momentum || 0
    },
    insight_loop: {
      title: 'Portfolio Intelligence',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      reward: 'You\'re on track',
      momentum: loop?.momentum || 0
    },
    social_proof_loop: {
      title: 'Community Value',
      icon: Users,
      color: 'from-sky-500 to-blue-600',
      reward: 'Your network sees your interests',
      momentum: loop?.momentum || 0
    }
  };

  const config = loopConfigs[loop?.id] || {};
  const Icon = config.icon;
  const steps = loop?.steps || [];

  if (steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.(loop.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <Card className="border-0 shadow-lg overflow-hidden">
        {/* Gradient header */}
        <div className={`h-1 bg-gradient-to-r ${config.color}`} />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex gap-3 items-start flex-1">
              {Icon && (
                <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color} text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg">{config.title}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <Progress value={progress} className="h-2 mt-3" />
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current step content */}
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="font-medium text-gray-900">
              {currentStepData?.name}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {currentStepData?.message}
            </p>
          </div>

          {/* Reward indicator */}
          {currentStep === steps.length - 1 && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <p className="text-sm font-medium text-emerald-900">
                ✓ {config.reward}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 justify-between">
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-xs"
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              className={`bg-gradient-to-r ${config.color} text-white text-xs gap-1`}
              onClick={handleNextStep}
            >
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>

          {/* Step indicators */}
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < currentStep
                    ? `bg-gradient-to-r ${config.color}`
                    : i === currentStep
                    ? `bg-gradient-to-r ${config.color}`
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}