import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, HelpCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const INDUSTRIES = [
  'SaaS & Software', 'E-commerce', 'Content & Media', 'Mobile Apps',
  'Digital Products', 'Affiliate Marketing', 'Amazon FBA', 'Dropshipping',
  'Print on Demand', 'Online Courses', 'Consulting', 'Real Estate'
];

const DEAL_STRUCTURES = [
  'Equity Purchase', 'Revenue Share', 'Licensing Deal', 'Partnership',
  'Franchise', 'Acquisition', 'Joint Venture'
];

const GEO_REGIONS = [
  'North America', 'Europe', 'Asia-Pacific', 'Latin America',
  'Middle East', 'Africa', 'Global/Remote'
];

export default function DealSourcingStep({ preferences, updatePreferences }) {
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
        currentStep: 'deal_sourcing'
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-900 font-medium">What is Deal Sourcing?</p>
          <p className="text-sm text-blue-700 mt-1">
            Define criteria so our AI can automatically find passive income opportunities 
            that match your investment style, budget, and risk tolerance.
          </p>
        </div>
      </div>

      {/* Industries */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Target Industries <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-3">Select at least one industry you're interested in</p>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map((industry) => (
            <Badge
              key={industry}
              onClick={() => toggleItem('target_industries', industry)}
              className={`cursor-pointer ${
                preferences.target_industries?.includes(industry)
                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {industry}
            </Badge>
          ))}
        </div>
      </div>

      {/* Investment Range */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-2 block">
            Min Investment ($)
          </label>
          <Input
            type="number"
            value={preferences.investment_size_min}
            onChange={(e) => updatePreferences({ investment_size_min: Number(e.target.value) })}
            placeholder="1000"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-2 block">
            Max Investment ($)
          </label>
          <Input
            type="number"
            value={preferences.investment_size_max}
            onChange={(e) => updatePreferences({ investment_size_max: Number(e.target.value) })}
            placeholder="50000"
          />
        </div>
      </div>

      {/* Risk Tolerance */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Risk Tolerance
        </label>
        <Select
          value={preferences.risk_tolerance}
          onValueChange={(value) => updatePreferences({ risk_tolerance: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="very_conservative">Very Conservative - Minimize risk</SelectItem>
            <SelectItem value="conservative">Conservative - Low risk preferred</SelectItem>
            <SelectItem value="moderate">Moderate - Balanced approach</SelectItem>
            <SelectItem value="aggressive">Aggressive - Higher risk OK</SelectItem>
            <SelectItem value="very_aggressive">Very Aggressive - Maximum returns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deal Structures */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Preferred Deal Structures
        </label>
        <div className="flex flex-wrap gap-2">
          {DEAL_STRUCTURES.map((structure) => (
            <Badge
              key={structure}
              onClick={() => toggleItem('preferred_deal_structures', structure)}
              className={`cursor-pointer ${
                preferences.preferred_deal_structures?.includes(structure)
                  ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {structure}
            </Badge>
          ))}
        </div>
      </div>

      {/* Geographic Preferences */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Geographic Preferences
        </label>
        <div className="flex flex-wrap gap-2">
          {GEO_REGIONS.map((region) => (
            <Badge
              key={region}
              onClick={() => toggleItem('geo_preferences', region)}
              className={`cursor-pointer ${
                preferences.geo_preferences?.includes(region)
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {region}
            </Badge>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      {preferences.target_industries?.length > 0 && (
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
                Analyzing your criteria...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get AI Insights on My Strategy
              </>
            )}
          </Button>

          {aiInsights && (
            <Card className="mt-4 p-4 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
              <p className="text-sm text-gray-800 mb-3">{aiInsights.insight}</p>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700">Recommendations:</p>
                {aiInsights.recommendations?.map((rec, i) => (
                  <p key={i} className="text-xs text-gray-700 flex items-start gap-2">
                    <span className="text-violet-600">✓</span>
                    {rec}
                  </p>
                ))}
              </div>
              {aiInsights.concern && (
                <p className="text-xs text-orange-700 mt-3 flex items-start gap-2">
                  <span>⚠️</span>
                  {aiInsights.concern}
                </p>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}