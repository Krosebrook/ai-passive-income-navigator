import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';

const INDUSTRIES = ['SaaS', 'E-commerce', 'Mobile Apps', 'Content Sites', 'Digital Products', 'Services'];
const DEAL_STRUCTURES = ['Equity Purchase', 'Revenue Share', 'Asset Purchase', 'Licensing', 'Partnership'];

export default function PreferencesStep({ data, onNext, onSkip, canSkip }) {
  const { personalization } = data;
  
  const [preferences, setPreferences] = useState({
    risk_tolerance: personalization?.risk_tolerance || 'moderate',
    investment_size_min: personalization?.investment_range?.min || 10000,
    investment_size_max: personalization?.investment_range?.max || 100000,
    target_industries: personalization?.focus_areas?.slice(0, 3) || [],
    preferred_deal_structures: ['Equity Purchase'],
    target_return_percentage: 25,
    time_horizon: 'medium_term',
    diversification_preference: 'moderately_diversified'
  });

  const toggleIndustry = (industry) => {
    setPreferences(prev => ({
      ...prev,
      target_industries: prev.target_industries.includes(industry)
        ? prev.target_industries.filter(i => i !== industry)
        : [...prev.target_industries, industry]
    }));
  };

  const toggleDealStructure = (structure) => {
    setPreferences(prev => ({
      ...prev,
      preferred_deal_structures: prev.preferred_deal_structures.includes(structure)
        ? prev.preferred_deal_structures.filter(s => s !== structure)
        : [...prev.preferred_deal_structures, structure]
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-6 h-6 text-[#8b85f7]" />
          <h2 className="text-2xl font-bold">Configure Your Preferences</h2>
        </div>
        <p className="text-gray-400">
          Fine-tune your deal matching settings (you can change these anytime)
        </p>
      </div>

      {/* Investment Range */}
      <div className="space-y-3">
        <Label>Investment Range</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-gray-400">Minimum</Label>
            <p className="text-lg font-semibold text-[#00b7eb]">
              ${preferences.investment_size_min.toLocaleString()}
            </p>
          </div>
          <div>
            <Label className="text-xs text-gray-400">Maximum</Label>
            <p className="text-lg font-semibold text-[#8b85f7]">
              ${preferences.investment_size_max.toLocaleString()}
            </p>
          </div>
        </div>
        <Slider
          value={[preferences.investment_size_min]}
          onValueChange={([value]) => setPreferences(prev => ({ ...prev, investment_size_min: value }))}
          min={1000}
          max={500000}
          step={1000}
          className="mt-2"
        />
      </div>

      {/* Target Industries */}
      <div className="space-y-3">
        <Label>Target Industries ({preferences.target_industries.length} selected)</Label>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map(industry => (
            <Badge
              key={industry}
              onClick={() => toggleIndustry(industry)}
              className={`cursor-pointer px-3 py-2 ${
                preferences.target_industries.includes(industry)
                  ? 'bg-[#8b85f7] text-white'
                  : 'bg-[#0f0618] text-gray-400 border-[#2d1e50] hover:border-[#8b85f7]/50'
              }`}
            >
              {industry}
            </Badge>
          ))}
        </div>
      </div>

      {/* Deal Structures */}
      <div className="space-y-3">
        <Label>Preferred Deal Structures</Label>
        <div className="flex flex-wrap gap-2">
          {DEAL_STRUCTURES.map(structure => (
            <Badge
              key={structure}
              onClick={() => toggleDealStructure(structure)}
              className={`cursor-pointer px-3 py-2 ${
                preferences.preferred_deal_structures.includes(structure)
                  ? 'bg-[#00b7eb] text-white'
                  : 'bg-[#0f0618] text-gray-400 border-[#2d1e50] hover:border-[#00b7eb]/50'
              }`}
            >
              {structure}
            </Badge>
          ))}
        </div>
      </div>

      {/* Target Return */}
      <div className="space-y-3">
        <Label>Target Annual Return: {preferences.target_return_percentage}%</Label>
        <Slider
          value={[preferences.target_return_percentage]}
          onValueChange={([value]) => setPreferences(prev => ({ ...prev, target_return_percentage: value }))}
          min={5}
          max={100}
          step={5}
        />
      </div>

      <div className="flex justify-between pt-4">
        {canSkip && (
          <Button variant="ghost" onClick={onSkip}>
            Skip for now
          </Button>
        )}
        <Button
          onClick={() => onNext({ preferences })}
          size="lg"
          className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] ml-auto"
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
}