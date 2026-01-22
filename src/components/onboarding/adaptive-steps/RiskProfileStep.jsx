import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Shield, ArrowRight } from 'lucide-react';

export default function RiskProfileStep({ onComplete, onBack, canGoBack }) {
  const [riskProfile, setRiskProfile] = useState({
    risk_tolerance: 'moderate',
    time_horizon: 'medium_term',
    diversification: 'moderately_diversified'
  });

  const riskOptions = [
    { value: 'very_conservative', label: 'Very Conservative', description: 'Minimize risk, stable returns' },
    { value: 'conservative', label: 'Conservative', description: 'Low risk, steady growth' },
    { value: 'moderate', label: 'Moderate', description: 'Balanced risk and reward' },
    { value: 'aggressive', label: 'Aggressive', description: 'Higher risk, higher potential returns' },
    { value: 'very_aggressive', label: 'Very Aggressive', description: 'Maximum growth potential' }
  ];

  const handleSubmit = async () => {
    // Save to user preferences
    const { base44 } = await import('@/api/base44Client');
    await base44.auth.updateMe({
      preferences: riskProfile
    });
    onComplete(riskProfile);
  };

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <Shield className="w-12 h-12 text-[#00b7eb] mx-auto mb-3" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00b7eb] to-[#8b85f7] bg-clip-text text-transparent mb-2">
          Define Your Risk Profile
        </h2>
        <p className="text-gray-400">
          This helps us recommend the right investment opportunities
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-white mb-3 block">Risk Tolerance</Label>
          <RadioGroup
            value={riskProfile.risk_tolerance}
            onValueChange={(value) => setRiskProfile({ ...riskProfile, risk_tolerance: value })}
            className="space-y-2"
          >
            {riskOptions.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-3 p-3 rounded-lg border border-[#2d1e50] hover:border-[#8b85f7] transition-all cursor-pointer"
                onClick={() => setRiskProfile({ ...riskProfile, risk_tolerance: option.value })}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <div className="flex-1">
                  <Label htmlFor={option.value} className="text-white font-medium cursor-pointer">
                    {option.label}
                  </Label>
                  <p className="text-sm text-gray-400">{option.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="flex gap-3">
        {canGoBack && (
          <Button onClick={onBack} variant="outline" className="flex-1">
            Back
          </Button>
        )}
        <Button onClick={handleSubmit} className="flex-1 btn-primary">
          Continue <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}