import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, DollarSign, TrendingUp } from 'lucide-react';

export default function PersonalizedStep({ data, onNext }) {
  const { personalization } = data;

  if (!personalization) {
    return <div>Loading personalization...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] mb-4 glow-primary">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Your Personalized Plan</h2>
      </div>

      {/* Welcome Message */}
      <div className="card-dark p-6 border-l-4 border-[#8b85f7]">
        <p className="text-gray-300 leading-relaxed">{personalization.welcome_message}</p>
      </div>

      {/* Focus Areas */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#8b85f7]" />
          <h3 className="font-semibold">Recommended Focus Areas</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {personalization.focus_areas.map((area, idx) => (
            <Badge key={idx} className="bg-[#8b85f7]/20 text-[#8b85f7] border-[#8b85f7]/50 px-3 py-1">
              {area}
            </Badge>
          ))}
        </div>
      </div>

      {/* Investment Range */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-dark p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-400">Investment Range</span>
          </div>
          <p className="text-xl font-bold">
            ${personalization.investment_range.min.toLocaleString()} - ${personalization.investment_range.max.toLocaleString()}
          </p>
        </div>
        <div className="card-dark p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-[#00b7eb]" />
            <span className="text-sm text-gray-400">Risk Profile</span>
          </div>
          <p className="text-xl font-bold capitalize">
            {personalization.risk_tolerance.replace('_', ' ')}
          </p>
        </div>
      </div>

      {/* Key Features */}
      <div className="space-y-3">
        <h3 className="font-semibold">Features You'll Love</h3>
        <div className="space-y-2">
          {personalization.key_features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">{idx + 1}</span>
              </div>
              <p className="text-sm text-gray-300">{feature}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={() => onNext({ personalization })}
          size="lg"
          className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb]"
        >
          Set Up My Preferences
        </Button>
      </div>
    </div>
  );
}