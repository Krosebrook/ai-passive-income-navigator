import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';

export default function FeatureQuickStart({ feature, isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const featureGuides = {
    deal_sourcing: {
      title: 'Quick Start: AI Deal Sourcing',
      steps: [
        {
          title: 'Set Your Criteria',
          content: 'Define your investment preferences in the User Preferences page. The AI uses these to find matching deals.',
          action: 'Go to Preferences',
          highlight: 'risk_tolerance, target_industries, investment_range'
        },
        {
          title: 'Review AI Matches',
          content: 'Check your Home feed for AI-sourced deals. Each deal includes a match score showing relevance to your preferences.',
          action: 'View Deals',
          highlight: 'match_score, risk_assessment'
        },
        {
          title: 'Analyze & Save',
          content: 'Use the AI analysis feature to perform deep due diligence. Save promising deals to your pipeline.',
          action: 'Try It Now',
          highlight: 'due_diligence, save_to_pipeline'
        }
      ]
    },
    pipeline: {
      title: 'Quick Start: Deal Pipeline',
      steps: [
        {
          title: 'Create Stages',
          content: 'Customize your pipeline stages to match your investment workflow (e.g., Research, Due Diligence, Negotiation).',
          action: 'Manage Stages'
        },
        {
          title: 'Add Deals',
          content: 'Drag and drop deals between stages. Set reminders and add notes to track progress.',
          action: 'Add First Deal'
        },
        {
          title: 'Track Analytics',
          content: 'Monitor conversion rates, cycle times, and pipeline health with built-in analytics.',
          action: 'View Analytics'
        }
      ]
    },
    analytics: {
      title: 'Quick Start: Predictive Analytics',
      steps: [
        {
          title: 'Dashboard Overview',
          content: 'Get a high-level view of your portfolio performance, market trends, and AI insights.',
          action: 'Open Dashboard'
        },
        {
          title: 'AI Predictions',
          content: 'Review AI-generated forecasts for deal performance, ROI projections, and risk assessments.',
          action: 'View Predictions'
        },
        {
          title: 'Custom Reports',
          content: 'Generate detailed reports on specific metrics or time periods to inform your strategy.',
          action: 'Create Report'
        }
      ]
    }
  };

  const guide = featureGuides[feature];
  if (!guide) return null;

  const currentGuideStep = guide.steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#1a0f2e] border-[#2d1e50]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] bg-clip-text text-transparent">
            {guide.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2">
            {guide.steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-[#8b85f7]'
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-[#2d1e50]'
                }`}
              />
            ))}
          </div>

          {/* Step Content */}
          <Card className="card-dark">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#8b85f7] flex items-center justify-center text-white font-bold flex-shrink-0">
                  {currentStep + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {currentGuideStep.title}
                  </h3>
                  <p className="text-gray-400">
                    {currentGuideStep.content}
                  </p>
                </div>
              </div>

              {currentGuideStep.highlight && (
                <div className="mt-4 p-3 rounded-lg bg-[#8b85f7]/10 border border-[#8b85f7]/30">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-[#8b85f7]">Key Features:</span>{' '}
                    {currentGuideStep.highlight}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {guide.steps.length}
            </span>

            {currentStep < guide.steps.length - 1 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="btn-primary"
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={onClose}
                className="btn-primary"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Got It
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}