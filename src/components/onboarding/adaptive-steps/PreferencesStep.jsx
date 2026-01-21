import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Target } from 'lucide-react';

export default function PreferencesStep({ onComplete, onBack, canGoBack }) {
  const [preferences, setPreferences] = useState({
    investment_goal: '',
    target_return: 15,
    industries: []
  });

  const industryOptions = [
    'Technology', 'Healthcare', 'Finance', 'Real Estate', 
    'E-commerce', 'SaaS', 'AI/ML', 'Renewable Energy'
  ];

  const handleSubmit = () => {
    onComplete(preferences);
  };

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <Target className="w-12 h-12 text-[#8b85f7] mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-white mb-2">
          What Are Your Investment Goals?
        </h2>
        <p className="text-gray-400">
          Help us understand what you're looking to achieve
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-white mb-2">Primary Investment Goal</Label>
          <Input
            placeholder="e.g., Generate $5,000/month passive income"
            value={preferences.investment_goal}
            onChange={(e) => setPreferences({ ...preferences, investment_goal: e.target.value })}
            className="bg-[#1a0f2e] border-[#2d1e50] text-white"
          />
        </div>

        <div>
          <Label className="text-white mb-2">Target Annual Return (%)</Label>
          <Input
            type="number"
            value={preferences.target_return}
            onChange={(e) => setPreferences({ ...preferences, target_return: parseInt(e.target.value) })}
            className="bg-[#1a0f2e] border-[#2d1e50] text-white"
          />
        </div>

        <div>
          <Label className="text-white mb-2">Industries of Interest</Label>
          <div className="grid grid-cols-2 gap-2">
            {industryOptions.map((industry) => (
              <div key={industry} className="flex items-center space-x-2">
                <Checkbox
                  id={industry}
                  checked={preferences.industries.includes(industry)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setPreferences({ 
                        ...preferences, 
                        industries: [...preferences.industries, industry] 
                      });
                    } else {
                      setPreferences({ 
                        ...preferences, 
                        industries: preferences.industries.filter(i => i !== industry) 
                      });
                    }
                  }}
                />
                <label htmlFor={industry} className="text-sm text-gray-300 cursor-pointer">
                  {industry}
                </label>
              </div>
            ))}
          </div>
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