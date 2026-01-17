import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { HelpCircle } from 'lucide-react';

const INDUSTRIES = [
  { value: 'software_saas', label: 'Software & SaaS' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'content_media', label: 'Content & Media' },
  { value: 'digital_services', label: 'Digital Services' },
  { value: 'marketplaces', label: 'Marketplaces' },
  { value: 'fintech', label: 'FinTech' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'subscriptions', label: 'Subscription Services' }
];

const DEAL_STRUCTURES = [
  { value: 'equity', label: 'Equity Stake', icon: '📈', desc: 'Ownership % in business' },
  { value: 'revenue_share', label: 'Revenue Share', icon: '💰', desc: '% of business revenue' },
  { value: 'affiliate', label: 'Affiliate/Commission', icon: '🔗', desc: 'Ongoing commissions' },
  { value: 'licensing', label: 'Licensing Fees', icon: '📜', desc: 'License your IP' },
  { value: 'rental', label: 'Rental/Lease', icon: '🏠', desc: 'Property rentals' }
];

const GEO_OPTIONS = [
  { value: 'us_only', label: 'US Only' },
  { value: 'north_america', label: 'North America' },
  { value: 'english_speaking', label: 'English-Speaking' },
  { value: 'global', label: 'Global' }
];

export default function ComprehensiveDealSourcingStep({ preferences, updatePreferences, onNext }) {
  const [errors, setErrors] = useState({});

  const validateStep = () => {
    const newErrors = {};
    if (!preferences.target_industries || preferences.target_industries.length === 0) {
      newErrors.target_industries = 'Select at least 1 industry';
    }
    if (!preferences.preferred_deal_structures || preferences.preferred_deal_structures.length === 0) {
      newErrors.preferred_deal_structures = 'Select at least 1 deal structure';
    }
    if ((preferences.investment_size_min || 0) >= (preferences.investment_size_max || 0)) {
      newErrors.investment_size = 'Minimum must be less than maximum';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext?.();
    }
  };

  const toggleIndustry = (value) => {
    const updated = preferences.target_industries?.includes(value)
      ? preferences.target_industries.filter(i => i !== value)
      : [...(preferences.target_industries || []), value];
    updatePreferences({ target_industries: updated });
  };

  const toggleStructure = (value) => {
    const updated = preferences.preferred_deal_structures?.includes(value)
      ? preferences.preferred_deal_structures.filter(s => s !== value)
      : [...(preferences.preferred_deal_structures || []), value];
    updatePreferences({ preferred_deal_structures: updated });
  };

  return (
    <div className="space-y-6">
      {/* Industries */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-lg font-semibold text-gray-900">Industries of Interest</label>
          <Tooltip text="Pick 1-3 industries where you have interest or expertise" />
        </div>
        <p className="text-sm text-gray-600 mb-3">Select at least 1</p>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map(industry => (
            <Badge
              key={industry.value}
              variant={preferences.target_industries?.includes(industry.value) ? 'default' : 'outline'}
              className="cursor-pointer px-4 py-2 text-sm"
              onClick={() => toggleIndustry(industry.value)}
            >
              {industry.label}
            </Badge>
          ))}
        </div>
        {errors.target_industries && (
          <p className="text-xs text-red-600 mt-2">{errors.target_industries}</p>
        )}
      </div>

      {/* Investment Range */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-2">
            Minimum Investment
          </label>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-600">$</span>
            <Input
              type="number"
              placeholder="1000"
              value={preferences.investment_size_min || ''}
              onChange={(e) => updatePreferences({ investment_size_min: parseInt(e.target.value) || 0 })}
              min="100"
              step="1000"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">💡 $1,000-$10,000 ideal to start</p>
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-2">
            Maximum Investment
          </label>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-600">$</span>
            <Input
              type="number"
              placeholder="50000"
              value={preferences.investment_size_max || ''}
              onChange={(e) => updatePreferences({ investment_size_max: parseInt(e.target.value) || 0 })}
              min="1000"
              step="5000"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Be realistic about available capital</p>
        </div>
      </div>
      {errors.investment_size && (
        <p className="text-xs text-red-600">{errors.investment_size}</p>
      )}

      {/* Deal Structures */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-lg font-semibold text-gray-900">Preferred Deal Structures</label>
          <Tooltip text="Not sure? Equity and revenue share are most common" />
        </div>
        <p className="text-sm text-gray-600 mb-3">Select 1-3 ways you want to make money</p>
        <div className="grid md:grid-cols-2 gap-3">
          {DEAL_STRUCTURES.map(structure => (
            <Card
              key={structure.value}
              className={`cursor-pointer transition-all border-2 ${
                preferences.preferred_deal_structures?.includes(structure.value)
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleStructure(structure.value)}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">{structure.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">{structure.label}</p>
                    <p className="text-xs text-gray-600">{structure.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {errors.preferred_deal_structures && (
          <p className="text-xs text-red-600 mt-2">{errors.preferred_deal_structures}</p>
        )}
      </div>

      {/* Geographic Preferences */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-lg font-semibold text-gray-900">Geographic Focus (Optional)</label>
          <Tooltip text="You can be flexible—most deals are location-independent" />
        </div>
        <div className="flex flex-wrap gap-2">
          {GEO_OPTIONS.map(geo => (
            <Badge
              key={geo.value}
              variant={preferences.geo_preferences?.includes(geo.value) ? 'default' : 'outline'}
              className="cursor-pointer px-4 py-2 text-sm"
              onClick={() => {
                const updated = preferences.geo_preferences?.includes(geo.value)
                  ? preferences.geo_preferences.filter(g => g !== geo.value)
                  : [geo.value]; // Only one can be selected
                updatePreferences({ geo_preferences: updated });
              }}
            >
              {geo.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Time to Profitability */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-lg font-semibold text-gray-900">Time to Profitability</label>
          <Tooltip text="Longer timelines allow more growth potential" />
        </div>
        <div className="space-y-3">
          <Slider
            value={[preferences.time_to_profitability_months || 12]}
            onValueChange={(value) => updatePreferences({ time_to_profitability_months: value[0] })}
            min={1}
            max={60}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>1 month</span>
            <span className="font-semibold text-gray-900">
              {preferences.time_to_profitability_months || 12} months
            </span>
            <span>60 months</span>
          </div>
          <p className="text-xs text-gray-500">💡 Most passive income businesses take 6-18 months to stabilize</p>
        </div>
      </div>

      <Button onClick={handleNext} className="w-full mt-6">
        Continue to Portfolio Goals
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