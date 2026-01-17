import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ReviewStep({ preferences }) {
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateSummary();
  }, []);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateOnboardingInsights', {
        preferences,
        currentStep: 'summary'
      });
      setAiSummary(response.data.insights);
    } catch (error) {
      console.error('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">AI is preparing your personalized summary...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Summary */}
      {aiSummary && (
        <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <div className="flex items-start gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-violet-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Your Personalized Investment Profile</h3>
              <p className="text-sm text-gray-700">{aiSummary.welcome_message}</p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <p className="text-xs font-semibold text-gray-700 uppercase">Recommended Next Steps:</p>
            {aiSummary.next_steps?.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{step}</p>
              </div>
            ))}
          </div>

          {aiSummary.first_action && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-violet-200">
              <p className="text-xs font-semibold text-violet-900 mb-1">Start Here:</p>
              <p className="text-sm text-gray-800">{aiSummary.first_action}</p>
            </div>
          )}
        </Card>
      )}

      {/* Deal Sourcing Summary */}
      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Deal Sourcing Criteria</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Investment Range:</span>
            <span className="font-medium">${preferences.investment_size_min?.toLocaleString()} - ${preferences.investment_size_max?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Risk Tolerance:</span>
            <span className="font-medium capitalize">{preferences.risk_tolerance?.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-gray-600 block mb-2">Target Industries:</span>
            <div className="flex flex-wrap gap-1">
              {preferences.target_industries?.map((industry) => (
                <Badge key={industry} variant="outline">{industry}</Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Portfolio Goals Summary */}
      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Portfolio Goals</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Time Horizon:</span>
            <span className="font-medium capitalize">{preferences.time_horizon?.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Target Return:</span>
            <span className="font-medium">{preferences.target_return_percentage}% annually</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Diversification:</span>
            <span className="font-medium capitalize">{preferences.diversification_preference?.replace('_', ' ')}</span>
          </div>
        </div>
      </Card>

      {/* Community Preferences Summary */}
      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Community Preferences</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Community Focus:</span>
            <span className="font-medium capitalize">{preferences.networking_vs_knowledge?.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Notifications:</span>
            <span className="font-medium capitalize">{preferences.community_notification_frequency?.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Profile Visibility:</span>
            <span className="font-medium capitalize">{preferences.profile_visibility?.replace('_', ' ')}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}