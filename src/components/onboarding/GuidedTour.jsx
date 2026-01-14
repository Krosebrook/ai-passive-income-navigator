import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

const TOUR_STEPS = [
  {
    title: 'Welcome to Your Passive Income Hub',
    description: 'This app helps you discover, track, and analyze passive income opportunities.',
    image: '📊',
    tips: [
      'Browse our curated catalog of 30+ income ideas',
      'Create a personalized portfolio',
      'Track your actual income and expenses'
    ]
  },
  {
    title: 'Explore Ideas',
    description: 'Start by browsing the catalog of passive income ideas in our database.',
    image: '💡',
    tips: [
      'Filter by category or search for specific ideas',
      'View difficulty level and estimated income',
      'Check tools and resources needed',
      'Save ideas you\'re interested in'
    ]
  },
  {
    title: 'Build Your Portfolio',
    description: 'Create a personalized portfolio to track your ideas and progress.',
    image: '📁',
    tips: [
      'Add ideas from the catalog or create custom ones',
      'Set priorities and track status',
      'Update descriptions and notes',
      'Generate AI-powered enrichment'
    ]
  },
  {
    title: 'Track Performance',
    description: 'Log real financial data to track ROI and profitability.',
    image: '📈',
    tips: [
      'Record revenue and expenses daily',
      'Track expense breakdowns',
      'View profit trends with charts',
      'Calculate your actual ROI'
    ]
  },
  {
    title: 'AI Analysis',
    description: 'Get intelligent insights about your ideas using AI.',
    image: '🤖',
    tips: [
      'Generate viability scores for ideas',
      'Get monetization strategies',
      'Identify market opportunities and risks',
      'Receive business plan suggestions'
    ]
  },
  {
    title: 'Generate New Ideas',
    description: 'Let AI generate personalized ideas based on your interests.',
    image: '✨',
    tips: [
      'Generate ideas tailored to your profile',
      'Based on your interests and market trends',
      'Add selected ideas directly to portfolio',
      'Discover opportunities you hadn\'t considered'
    ]
  }
];

export default function GuidedTour({ open, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TOUR_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>App Tour</DialogTitle>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6 py-6"
        >
          {/* Step Counter */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
            <div className="flex gap-1">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === currentStep
                      ? 'w-6 bg-violet-600'
                      : i < currentStep
                      ? 'w-2 bg-violet-300'
                      : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Image/Icon */}
          <div className="text-6xl text-center">{step.image}</div>

          {/* Content */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
            <p className="text-gray-600">{step.description}</p>
          </div>

          {/* Tips */}
          <div className="bg-violet-50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-violet-900 mb-2">Key Points:</p>
            {step.tips.map((tip, i) => (
              <div key={i} className="flex gap-2 text-sm text-violet-800">
                <span className="text-violet-600 font-bold">→</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentStep(0);
                onClose();
              }}
            >
              Skip Tour
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 gap-2"
            >
              {currentStep === TOUR_STEPS.length - 1 ? (
                'Complete Tour'
              ) : (
                <>
                  Next <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}