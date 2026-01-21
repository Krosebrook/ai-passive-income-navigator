import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, TrendingDown, AlertTriangle, Lightbulb, 
  Target, Clock, Sparkles, RefreshCw, BarChart3, PieChart
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PredictiveInsightsDashboard() {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: insights, isLoading } = useQuery({
    queryKey: ['predictive-insights'],
    queryFn: async () => {
      const response = await base44.functions.invoke('generatePredictiveInsights', {});
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  const regenerateInsights = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const response = await base44.functions.invoke('generatePredictiveInsights', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictive-insights'] });
      toast.success('Predictive insights updated');
      setIsGenerating(false);
    },
    onError: () => {
      toast.error('Failed to generate insights');
      setIsGenerating(false);
    }
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/50';
      case 'medium': return 'bg-[#ff8e42]/20 text-[#ff8e42] border-[#ff8e42]/50';
      case 'low': return 'bg-[#00b7eb]/20 text-[#00b7eb] border-[#00b7eb]/50';
      default: return 'bg-[#64748b]/20 text-[#64748b] border-[#64748b]/50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-[#8b85f7]" />
      </div>
    );
  }

  const insightsData = insights?.insights || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-[#8b85f7]/10 to-[#00b7eb]/10 border-[#8b85f7]/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#8b85f7]/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#8b85f7]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Predictive Insights</h3>
                <p className="text-sm text-[#64748b]">AI-powered forecasts and recommendations</p>
              </div>
            </div>
            <Button
              onClick={() => regenerateInsights.mutate()}
              disabled={isGenerating}
              className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Insights
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="predictions" className="space-y-6">
        <TabsList className="bg-[#1a0f2e] border border-[#2d1e50]">
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="recommendations">Actions</TabsTrigger>
        </TabsList>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          {/* Next Month Predictions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-[#1a0f2e] border-[#2d1e50]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-5 h-5 text-[#10b981]" />
                  <Badge className="bg-[#10b981]/20 text-[#10b981]">Next Month</Badge>
                </div>
                <p className="text-3xl font-bold text-white">
                  ${insightsData.next_month_predictions?.expected_revenue?.toLocaleString()}
                </p>
                <p className="text-sm text-[#64748b] mt-1">Expected Revenue</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-[#64748b]">
                  <span>Range: ${insightsData.next_month_predictions?.confidence_interval?.low?.toLocaleString()}</span>
                  <span>-</span>
                  <span>${insightsData.next_month_predictions?.confidence_interval?.high?.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a0f2e] border-[#2d1e50]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-5 h-5 text-[#8b85f7]" />
                  <Badge className="bg-[#8b85f7]/20 text-[#8b85f7]">Next Month</Badge>
                </div>
                <p className="text-3xl font-bold text-white">
                  {insightsData.next_month_predictions?.expected_deals_closed || 0}
                </p>
                <p className="text-sm text-[#64748b] mt-1">Expected Deals Closed</p>
              </CardContent>
            </Card>

            <Card className="bg-[#1a0f2e] border-[#2d1e50]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-5 h-5 text-[#00b7eb]" />
                  <Badge className={`${
                    insightsData.next_quarter_outlook?.growth_trajectory === 'accelerating' ? 'bg-[#10b981]/20 text-[#10b981]' :
                    insightsData.next_quarter_outlook?.growth_trajectory === 'declining' ? 'bg-[#ef4444]/20 text-[#ef4444]' :
                    'bg-[#ff8e42]/20 text-[#ff8e42]'
                  }`}>
                    {insightsData.next_quarter_outlook?.growth_trajectory || 'stable'}
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-white">
                  ${insightsData.next_quarter_outlook?.revenue_forecast?.toLocaleString()}
                </p>
                <p className="text-sm text-[#64748b] mt-1">Q1 Forecast</p>
              </CardContent>
            </Card>
          </div>

          {/* Growth Drivers */}
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardHeader>
              <CardTitle className="text-white">Key Growth Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insightsData.next_quarter_outlook?.key_drivers?.map((driver, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-[#0f0618] rounded-lg">
                    <TrendingUp className="w-5 h-5 text-[#10b981] mt-0.5" />
                    <p className="text-[#94a3b8] flex-1">{driver}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Milestones */}
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-[#8b85f7]" />
                Performance Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-[#8b85f7] mb-2">Likely to Achieve</h4>
                  <div className="space-y-2">
                    {insightsData.performance_milestones?.likely_milestones?.map((milestone, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-[#0f0618] rounded">
                        <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                        <span className="text-sm text-[#94a3b8]">{milestone}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#00b7eb] mb-2">Stretch Goals</h4>
                  <div className="space-y-2">
                    {insightsData.performance_milestones?.stretch_goals?.map((goal, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-[#0f0618] rounded">
                        <div className="w-2 h-2 rounded-full bg-[#00b7eb]" />
                        <span className="text-sm text-[#94a3b8]">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risks" className="space-y-6">
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
                  Portfolio Risk Score
                </CardTitle>
                <Badge className={`text-lg ${
                  (insightsData.risk_predictions?.portfolio_risk_score || 0) > 7 ? 'bg-[#ef4444]/20 text-[#ef4444]' :
                  (insightsData.risk_predictions?.portfolio_risk_score || 0) > 4 ? 'bg-[#ff8e42]/20 text-[#ff8e42]' :
                  'bg-[#10b981]/20 text-[#10b981]'
                }`}>
                  {insightsData.risk_predictions?.portfolio_risk_score || 0}/10
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Market Risk Factors</h4>
                  <div className="space-y-2">
                    {insightsData.risk_predictions?.market_risk_factors?.map((risk, idx) => (
                      <div key={idx} className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg">
                        <p className="text-[#ef4444] text-sm">{risk}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Mitigation Strategies</h4>
                  <div className="space-y-2">
                    {insightsData.risk_predictions?.mitigation_recommendations?.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-[#0f0618] rounded-lg">
                        <Lightbulb className="w-5 h-5 text-[#8b85f7] mt-0.5 flex-shrink-0" />
                        <p className="text-[#94a3b8] text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Early Warning Indicators</h4>
                  <div className="space-y-2">
                    {insightsData.performance_milestones?.warning_indicators?.map((warning, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-[#ff8e42]/10 border border-[#ff8e42]/20 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-[#ff8e42] mt-0.5 flex-shrink-0" />
                        <p className="text-[#ff8e42] text-sm">{warning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#1a0f2e] border-[#2d1e50]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#10b981]" />
                  Emerging Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insightsData.opportunity_predictions?.emerging_opportunities?.map((opp, idx) => (
                    <div key={idx} className="p-4 bg-[#10b981]/10 border border-[#10b981]/20 rounded-lg">
                      <p className="text-white font-medium mb-1">Opportunity #{idx + 1}</p>
                      <p className="text-[#94a3b8] text-sm">{opp}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a0f2e] border-[#2d1e50]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#8b85f7]" />
                  Optimal Timing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-[#8b85f7]/10 border border-[#8b85f7]/20 rounded-lg">
                  <p className="text-[#8b85f7] font-semibold mb-2">
                    {insightsData.opportunity_predictions?.optimal_timing?.action}
                  </p>
                  <p className="text-[#94a3b8] text-sm mb-4">
                    Timeframe: {insightsData.opportunity_predictions?.optimal_timing?.timeframe}
                  </p>
                  <Badge className="bg-[#10b981]/20 text-[#10b981]">
                    Expected ROI Boost: +{insightsData.opportunity_predictions?.expected_roi_boost}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Correlation */}
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardHeader>
              <CardTitle className="text-white">Market Correlation Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#0f0618] rounded-lg">
                  <p className="text-sm text-[#64748b] mb-1">Correlation Strength</p>
                  <p className="text-xl font-bold text-white capitalize">
                    {insightsData.market_correlation_insights?.correlation_strength}
                  </p>
                </div>
                <div className="p-4 bg-[#0f0618] rounded-lg">
                  <p className="text-sm text-[#64748b] mb-1">Diversification Score</p>
                  <p className="text-xl font-bold text-white">
                    {insightsData.market_correlation_insights?.diversification_score}/100
                  </p>
                </div>
                <div className="p-4 bg-[#0f0618] rounded-lg">
                  <p className="text-sm text-[#64748b] mb-1">Portfolio Health</p>
                  <Badge className={`${
                    (insightsData.market_correlation_insights?.diversification_score || 0) > 70 ? 'bg-[#10b981]/20 text-[#10b981]' :
                    (insightsData.market_correlation_insights?.diversification_score || 0) > 40 ? 'bg-[#ff8e42]/20 text-[#ff8e42]' :
                    'bg-[#ef4444]/20 text-[#ef4444]'
                  }`}>
                    {(insightsData.market_correlation_insights?.diversification_score || 0) > 70 ? 'Excellent' :
                     (insightsData.market_correlation_insights?.diversification_score || 0) > 40 ? 'Good' : 'Needs Attention'}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-white">Key Correlations:</p>
                {insightsData.market_correlation_insights?.key_correlations?.map((corr, idx) => (
                  <p key={idx} className="text-sm text-[#94a3b8] p-2 bg-[#0f0618] rounded">
                    {corr}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {insightsData.actionable_recommendations?.map((rec, idx) => (
            <Card key={idx} className="bg-[#1a0f2e] border-[#2d1e50]">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-6 h-6 text-[#8b85f7] mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{rec.action}</h3>
                      <p className="text-sm text-[#64748b] mt-1">Timing: {rec.timing}</p>
                    </div>
                  </div>
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority} priority
                  </Badge>
                </div>
                <div className="ml-9 p-4 bg-[#0f0618] rounded-lg">
                  <p className="text-sm font-medium text-white mb-1">Expected Impact:</p>
                  <p className="text-[#94a3b8] text-sm">{rec.expected_impact}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}