import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp, AlertTriangle, DollarSign, Calendar, Loader2, Heart, X, Brain, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function AIGeneratedDeals() {
  const [generatingDeals, setGeneratingDeals] = useState(false);
  const queryClient = useQueryClient();

  const { data: preferences } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const prefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
      return prefs[0];
    }
  });

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['ai-generated-deals'],
    queryFn: () => base44.entities.SourcedDealOpportunity.filter({ is_generated: true })
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('generateAIDeals', {
        preferences,
        count: 5
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-generated-deals'] });
      toast.success('AI generated new deal opportunities!');
      setGeneratingDeals(false);
    },
    onError: () => {
      toast.error('Failed to generate deals');
      setGeneratingDeals(false);
    }
  });

  const saveDealMutation = useMutation({
    mutationFn: async (dealId) => {
      const user = await base44.auth.me();
      await base44.entities.DealPipeline.create({
        deal_id: dealId,
        stage: 'discovery',
        source: 'ai_generated'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-pipeline'] });
      toast.success('Deal saved to pipeline!');
    }
  });

  const dismissDealMutation = useMutation({
    mutationFn: async (dealId) => {
      await base44.entities.SourcedDealOpportunity.update(dealId, { 
        status: 'dismissed' 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-generated-deals'] });
    }
  });

  const predictPerformanceMutation = useMutation({
    mutationFn: async (deal) => {
      const result = await base44.functions.invoke('predictDealPerformance', { deal });
      return { dealId: deal.id, predictions: result.data.predictions };
    },
    onSuccess: async ({ dealId, predictions }) => {
      await base44.entities.SourcedDealOpportunity.update(dealId, {
        predicted_roi: predictions.predicted_roi,
        predicted_risk_score: predictions.predicted_risk_score,
        predicted_time_to_profit: predictions.predicted_time_to_profit,
        prediction_confidence: predictions.confidence_level,
        prediction_generated_at: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ['ai-generated-deals'] });
      toast.success('AI predictions generated!');
    },
    onError: () => {
      toast.error('Failed to generate predictions');
    }
  });

  const getRiskColor = (level) => {
    if (level <= 3) return 'text-green-400';
    if (level <= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskLabel = (level) => {
    if (level <= 3) return 'Low Risk';
    if (level <= 6) return 'Medium Risk';
    return 'High Risk';
  };

  if (isLoading) {
    return (
      <Card className="bg-[#1a0f2e] border-[#2d1e50]">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8b85f7]" />
          <p className="text-gray-400 mt-4">Loading AI-generated deals...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#8b85f7]" />
            AI-Generated Opportunities
          </h2>
          <p className="text-gray-400 mt-1">
            Personalized deals based on your preferences and portfolio goals
          </p>
        </div>
        <Button
          onClick={() => {
            setGeneratingDeals(true);
            generateMutation.mutate();
          }}
          disabled={generatingDeals}
          className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] hover:from-[#9a95ff] hover:to-[#00d4ff]"
        >
          {generatingDeals ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate New Deals
            </>
          )}
        </Button>
      </div>

      {/* Deals Grid */}
      <AnimatePresence>
        {deals.filter(d => d.status !== 'dismissed').length === 0 ? (
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardContent className="p-12 text-center">
              <Sparkles className="w-16 h-16 mx-auto text-[#8b85f7] mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No AI Deals Yet</h3>
              <p className="text-gray-400 mb-6">
                Click "Generate New Deals" to have AI find opportunities matched to your preferences
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {deals.filter(d => d.status !== 'dismissed').map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-[#1a0f2e] border-[#2d1e50] hover:border-[#8b85f7]/50 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white mb-2">{deal.title}</CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-[#8b85f7]/20 text-[#8b85f7] border-[#8b85f7]/50">
                            {deal.industry}
                          </Badge>
                          <Badge className={`${getRiskColor(deal.risk_score)} bg-opacity-20`}>
                            {getRiskLabel(deal.risk_score)}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => dismissDealMutation.mutate(deal.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-300">{deal.summary}</p>

                    {/* AI Predictions */}
                    {deal.predicted_roi && (
                      <div className="bg-gradient-to-r from-[#8b85f7]/10 to-[#00b7eb]/10 rounded-lg p-3 border border-[#8b85f7]/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Brain className="w-4 h-4 text-[#8b85f7]" />
                          <span className="text-sm font-semibold text-[#8b85f7]">AI Predictions</span>
                          <Badge className="ml-auto bg-[#8b85f7]/20 text-[#8b85f7] border-[#8b85f7]/50">
                            {deal.prediction_confidence}% Confidence
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-white">{deal.predicted_roi?.toFixed(1)}%</div>
                            <div className="text-xs text-gray-400">Predicted ROI</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-white">{deal.predicted_risk_score?.toFixed(1)}/10</div>
                            <div className="text-xs text-gray-400">Risk Level</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-white">{deal.predicted_time_to_profit}mo</div>
                            <div className="text-xs text-gray-400">Time to Profit</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Generate Predictions Button */}
                    {!deal.predicted_roi && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => predictPerformanceMutation.mutate(deal)}
                        disabled={predictPerformanceMutation.isPending}
                        className="w-full border-[#8b85f7]/50 text-[#8b85f7] hover:bg-[#8b85f7]/10"
                      >
                        {predictPerformanceMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Activity className="w-4 h-4 mr-2" />
                            Generate AI Predictions
                          </>
                        )}
                      </Button>
                    )}

                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <DollarSign className="w-5 h-5 mx-auto text-green-400 mb-1" />
                        <div className="text-lg font-bold text-white">
                          ${(deal.estimated_value / 1000).toFixed(0)}K
                        </div>
                        <div className="text-xs text-gray-400">Est. Value</div>
                      </div>
                      <div className="text-center">
                        <TrendingUp className="w-5 h-5 mx-auto text-blue-400 mb-1" />
                        <div className="text-lg font-bold text-white">{deal.estimated_roi}%</div>
                        <div className="text-xs text-gray-400">Est. ROI</div>
                      </div>
                      <div className="text-center">
                        <Calendar className="w-5 h-5 mx-auto text-purple-400 mb-1" />
                        <div className="text-lg font-bold text-white">{deal.time_to_roi}</div>
                        <div className="text-xs text-gray-400">Timeline</div>
                      </div>
                    </div>

                    {/* Opportunities */}
                    {deal.key_opportunities && (
                      <div className="bg-[#0f0618] rounded-lg p-3 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-semibold text-green-400">Key Opportunities</span>
                        </div>
                        <ul className="text-xs text-gray-300 space-y-1">
                          {deal.key_opportunities.slice(0, 3).map((opp, i) => (
                            <li key={i}>• {opp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Risks */}
                    {deal.key_risks && (
                      <div className="bg-[#0f0618] rounded-lg p-3 border border-yellow-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-semibold text-yellow-400">Key Risks</span>
                        </div>
                        <ul className="text-xs text-gray-300 space-y-1">
                          {deal.key_risks.slice(0, 2).map((risk, i) => (
                            <li key={i}>• {risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI Match Score */}
                    <div className="flex items-center justify-between bg-[#8b85f7]/10 rounded-lg p-3 border border-[#8b85f7]/30">
                      <span className="text-sm text-gray-300">AI Match Score</span>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-[#8b85f7]">{deal.match_score}%</div>
                        <Sparkles className="w-5 h-5 text-[#8b85f7]" />
                      </div>
                    </div>

                    {/* Actions */}
                    <Button
                      onClick={() => saveDealMutation.mutate(deal.id)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Save to Pipeline
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}