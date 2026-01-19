import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ArrowRight, Target, TrendingUp, Clock, Shield } from 'lucide-react';

const GOALS = [
  { id: 'side_income', label: 'Side Income', icon: '💰', desc: 'Extra $500-2k/month' },
  { id: 'supplement', label: 'Supplement Income', icon: '📈', desc: '$2k-5k/month' },
  { id: 'replace_job', label: 'Replace Job', icon: '🎯', desc: '$5k-10k+/month' },
  { id: 'financial_freedom', label: 'Financial Freedom', icon: '🚀', desc: '$10k+/month' }
];

const RISK_LEVELS = [
  { value: 'very_conservative', label: 'Very Conservative', color: 'text-green-400' },
  { value: 'conservative', label: 'Conservative', color: 'text-blue-400' },
  { value: 'moderate', label: 'Moderate', color: 'text-yellow-400' },
  { value: 'aggressive', label: 'Aggressive', color: 'text-orange-400' },
  { value: 'very_aggressive', label: 'Very Aggressive', color: 'text-red-400' }
];

export default function QuickPreferencesStep({ onNext, userData }) {
  const [goal, setGoal] = useState(userData.passive_income_goal || '');
  const [riskLevel, setRiskLevel] = useState(2);
  const [timeCommitment, setTimeCommitment] = useState(userData.time_commitment || 2);

  const handleNext = () => {
    onNext({
      passive_income_goal: goal,
      risk_tolerance: RISK_LEVELS[riskLevel].value,
      time_commitment: timeCommitment
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Quick Setup</h2>
        <p className="text-gray-400">Help us personalize your experience</p>
      </div>

      {/* Goal Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
          <Target className="w-5 h-5 text-[#8b85f7]" />
          What's your income goal?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {GOALS.map((g) => (
            <button
              key={g.id}
              onClick={() => setGoal(g.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                goal === g.id
                  ? 'border-[#8b85f7] bg-[#8b85f7]/10'
                  : 'border-[#2d1e50] bg-[#1a0f2e] hover:border-[#8b85f7]/50'
              }`}
            >
              <div className="text-2xl mb-2">{g.icon}</div>
              <div className="text-sm font-semibold text-white">{g.label}</div>
              <div className="text-xs text-gray-400">{g.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Risk Tolerance */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
          <Shield className="w-5 h-5 text-[#8b85f7]" />
          Risk tolerance: <span className={RISK_LEVELS[riskLevel].color}>{RISK_LEVELS[riskLevel].label}</span>
        </label>
        <Slider
          value={[riskLevel]}
          onValueChange={(value) => setRiskLevel(value[0])}
          max={4}
          step={1}
          className="slider-thumb"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Low Risk</span>
          <span>High Risk</span>
        </div>
      </div>

      {/* Time Commitment */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
          <Clock className="w-5 h-5 text-[#8b85f7]" />
          Weekly time commitment: <span className="text-[#8b85f7]">{timeCommitment} hours</span>
        </label>
        <Slider
          value={[timeCommitment]}
          onValueChange={(value) => setTimeCommitment(value[0])}
          max={20}
          min={1}
          step={1}
          className="slider-thumb"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>1 hour</span>
          <span>20+ hours</span>
        </div>
      </div>

      <Button
        onClick={handleNext}
        disabled={!goal}
        className="w-full bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] hover:from-[#9a95ff] hover:to-[#00d4ff]"
        size="lg"
      >
        Continue
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}