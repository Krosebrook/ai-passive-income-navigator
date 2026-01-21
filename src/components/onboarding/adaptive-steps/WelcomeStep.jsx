import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';

export default function WelcomeStep({ onComplete }) {
  const features = [
    { icon: Sparkles, title: 'AI-Powered Sourcing', description: 'Discover investment opportunities tailored to you' },
    { icon: TrendingUp, title: 'Predictive Analytics', description: 'Make data-driven investment decisions' },
    { icon: Shield, title: 'Risk Assessment', description: 'Understand and manage investment risks' },
    { icon: Zap, title: 'Real-Time Insights', description: 'Stay ahead with market intelligence' }
  ];

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gradient mb-2">
          Your Journey to Passive Income Starts Here
        </h2>
        <p className="text-gray-400">
          Let's personalize your experience to match your investment goals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="p-4 rounded-xl border border-[#2d1e50] bg-[#0f0618] hover:border-[#8b85f7] transition-all"
            >
              <Icon className="w-8 h-8 text-[#8b85f7] mb-2" />
              <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </div>
          );
        })}
      </div>

      <Button onClick={() => onComplete({})} className="w-full btn-primary">
        Get Started
      </Button>
    </div>
  );
}