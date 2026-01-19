import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, Loader2, Target, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function DealMarketAnalysis({ dealId }) {
  const [analysis, setAnalysis] = useState(null);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('analyzeMarketImpact', { dealId });
      return result.data;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success('Market analysis complete');
    },
    onError: () => {
      toast.error('Failed to analyze market impact');
    }
  });

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'bg-emerald-500/20 text-emerald-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'critical': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {!analysis ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">
            Analyze how current market conditions impact this deal
          </p>
          <Button
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
            className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb]"
          >
            {analyzeMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <TrendingUp className="w-4 h-4 mr-2" />
            )}
            Analyze Market Impact
          </Button>
        </div>
      ) : (
        <>
          {/* Risk Assessment */}
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-white">Risk Assessment</h4>
                    <Badge className={getRiskColor(analysis.analysis.risk_assessment.level)}>
                      {analysis.analysis.risk_assessment.level}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">
                    {analysis.analysis.risk_assessment.explanation}
                  </p>
                  {analysis.analysis.risk_assessment.market_factors && (
                    <ul className="space-y-1">
                      {analysis.analysis.risk_assessment.market_factors.map((factor, idx) => (
                        <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                          <span className="text-[#8b85f7]">•</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opportunity Score */}
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-[#00b7eb]" />
                  <div>
                    <p className="text-sm text-gray-400">Opportunity Score</p>
                    <p className="text-2xl font-bold text-white">
                      {analysis.analysis.opportunity_score}/100
                    </p>
                  </div>
                </div>
                <div className={`text-4xl ${analysis.analysis.opportunity_score > 70 ? 'text-emerald-400' : analysis.analysis.opportunity_score > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {analysis.analysis.opportunity_score > 70 ? <TrendingUp className="w-10 h-10" /> : <TrendingDown className="w-10 h-10" />}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {analysis.analysis.recommendations && analysis.analysis.recommendations.length > 0 && (
            <Card className="bg-[#1a0f2e] border-[#2d1e50]">
              <CardContent className="p-4">
                <h4 className="font-semibold text-white mb-3">Recommendations</h4>
                <div className="space-y-3">
                  {analysis.analysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#0f0618]">
                      <Badge className={
                        rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }>
                        {rec.priority}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium text-white mb-1">{rec.action}</p>
                        <p className="text-sm text-gray-400">{rec.rationale}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Optimal Timing */}
          {analysis.analysis.optimal_timing && (
            <Card className="bg-[#1a0f2e] border-[#2d1e50]">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#8b85f7] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Optimal Timing</h4>
                    <p className="text-sm text-[#00b7eb] mb-2">
                      {analysis.analysis.optimal_timing.timeframe}
                    </p>
                    <p className="text-sm text-gray-400">
                      {analysis.analysis.optimal_timing.reasoning}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
            variant="outline"
            className="w-full"
          >
            Refresh Analysis
          </Button>
        </>
      )}
    </div>
  );
}