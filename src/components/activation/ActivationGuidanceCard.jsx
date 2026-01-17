import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ChevronRight, CheckCircle2 } from 'lucide-react';

/**
 * Reusable guidance card component for activation paths
 * Non-blocking, dismissible, progress-tracking
 */
export default function ActivationGuidanceCard({
  title,
  subtitle,
  steps,
  currentStep,
  progress,
  onDismiss,
  onStepComplete
}) {
  const currentStepData = steps[currentStep];
  const Icon = currentStepData?.icon;

  return (
    <Card className="border-l-4 border-[#8b85f7] bg-gradient-to-r from-[#8b85f7]/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="h-1.5 mt-3" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current step */}
        <div className="flex gap-3 items-start p-3 rounded-lg bg-white/50">
          {Icon && (
            <Icon className="w-5 h-5 text-[#8b85f7] flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900">
              Step {currentStep + 1} of {steps.length}: {currentStepData?.title}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {currentStepData?.description}
            </p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex gap-1">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < currentStep
                  ? 'bg-emerald-500'
                  : i === currentStep
                  ? 'bg-[#8b85f7]'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 justify-end">
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
            className="bg-[#8b85f7] hover:bg-[#7a75e8] text-xs gap-1"
            onClick={onStepComplete}
          >
            {currentStepData?.action}
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}