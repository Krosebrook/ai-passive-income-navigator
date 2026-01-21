import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AIInsightsSummary() {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: strategy } = useQuery({
    queryKey: ['investment-strategy'],
    queryFn: async () => {
      const strategies = await base44.entities.InvestmentStrategy.list('-created_date', 1);
      return strategies[0];
    }
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['investment-alerts-active'],
    queryFn: () => base44.entities.InvestmentAlert.filter({ status: 'active' }, '-created_date', 5)
  });

  const { data: suggestions } = useQuery({
    queryKey: ['portfolio-suggestions'],
    queryFn: async () => {
      const suggs = await base44.entities.PortfolioAdjustmentSuggestion.filter({ status: 'pending' }, '-created_date', 1);
      return suggs[0];
    }
  });

  const generateInsights = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const response = await base44.functions.invoke('generateInvestmentStrategy', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-strategy'] });
      toast.success('AI insights generated successfully');
      setIsGenerating(false);
    },
    onError: (error) => {
      toast.error('Failed to generate insights');
      setIsGenerating(false);
    }
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/50';
      case 'medium': return 'bg-[#ff8e42]/20 text-[#ff8e42] border-[#ff8e42]/50';
      case 'low': return 'bg-[#00b7eb]/20 text-[#00b7eb] border-[#00b7eb]/50';
      default: return 'bg-[#64748b]/20 text-[#64748b] border-[#64748b]/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Generate Button */}
      <Card className="bg-gradient-to-r from-[#8b85f7]/10 to-[#00b7eb]/10 border-[#8b85f7]/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#8b85f7]/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#8b85f7]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Portfolio Insights</h3>
                <p className="text-sm text-[#64748b]">Real-time intelligence on your investments</p>
              </div>
            </div>
            <Button
              onClick={() => generateInsights.mutate()}
              disabled={isGenerating}
              className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0] hover:from-[#9a95ff] hover:to-[#6b4fff]"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Regenerate Insights
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Direction */}
      {strategy && (
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#10b981]" />
              <CardTitle className="text-white">Strategic Direction</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-[#94a3b8] leading-relaxed">{strategy.strategic_direction}</p>
            
            {strategy.short_term_actions && strategy.short_term_actions.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-white">Priority Actions:</p>
                {strategy.short_term_actions.slice(0, 3).map((action, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-[#0f0618] rounded-lg">
                    <Badge className={`mt-0.5 ${
                      action.priority === 'high' ? 'bg-[#ef4444]/20 text-[#ef4444]' :
                      action.priority === 'medium' ? 'bg-[#ff8e42]/20 text-[#ff8e42]' :
                      'bg-[#00b7eb]/20 text-[#00b7eb]'
                    }`}>
                      {action.priority}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-white text-sm">{action.action}</p>
                      <p className="text-xs text-[#64748b] mt-1">{action.timeline}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#ff8e42]" />
              <CardTitle className="text-white">Active Alerts ({alerts.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 bg-[#0f0618] rounded-lg border border-[#2d1e50]">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-semibold">{alert.title}</h4>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#94a3b8] mb-3">{alert.description}</p>
                  {alert.recommended_action && (
                    <div className="flex items-start gap-2 p-2 bg-[#8b85f7]/10 rounded border border-[#8b85f7]/20">
                      <Lightbulb className="w-4 h-4 text-[#8b85f7] mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-[#8b85f7]">{alert.recommended_action}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Adjustment Suggestions */}
      {suggestions && suggestions.recommendations && (
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[#00b7eb]" />
              <CardTitle className="text-white">Rebalancing Recommendations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-[#94a3b8] mb-4">{suggestions.overall_assessment}</p>
            <div className="space-y-3">
              {suggestions.recommendations.slice(0, 3).map((rec, idx) => (
                <div key={idx} className="p-3 bg-[#0f0618] rounded-lg border border-[#2d1e50]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">{rec.category}</span>
                    <Badge className={`${
                      rec.priority === 'high' ? 'bg-[#ef4444]/20 text-[#ef4444]' :
                      rec.priority === 'medium' ? 'bg-[#ff8e42]/20 text-[#ff8e42]' :
                      'bg-[#00b7eb]/20 text-[#00b7eb]'
                    }`}>
                      {rec.action} {rec.percentage}%
                    </Badge>
                  </div>
                  <p className="text-sm text-[#94a3b8]">{rec.rationale}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!strategy && alerts.length === 0 && !suggestions && (
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardContent className="py-12 text-center">
            <Sparkles className="w-12 h-12 text-[#8b85f7] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Insights Yet</h3>
            <p className="text-[#64748b] mb-4">Generate AI-powered insights about your portfolio</p>
            <Button
              onClick={() => generateInsights.mutate()}
              disabled={isGenerating}
              className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Insights
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}