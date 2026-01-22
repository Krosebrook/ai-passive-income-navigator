import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function RebalancingPanel({ investments }) {
  const [generating, setGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const handleGenerateRecommendations = async () => {
    setGenerating(true);
    try {
      const { data } = await base44.functions.invoke('generateRebalancingRecommendations', {});
      setRecommendations(data.recommendations);
      toast.success('Rebalancing recommendations generated');
    } catch (error) {
      toast.error('Failed to generate recommendations');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="card-dark">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] bg-clip-text text-transparent">
            <TrendingUp className="w-5 h-5 text-[#8b85f7]" />
            Portfolio Rebalancing
          </CardTitle>
          <Button onClick={handleGenerateRecommendations} disabled={generating} className="btn-primary">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Recommendations
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {generating ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : !recommendations ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Recommendations Yet</h3>
            <p className="text-gray-400 mb-6">
              Generate AI-powered rebalancing recommendations based on your goals and market conditions
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Portfolio Health */}
            <div className="p-4 rounded-xl border border-[#2d1e50] bg-[#0f0618]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {recommendations.portfolio_health_score}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Portfolio Health Score</p>
                  <p className="text-white">{recommendations.health_assessment}</p>
                </div>
              </div>
            </div>

            {/* Rebalancing Actions */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Recommended Actions</h3>
              <div className="space-y-3">
                {recommendations.rebalancing_actions?.map((action, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-[#2d1e50] bg-[#0f0618]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={
                            action.priority === 'high' ? 'badge-error' :
                            action.priority === 'medium' ? 'badge-warning' : 'badge-primary'
                          }>
                            {action.priority}
                          </Badge>
                          <span className="text-white font-medium">{action.action}</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{action.investment_name}</p>
                        <p className="text-sm text-gray-300">{action.rationale}</p>
                      </div>
                      <p className="text-lg font-bold text-[#00b7eb]">
                        ${action.amount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Improvements */}
            {recommendations.expected_improvements && (
              <div className="p-4 rounded-xl border border-[#8b85f7]/30 bg-[#8b85f7]/5">
                <h3 className="text-lg font-semibold text-white mb-3">Expected Improvements</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#8b85f7]" />
                    <span className="text-sm text-gray-300">
                      Risk Reduction: {recommendations.expected_improvements.risk_reduction}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#00b7eb]" />
                    <span className="text-sm text-gray-300">
                      Return Potential: {recommendations.expected_improvements.return_potential}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#ff8e42]" />
                    <span className="text-sm text-gray-300">
                      Diversification: {recommendations.expected_improvements.diversification}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}