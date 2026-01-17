import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sparkles, Loader2, Target, Clock, PieChart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const SECTORS = [
  'Technology', 'Healthcare', 'Finance', 'Consumer Goods', 'Real Estate',
  'Energy', 'Manufacturing', 'Retail', 'Entertainment', 'Education'
];

const ASSET_CLASSES = [
  'Digital Businesses', 'Physical Products', 'Service Businesses',
  'Content Properties', 'Software/Apps', 'Real Estate', 'Intellectual Property'
];

export default function PortfolioGoalsStep({ preferences, updatePreferences }) {
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const toggleItem = (key, item) => {
    const current = preferences[key] || [];
    updatePreferences({
      [key]: current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item]
    });
  };

  const getAIInsights = async () => {
    setLoadingInsights(true);
    try {
      const response = await base44.functions.invoke('generateOnboardingInsights', {
        preferences,
        currentStep: 'portfolio_goals'
      });
      setAiInsights(response.data.insights);
    } catch (error) {
      toast.error('Failed to generate insights');
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Time Horizon */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Investment Time Horizon
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'short_term', label: 'Short-term', desc: '< 2 years' },
            { value: 'medium_term', label: 'Medium-term', desc: '2-5 years' },
            { value: 'long_term', label: 'Long-term', desc: '5+ years' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updatePreferences({ time_horizon: option.value })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                preferences.time_horizon === option.value
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-900">{option.label}</div>
              <div className="text-sm text-gray-500">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Target Return */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Target Annual Return
        </label>
        <div className="flex items-center gap-4">
          <Slider
            value={[preferences.target_return_percentage || 20]}
            onValueChange={([value]) => updatePreferences({ target_return_percentage: value })}
            min={5}
            max={100}
            step={5}
            className="flex-1"
          />
          <div className="w-20 text-right">
            <span className="text-2xl font-bold text-violet-600">
              {preferences.target_return_percentage}%
            </span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Conservative (5%)</span>
          <span>Aggressive (100%)</span>
        </div>
      </div>

      {/* Diversification */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <PieChart className="w-4 h-4" />
          Diversification Preference
        </label>
        <Select
          value={preferences.diversification_preference}
          onValueChange={(value) => updatePreferences({ diversification_preference: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="focused">Focused - 1-3 investments</SelectItem>
            <SelectItem value="moderately_diversified">Moderate - 4-8 investments</SelectItem>
            <SelectItem value="highly_diversified">Highly Diversified - 9+ investments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sector Priorities */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Sector Priorities
        </label>
        <p className="text-sm text-gray-600 mb-3">Select sectors you want to focus on</p>
        <div className="flex flex-wrap gap-2">
          {SECTORS.map((sector) => (
            <Badge
              key={sector}
              onClick={() => toggleItem('sector_priorities', sector)}
              className={`cursor-pointer ${
                preferences.sector_priorities?.includes(sector)
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {sector}
            </Badge>
          ))}
        </div>
      </div>

      {/* Asset Class Priorities */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Asset Class Priorities
        </label>
        <div className="flex flex-wrap gap-2">
          {ASSET_CLASSES.map((assetClass) => (
            <Badge
              key={assetClass}
              onClick={() => toggleItem('asset_class_priorities', assetClass)}
              className={`cursor-pointer ${
                preferences.asset_class_priorities?.includes(assetClass)
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {assetClass}
            </Badge>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div>
        <Button
          onClick={getAIInsights}
          disabled={loadingInsights}
          variant="outline"
          className="w-full border-violet-300 text-violet-700 hover:bg-violet-50"
        >
          {loadingInsights ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing your portfolio strategy...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Get AI Portfolio Strategy Insights
            </>
          )}
        </Button>

        {aiInsights && (
          <Card className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <p className="text-sm text-gray-800 mb-3">{aiInsights.strategy_insight}</p>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700">Asset Allocation Suggestions:</p>
              {aiInsights.allocation_suggestions?.map((suggestion, i) => (
                <p key={i} className="text-xs text-gray-700 flex items-start gap-2">
                  <span className="text-blue-600">→</span>
                  {suggestion}
                </p>
              ))}
            </div>
            {aiInsights.expected_timeframe && (
              <p className="text-xs text-green-700 mt-3 flex items-start gap-2">
                <span>⏰</span>
                Expected timeframe: {aiInsights.expected_timeframe}
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}