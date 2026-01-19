import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, CheckCircle, Settings, TrendingUp, DollarSign, Shield } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/ui/PageHeader';

const INDUSTRIES = [
  'SaaS', 'E-commerce', 'Content Sites', 'Mobile Apps', 
  'Digital Products', 'Agencies', 'Marketplaces', 'Subscription Services',
  'Real Estate', 'Dropshipping', 'Affiliate Marketing', 'Consulting'
];

const DEAL_STRUCTURES = [
  'Equity Purchase', 'Revenue Share', 'Licensing', 'Royalty Agreement',
  'Joint Venture', 'Asset Acquisition', 'Profit Sharing', 'Franchise'
];

export default function UserPreferencesPage() {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);

  const [preferences, setPreferences] = useState({
    risk_tolerance: 'moderate',
    investment_size_min: 5000,
    investment_size_max: 50000,
    target_industries: [],
    preferred_deal_structures: [],
    target_return_percentage: 20,
    time_horizon: 'medium_term',
    diversification_preference: 'moderately_diversified'
  });

  const { data: existingPrefs, isLoading } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const prefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
      return prefs[0] || null;
    }
  });

  useEffect(() => {
    if (existingPrefs) {
      setPreferences({
        risk_tolerance: existingPrefs.risk_tolerance || 'moderate',
        investment_size_min: existingPrefs.investment_size_min || 5000,
        investment_size_max: existingPrefs.investment_size_max || 50000,
        target_industries: existingPrefs.target_industries || [],
        preferred_deal_structures: existingPrefs.preferred_deal_structures || [],
        target_return_percentage: existingPrefs.target_return_percentage || 20,
        time_horizon: existingPrefs.time_horizon || 'medium_term',
        diversification_preference: existingPrefs.diversification_preference || 'moderately_diversified'
      });
    }
  }, [existingPrefs]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      
      if (existingPrefs) {
        await base44.entities.UserPreferences.update(existingPrefs.id, preferences);
      } else {
        await base44.entities.UserPreferences.create({
          ...preferences,
          created_by: user.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      setHasChanges(false);
      toast.success('Preferences saved! AI will now match deals to your new criteria.');
    },
    onError: () => {
      toast.error('Failed to save preferences');
    }
  });

  const handleChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const toggleArrayItem = (field, item) => {
    setPreferences(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#8b85f7]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0618] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Deal Preferences"
          subtitle="Configure your criteria to get perfectly matched passive income opportunities"
          icon={Settings}
        />

        <div className="space-y-6 mt-8">
          {/* Risk Tolerance */}
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5 text-[#8b85f7]" />
                Risk Tolerance
              </CardTitle>
              <CardDescription>How much risk are you comfortable with?</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={preferences.risk_tolerance}
                onValueChange={(value) => handleChange('risk_tolerance', value)}
              >
                <SelectTrigger className="bg-[#0f0618] border-[#2d1e50]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very_conservative">Very Conservative</SelectItem>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                  <SelectItem value="very_aggressive">Very Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Investment Size Range */}
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <DollarSign className="w-5 h-5 text-[#00b7eb]" />
                Investment Size Range
              </CardTitle>
              <CardDescription>How much are you willing to invest per deal?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 text-sm mb-2 block">Minimum ($)</Label>
                  <Input
                    type="number"
                    value={preferences.investment_size_min}
                    onChange={(e) => handleChange('investment_size_min', parseInt(e.target.value))}
                    className="bg-[#0f0618] border-[#2d1e50]"
                  />
                </div>
                <div>
                  <Label className="text-gray-400 text-sm mb-2 block">Maximum ($)</Label>
                  <Input
                    type="number"
                    value={preferences.investment_size_max}
                    onChange={(e) => handleChange('investment_size_max', parseInt(e.target.value))}
                    className="bg-[#0f0618] border-[#2d1e50]"
                  />
                </div>
              </div>
              <div className="text-center text-sm text-gray-400">
                Range: ${preferences.investment_size_min.toLocaleString()} - ${preferences.investment_size_max.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Target Return */}
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5 text-[#00b7eb]" />
                Target Annual Return
              </CardTitle>
              <CardDescription>Expected return on investment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Target ROI</span>
                <span className="text-lg font-semibold text-[#8b85f7]">
                  {preferences.target_return_percentage}%
                </span>
              </div>
              <Slider
                value={[preferences.target_return_percentage]}
                onValueChange={(value) => handleChange('target_return_percentage', value[0])}
                min={5}
                max={100}
                step={5}
                className="slider-thumb"
              />
            </CardContent>
          </Card>

          {/* Preferred Industries */}
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardHeader>
              <CardTitle className="text-white">Preferred Industries</CardTitle>
              <CardDescription>Select all industries you're interested in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map(industry => (
                  <Badge
                    key={industry}
                    onClick={() => toggleArrayItem('target_industries', industry)}
                    className={`cursor-pointer transition-all ${
                      preferences.target_industries.includes(industry)
                        ? 'bg-[#8b85f7] text-white border-[#8b85f7]'
                        : 'bg-[#0f0618] text-gray-400 border-[#2d1e50] hover:border-[#8b85f7]/50'
                    }`}
                  >
                    {industry}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deal Structures */}
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardHeader>
              <CardTitle className="text-white">Preferred Deal Structures</CardTitle>
              <CardDescription>How do you want to structure your deals?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {DEAL_STRUCTURES.map(structure => (
                  <Badge
                    key={structure}
                    onClick={() => toggleArrayItem('preferred_deal_structures', structure)}
                    className={`cursor-pointer transition-all ${
                      preferences.preferred_deal_structures.includes(structure)
                        ? 'bg-[#00b7eb] text-white border-[#00b7eb]'
                        : 'bg-[#0f0618] text-gray-400 border-[#2d1e50] hover:border-[#00b7eb]/50'
                    }`}
                  >
                    {structure}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Horizon */}
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardHeader>
              <CardTitle className="text-white">Investment Time Horizon</CardTitle>
              <CardDescription>How long are you planning to hold investments?</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={preferences.time_horizon}
                onValueChange={(value) => handleChange('time_horizon', value)}
              >
                <SelectTrigger className="bg-[#0f0618] border-[#2d1e50]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short_term">Short Term (0-2 years)</SelectItem>
                  <SelectItem value="medium_term">Medium Term (2-5 years)</SelectItem>
                  <SelectItem value="long_term">Long Term (5+ years)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Diversification */}
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardHeader>
              <CardTitle className="text-white">Diversification Preference</CardTitle>
              <CardDescription>How do you want to spread your investments?</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={preferences.diversification_preference}
                onValueChange={(value) => handleChange('diversification_preference', value)}
              >
                <SelectTrigger className="bg-[#0f0618] border-[#2d1e50]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="focused">Focused (Few concentrated bets)</SelectItem>
                  <SelectItem value="moderately_diversified">Moderately Diversified</SelectItem>
                  <SelectItem value="highly_diversified">Highly Diversified</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="sticky bottom-4 flex justify-end">
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!hasChanges || saveMutation.isPending}
              className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] hover:from-[#9a95ff] hover:to-[#00d4ff] text-white px-8 py-6 text-lg shadow-lg glow-primary"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : hasChanges ? (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Preferences
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Saved
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}