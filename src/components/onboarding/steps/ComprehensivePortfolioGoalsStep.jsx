import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { HelpCircle } from 'lucide-react';

const TIME_HORIZONS = [
  { value: 'short_term', label: 'Short Term', desc: '1-2 years | Quick exits, steady cash flow', icon: '⚡' },
  { value: 'medium_term', label: 'Medium Term', desc: '3-5 years | Balanced growth & income', icon: '📊' },
  { value: 'long_term', label: 'Long Term', desc: '5+ years | Maximum compounding', icon: '🌱' }
];

const DIVERSIFICATION = [
  { value: 'focused', label: 'Focused Portfolio', desc: '2-3 high-conviction bets', icon: '🎯' },
  { value: 'moderately_diversified', label: 'Moderately Diversified', desc: '5-10 holdings, mixed sectors', icon: '⚖️' },
  { value: 'highly_diversified', label: 'Highly Diversified', desc: '10+ holdings across sectors', icon: '🌐' }
];

const SECTORS = [
  { value: 'tech', label: 'Tech/Software' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'content', label: 'Content/Media' },
  { value: 'services', label: 'Services' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare' }
];

const ASSET_CLASSES = [
  { value: 'digital_assets', label: 'Digital Assets' },
  { value: 'physical_assets', label: 'Physical Assets' },
  { value: 'intellectual_property', label: 'IP & Licensing' },
  { value: 'securities', label: 'Securities/Equity' },
  { value: 'bonds', label: 'Bonds/Fixed Income' }
];

export default function ComprehensivePortfolioGoalsStep({ preferences, updatePreferences, onNext }) {
  const toggleSector = (value) => {
    const updated = preferences.sector_priorities?.includes(value)
      ? preferences.sector_priorities.filter(s => s !== value)
      : [...(preferences.sector_priorities || []), value];
    updatePreferences({ sector_priorities: updated });
  };

  const toggleAssetClass = (value) => {
    const updated = preferences.asset_class_priorities?.includes(value)
      ? preferences.asset_class_priorities.filter(a => a !== value)
      : [...(preferences.asset_class_priorities || []), value];
    updatePreferences({ asset_class_priorities: updated });
  };

  return (
    <div className="space-y-6">
      {/* Time Horizon */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-lg font-semibold text-gray-900">Investment Time Horizon</label>
          <Tooltip text="Longer horizons allow riskier, higher-growth investments" />
        </div>
        <p className="text-sm text-gray-600 mb-3">When do you need returns or plan to exit?</p>
        <div className="grid gap-3">
          {TIME_HORIZONS.map(horizon => (
            <Card
              key={horizon.value}
              className={`cursor-pointer transition-all border-2 ${
                preferences.time_horizon === horizon.value
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updatePreferences({ time_horizon: horizon.value })}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <span className="text-2xl">{horizon.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{horizon.label}</p>
                  <p className="text-sm text-gray-600">{horizon.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Target Return */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-lg font-semibold text-gray-900">Target Annual Return</label>
          <Tooltip text="Be realistic—20-30% is ambitious but achievable" />
        </div>
        <div className="space-y-3">
          <Slider
            value={[preferences.target_return_percentage || 20]}
            onValueChange={(value) => updatePreferences({ target_return_percentage: value[0] })}
            min={5}
            max={100}
            step={5}
          />
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">5%</span>
            <span className="font-bold text-violet-600">{preferences.target_return_percentage || 20}%</span>
            <span className="text-gray-600">100%+</span>
          </div>
          <div className="p-3 bg-blue-50 rounded text-xs text-gray-700">
            💡 S&P 500 averages ~10%. Higher targets require higher risk.
          </div>
        </div>
      </div>

      {/* Diversification */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-lg font-semibold text-gray-900">Diversification Strategy</label>
          <Tooltip text="Start with 5-7 deals, scale from there" />
        </div>
        <p className="text-sm text-gray-600 mb-3">How many different investments do you want?</p>
        <div className="grid gap-3">
          {DIVERSIFICATION.map(div => (
            <Card
              key={div.value}
              className={`cursor-pointer transition-all border-2 ${
                preferences.diversification_preference === div.value
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updatePreferences({ diversification_preference: div.value })}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <span className="text-2xl">{div.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{div.label}</p>
                  <p className="text-sm text-gray-600">{div.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sector Priorities */}
      <div>
        <label className="text-lg font-semibold text-gray-900 mb-3 block">
          Preferred Sectors (Optional)
        </label>
        <p className="text-sm text-gray-600 mb-3">Leave blank to see deals across all sectors</p>
        <div className="flex flex-wrap gap-2">
          {SECTORS.map(sector => (
            <Badge
              key={sector.value}
              variant={preferences.sector_priorities?.includes(sector.value) ? 'default' : 'outline'}
              className="cursor-pointer px-4 py-2 text-sm"
              onClick={() => toggleSector(sector.value)}
            >
              {sector.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Asset Classes */}
      <div>
        <label className="text-lg font-semibold text-gray-900 mb-3 block">
          Asset Classes (Optional)
        </label>
        <p className="text-sm text-gray-600 mb-3">Mix asset types for better diversification</p>
        <div className="flex flex-wrap gap-2">
          {ASSET_CLASSES.map(asset => (
            <Badge
              key={asset.value}
              variant={preferences.asset_class_priorities?.includes(asset.value) ? 'default' : 'outline'}
              className="cursor-pointer px-4 py-2 text-sm"
              onClick={() => toggleAssetClass(asset.value)}
            >
              {asset.label}
            </Badge>
          ))}
        </div>
      </div>

      <Button onClick={onNext} className="w-full mt-6">
        Continue to Community
      </Button>
    </div>
  );
}

function Tooltip({ text }) {
  return (
    <div className="relative group">
      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {text}
      </div>
    </div>
  );
}