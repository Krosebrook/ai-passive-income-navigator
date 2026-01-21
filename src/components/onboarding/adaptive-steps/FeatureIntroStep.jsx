import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle, BookOpen } from 'lucide-react';

export default function FeatureIntroStep({ feature, title, description, onComplete, onBack, canGoBack }) {
  const featureContent = {
    sourcing: {
      steps: [
        'AI scans multiple deal platforms for opportunities',
        'Deals are matched against your preferences and risk profile',
        'Top matches appear in your Deal Feed',
        'Review, analyze, and save promising opportunities'
      ],
      video: 'Deal sourcing walkthrough'
    },
    analysis: {
      steps: [
        'AI performs comprehensive due diligence on deals',
        'Risk assessment and viability scoring',
        'Competitive analysis and market positioning',
        'Financial projections and ROI estimates'
      ],
      video: 'Analysis tools tutorial'
    },
    pipeline: {
      steps: [
        'Track deals through customizable stages',
        'Set reminders and action items',
        'Collaborate with team members',
        'Monitor deal progress and analytics'
      ],
      video: 'Pipeline management guide'
    }
  };

  const content = featureContent[feature] || featureContent.sourcing;

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-400">{description}</p>
      </div>

      <div className="p-6 rounded-xl border border-[#2d1e50] bg-[#0f0618]">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#8b85f7]" />
          How It Works
        </h3>
        <div className="space-y-3">
          {content.steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#8b85f7] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-gray-300 pt-0.5">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl border border-[#00b7eb]/30 bg-[#00b7eb]/5">
        <div className="flex items-center gap-3">
          <PlayCircle className="w-8 h-8 text-[#00b7eb]" />
          <div className="flex-1">
            <p className="text-white font-medium">Watch Tutorial</p>
            <p className="text-sm text-gray-400">{content.video}</p>
          </div>
          <Button variant="outline" size="sm">
            Play
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        {canGoBack && (
          <Button onClick={onBack} variant="outline" className="flex-1">
            Back
          </Button>
        )}
        <Button onClick={() => onComplete({})} className="flex-1 btn-primary">
          Got It <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}