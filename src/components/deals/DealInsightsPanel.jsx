import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, Target, AlertTriangle, CheckCircle2, 
  TrendingUp, TrendingDown, Sparkles, Loader2,
  Shield, Zap, Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function DealInsightsPanel({ dealId }) {
  const [insights, setInsights] = React.useState(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('generateDealInsights', { dealId });
      return result.data;
    },
    onSuccess: (data) => {
      setInsights(data.insights);
      toast.success('AI insights generated');
    },
    onError: () => {
      toast.error('Failed to generate insights');
    }
  });

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="space-y-6">
      {!insights ? (
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardContent className="p-12 text-center">
            <Brain className="w-16 h-16 text-[#8b85f7] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">AI-Powered Deal Insights</h3>
            <p className="text-gray-400 mb-6">
              Get predictive analytics, negotiation strategies, and risk analysis
            </p>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb]"
            >
              {generateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate Insights
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Success Probability */}
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#8b85f7]" />
                Success Probability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-gradient">
                  {insights.success_probability.score}%
                </div>
                <Badge className={
                  insights.success_probability.confidence === 'high' ? 'bg-emerald-500/20 text-emerald-400' :
                  insights.success_probability.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }>
                  {insights.success_probability.confidence} confidence
                </Badge>
              </div>
              
              <Progress value={insights.success_probability.score} className="h-2" />
              
              <div className="space-y-2 mt-4">
                <p className="text-sm font-semibold text-gray-400">Key Factors:</p>
                {insights.success_probability.key_factors?.map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded bg-[#0f0618]">
                    {factor.impact === 'positive' ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : factor.impact === 'negative' ? (
                      <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-white">{factor.factor}</p>
                      <p className="text-xs text-gray-500">Weight: {(factor.weight * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Negotiation Strategies */}
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#00b7eb]" />
                Negotiation Strategies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.negotiation_strategies?.map((strategy, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-white">{strategy.strategy}</h4>
                    <Badge variant="outline" className="ml-2">
                      <Clock className="w-3 h-3 mr-1" />
                      {strategy.timing}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{strategy.description}</p>
                  <p className="text-xs text-[#8b85f7]">
                    Expected: {strategy.expected_outcome}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.risk_analysis?.map((risk, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-white flex-1">{risk.risk}</h4>
                    <div className="flex gap-2">
                      <Badge className={getImpactColor(risk.likelihood)}>
                        {risk.likelihood} likelihood
                      </Badge>
                      <Badge className={getImpactColor(risk.impact)}>
                        {risk.impact} impact
                      </Badge>
                    </div>
                  </div>
                  
                  {risk.warning_signs?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-400 mb-1">Warning Signs:</p>
                      <ul className="space-y-1">
                        {risk.warning_signs.map((sign, i) => (
                          <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                            <span className="text-yellow-400">⚠</span>
                            {sign}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {risk.mitigation_steps?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1">Mitigation:</p>
                      <ul className="space-y-1">
                        {risk.mitigation_steps.map((step, i) => (
                          <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                            <Shield className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {insights.action_items?.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#0f0618]">
                  <Badge className={getImpactColor(item.priority)}>
                    {item.priority}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{item.action}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">Timeline: {item.timeline}</span>
                      <span className="text-xs text-[#00b7eb]">{item.expected_impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            variant="outline"
            className="w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Regenerate Insights
          </Button>
        </>
      )}
    </div>
  );
}