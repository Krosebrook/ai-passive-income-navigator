import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, PieChart } from 'lucide-react';

const ASSET_CLASSES = [
  { value: 'digital', label: 'Digital Assets', desc: 'SaaS, apps, websites' },
  { value: 'physical', label: 'Physical Assets', desc: 'Real estate, equipment' },
  { value: 'ip', label: 'IP & Licensing', desc: 'Patents, royalties' },
  { value: 'equity', label: 'Equity', desc: 'Company shares' },
  { value: 'debt', label: 'Debt Instruments', desc: 'Bonds, notes' }
];

const RISK_PROFILES = [
  { value: 'conservative', label: 'Conservative', desc: 'Minimize risk, stable returns' },
  { value: 'moderate', label: 'Moderate', desc: 'Balanced risk/reward' },
  { value: 'aggressive', label: 'Aggressive', desc: 'High risk, high reward' }
];

export default function PortfolioGoalsStep({ onNext, initialData = {} }) {
  const [goals, setGoals] = useState({
    target_allocation: initialData.target_allocation || {},
    risk_profile: initialData.risk_profile || 'moderate',
    rebalance_frequency: initialData.rebalance_frequency || 'quarterly',
    max_single_position: initialData.max_single_position || 20,
    min_diversification: initialData.min_diversification || 5,
    target_return: initialData.target_return || 15,
    time_horizon_years: initialData.time_horizon_years || 5
  });

  const [allocations, setAllocations] = useState(
    initialData.target_allocation || ASSET_CLASSES.reduce((acc, asset) => ({ ...acc, [asset.value]: 20 }), {})
  );

  const totalAllocation = Object.values(allocations).reduce((sum, val) => sum + val, 0);

  const handleAllocationChange = (asset, value) => {
    setAllocations(prev => ({ ...prev, [asset]: value }));
  };

  const handleNext = () => {
    onNext({
      ...goals,
      target_allocation: allocations
    });
  };

  return (
    <div className="space-y-6">
      {/* Risk Profile */}
      <div>
        <Label className="text-base mb-3 block">Risk Profile</Label>
        <div className="grid grid-cols-3 gap-3">
          {RISK_PROFILES.map(profile => (
            <button
              key={profile.value}
              onClick={() => setGoals({...goals, risk_profile: profile.value})}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                goals.risk_profile === profile.value
                  ? 'border-[#8b85f7] bg-[#8b85f7]/10'
                  : 'border-[#2d1e50] hover:border-[#8b85f7]/50'
              }`}
            >
              <div className="font-medium text-white mb-1">{profile.label}</div>
              <p className="text-xs text-gray-400">{profile.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Target Allocation */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <Label className="text-base">Target Asset Allocation</Label>
          <Badge variant={totalAllocation === 100 ? 'default' : 'destructive'}>
            {totalAllocation}% {totalAllocation === 100 ? '✓' : '(must equal 100%)'}
          </Badge>
        </div>
        <div className="space-y-4">
          {ASSET_CLASSES.map(asset => (
            <div key={asset.value} className="bg-[#0f0618] rounded-xl p-4 border border-[#2d1e50]">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <Label className="text-sm">{asset.label}</Label>
                  <p className="text-xs text-gray-400">{asset.desc}</p>
                </div>
                <span className="text-xl font-bold text-[#8b85f7]">{allocations[asset.value]}%</span>
              </div>
              <Slider
                value={[allocations[asset.value]]}
                onValueChange={([val]) => handleAllocationChange(asset.value, val)}
                min={0}
                max={100}
                step={5}
                className="my-2"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Diversification Rules */}
      <div className="space-y-4">
        <Label className="text-base block">Diversification Rules</Label>
        
        <div className="bg-[#0f0618] rounded-xl p-4 border border-[#2d1e50]">
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm">Maximum Single Position</Label>
            <span className="text-lg font-bold text-[#8b85f7]">{goals.max_single_position}%</span>
          </div>
          <Slider
            value={[goals.max_single_position]}
            onValueChange={([val]) => setGoals({...goals, max_single_position: val})}
            min={5}
            max={50}
            step={5}
          />
          <p className="text-xs text-gray-500 mt-2">
            No single deal can exceed this % of your portfolio
          </p>
        </div>

        <div className="bg-[#0f0618] rounded-xl p-4 border border-[#2d1e50]">
          <div className="flex justify-between items-center mb-2">
            <Label className="text-sm">Minimum # of Positions</Label>
            <span className="text-lg font-bold text-[#8b85f7]">{goals.min_diversification}</span>
          </div>
          <Slider
            value={[goals.min_diversification]}
            onValueChange={([val]) => setGoals({...goals, min_diversification: val})}
            min={3}
            max={20}
            step={1}
          />
          <p className="text-xs text-gray-500 mt-2">
            Maintain at least this many active deals
          </p>
        </div>
      </div>

      {/* Target Returns */}
      <div>
        <Label className="text-base mb-3 block">Financial Goals</Label>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0f0618] rounded-xl p-4 border border-[#2d1e50]">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm">Target Annual Return</Label>
              <span className="text-lg font-bold text-green-400">{goals.target_return}%</span>
            </div>
            <Slider
              value={[goals.target_return]}
              onValueChange={([val]) => setGoals({...goals, target_return: val})}
              min={5}
              max={50}
              step={5}
            />
          </div>

          <div className="bg-[#0f0618] rounded-xl p-4 border border-[#2d1e50]">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm">Time Horizon</Label>
              <span className="text-lg font-bold text-blue-400">{goals.time_horizon_years} years</span>
            </div>
            <Slider
              value={[goals.time_horizon_years]}
              onValueChange={([val]) => setGoals({...goals, time_horizon_years: val})}
              min={1}
              max={20}
              step={1}
            />
          </div>
        </div>
      </div>

      {/* Rebalancing */}
      <div>
        <Label className="text-base mb-3 block">Rebalancing Frequency</Label>
        <div className="grid grid-cols-4 gap-3">
          {['monthly', 'quarterly', 'semi-annual', 'annual'].map(freq => (
            <button
              key={freq}
              onClick={() => setGoals({...goals, rebalance_frequency: freq})}
              className={`p-3 rounded-xl border-2 transition-all text-center capitalize ${
                goals.rebalance_frequency === freq
                  ? 'border-[#8b85f7] bg-[#8b85f7]/10'
                  : 'border-[#2d1e50] hover:border-[#8b85f7]/50'
              }`}
            >
              {freq.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleNext}
        disabled={totalAllocation !== 100}
        className="w-full bg-gradient-to-r from-[#8b85f7] to-[#583cf0] hover:from-[#9a95ff] hover:to-[#6b4fff]"
      >
        Continue to Integrations
      </Button>
    </div>
  );
}