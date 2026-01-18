import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { CheckCircle2, TrendingUp } from 'lucide-react';

const GROWTH_STAGES = [
  { value: 'idea', label: 'Idea Stage', desc: 'Pre-launch concepts' },
  { value: 'mvp', label: 'MVP', desc: 'Minimum viable product' },
  { value: 'early_traction', label: 'Early Traction', desc: 'Initial customers' },
  { value: 'growth', label: 'Growth', desc: 'Scaling revenue' },
  { value: 'mature', label: 'Mature', desc: 'Established business' }
];

const METRICS = [
  { key: 'min_revenue', label: 'Minimum Annual Revenue', prefix: '$', suffix: 'K' },
  { key: 'max_revenue', label: 'Maximum Annual Revenue', prefix: '$', suffix: 'K' },
  { key: 'min_profit_margin', label: 'Minimum Profit Margin', suffix: '%' },
  { key: 'min_customer_count', label: 'Minimum Customer Base', suffix: '' }
];

export default function DealCriteriaStep({ onNext, initialData = {} }) {
  const [criteria, setCriteria] = useState({
    growth_stages: initialData.growth_stages || [],
    min_revenue: initialData.min_revenue || 0,
    max_revenue: initialData.max_revenue || 1000,
    min_profit_margin: initialData.min_profit_margin || 10,
    min_customer_count: initialData.min_customer_count || 0,
    max_deal_age_days: initialData.max_deal_age_days || 30,
    require_verified: initialData.require_verified || false
  });

  const toggleGrowthStage = (value) => {
    setCriteria(prev => ({
      ...prev,
      growth_stages: prev.growth_stages.includes(value)
        ? prev.growth_stages.filter(s => s !== value)
        : [...prev.growth_stages, value]
    }));
  };

  const handleNext = () => {
    onNext(criteria);
  };

  return (
    <div className="space-y-6">
      {/* Growth Stages */}
      <div>
        <Label className="text-base mb-3 block">Growth Stages</Label>
        <p className="text-sm text-gray-400 mb-3">Select which stages you're interested in</p>
        <div className="grid grid-cols-2 gap-3">
          {GROWTH_STAGES.map(stage => (
            <button
              key={stage.value}
              onClick={() => toggleGrowthStage(stage.value)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                criteria.growth_stages.includes(stage.value)
                  ? 'border-[#8b85f7] bg-[#8b85f7]/10'
                  : 'border-[#2d1e50] hover:border-[#8b85f7]/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-medium text-white">{stage.label}</span>
                {criteria.growth_stages.includes(stage.value) && (
                  <CheckCircle2 className="w-5 h-5 text-[#8b85f7]" />
                )}
              </div>
              <p className="text-xs text-gray-400">{stage.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="space-y-4">
        <Label className="text-base mb-3 block">Financial Metrics</Label>
        
        {/* Revenue Range */}
        <div className="bg-[#0f0618] rounded-xl p-4 border border-[#2d1e50]">
          <Label className="text-sm mb-3 block">Annual Revenue Range</Label>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <Label className="text-xs text-gray-400">Minimum</Label>
              <Input
                type="number"
                value={criteria.min_revenue}
                onChange={(e) => setCriteria({...criteria, min_revenue: Number(e.target.value)})}
                className="mt-1"
                placeholder="0"
              />
              <span className="text-xs text-gray-500">$K</span>
            </div>
            <div>
              <Label className="text-xs text-gray-400">Maximum</Label>
              <Input
                type="number"
                value={criteria.max_revenue}
                onChange={(e) => setCriteria({...criteria, max_revenue: Number(e.target.value)})}
                className="mt-1"
                placeholder="1000"
              />
              <span className="text-xs text-gray-500">$K</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Range: ${criteria.min_revenue}K - ${criteria.max_revenue}K annually
          </div>
        </div>

        {/* Profit Margin */}
        <div className="bg-[#0f0618] rounded-xl p-4 border border-[#2d1e50]">
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm">Minimum Profit Margin</Label>
            <span className="text-lg font-bold text-[#8b85f7]">{criteria.min_profit_margin}%</span>
          </div>
          <Slider
            value={[criteria.min_profit_margin]}
            onValueChange={([val]) => setCriteria({...criteria, min_profit_margin: val})}
            min={0}
            max={100}
            step={5}
            className="my-4"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Customer Base */}
        <div className="bg-[#0f0618] rounded-xl p-4 border border-[#2d1e50]">
          <Label className="text-sm mb-3 block">Minimum Customer Base</Label>
          <Input
            type="number"
            value={criteria.min_customer_count}
            onChange={(e) => setCriteria({...criteria, min_customer_count: Number(e.target.value)})}
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-2">
            Deals must have at least this many customers
          </p>
        </div>
      </div>

      {/* Deal Freshness */}
      <div>
        <Label className="text-base mb-3 block">Deal Freshness</Label>
        <div className="bg-[#0f0618] rounded-xl p-4 border border-[#2d1e50]">
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm">Show deals posted within</Label>
            <span className="text-lg font-bold text-[#8b85f7]">{criteria.max_deal_age_days} days</span>
          </div>
          <Slider
            value={[criteria.max_deal_age_days]}
            onValueChange={([val]) => setCriteria({...criteria, max_deal_age_days: val})}
            min={1}
            max={90}
            step={1}
            className="my-4"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1 day</span>
            <span>90 days</span>
          </div>
        </div>
      </div>

      {/* Verification */}
      <div className="flex items-center justify-between bg-[#0f0618] rounded-xl p-4 border border-[#2d1e50]">
        <div>
          <Label className="text-sm">Require Verified Deals</Label>
          <p className="text-xs text-gray-400 mt-1">Only show deals with verified financials</p>
        </div>
        <button
          onClick={() => setCriteria({...criteria, require_verified: !criteria.require_verified})}
          className={`w-12 h-6 rounded-full transition-all ${
            criteria.require_verified ? 'bg-[#8b85f7]' : 'bg-gray-600'
          }`}
        >
          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
            criteria.require_verified ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      <Button
        onClick={handleNext}
        className="w-full bg-gradient-to-r from-[#8b85f7] to-[#583cf0] hover:from-[#9a95ff] hover:to-[#6b4fff]"
      >
        Continue to Portfolio Goals
      </Button>
    </div>
  );
}