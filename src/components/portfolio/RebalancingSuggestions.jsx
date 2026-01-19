import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, RefreshCw, CheckCircle, X, 
  AlertTriangle, Sparkles, Loader2, ChevronDown, ChevronUp 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function RebalancingSuggestions() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);
  const queryClient = useQueryClient();

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['portfolio-suggestions'],
    queryFn: () => base44.entities.PortfolioAdjustmentSuggestion.filter(
      { status: 'pending' },
      '-generated_at'
    )
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('suggestPortfolioAdjustments', {});
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-suggestions'] });
      toast.success('New portfolio recommendations generated!');
      setIsGenerating(false);
    },
    onError: (error) => {
      toast.error('Failed to generate recommendations: ' + error.message);
      setIsGenerating(false);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }) => 
      base44.entities.PortfolioAdjustmentSuggestion.update(id, { 
        status, 
        user_notes: notes 
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-suggestions'] });
      const action = variables.status === 'accepted' ? 'accepted' : 'dismissed';
      toast.success(`Recommendation ${action}!`);
    }
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getActionIcon = (action) => {
    if (action?.toLowerCase().includes('increase') || action?.toLowerCase().includes('acquire')) {
      return <TrendingUp className="w-4 h-4 text-green-400" />;
    }
    if (action?.toLowerCase().includes('reduce') || action?.toLowerCase().includes('divest')) {
      return <TrendingDown className="w-4 h-4 text-red-400" />;
    }
    return <RefreshCw className="w-4 h-4 text-blue-400" />;
  };

  if (isLoading) {
    return (
      <Card className="bg-[#1a0f2e] border-[#2d1e50]">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8b85f7]" />
          <p className="text-gray-400 mt-4">Loading recommendations...</p>
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
            Portfolio Rebalancing
          </h2>
          <p className="text-gray-400 mt-1">
            AI-powered recommendations to optimize your portfolio
          </p>
        </div>
        <Button
          onClick={() => {
            setIsGenerating(true);
            generateMutation.mutate();
          }}
          disabled={isGenerating}
          className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] hover:from-[#9a95ff] hover:to-[#00d4ff]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New
            </>
          )}
        </Button>
      </div>

      {/* Suggestions */}
      {suggestions.length === 0 ? (
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardContent className="p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto text-[#8b85f7] mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Recommendations Yet</h3>
            <p className="text-gray-400 mb-6">
              Click "Generate New" to get AI-powered portfolio rebalancing suggestions
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-[#1a0f2e] border-[#2d1e50] hover:border-[#8b85f7]/50 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white mb-2">
                          Portfolio Analysis & Recommendations
                        </CardTitle>
                        <p className="text-sm text-gray-400">
                          Generated {new Date(suggestion.generated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExpandedSuggestion(
                          expandedSuggestion === suggestion.id ? null : suggestion.id
                        )}
                      >
                        {expandedSuggestion === suggestion.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Overall Assessment */}
                    <div className="bg-[#8b85f7]/10 rounded-lg p-4 border border-[#8b85f7]/30">
                      <p className="text-sm text-gray-200 leading-relaxed">
                        {suggestion.overall_assessment}
                      </p>
                    </div>

                    {/* Market Context */}
                    {suggestion.market_context && (
                      <div className="bg-[#0f0618] rounded-lg p-3 border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-semibold text-blue-400">Market Context</span>
                        </div>
                        <p className="text-xs text-gray-300">{suggestion.market_context}</p>
                      </div>
                    )}

                    {/* Recommendations Preview (first 3) */}
                    <div className="space-y-2">
                      {suggestion.recommendations?.slice(0, expandedSuggestion === suggestion.id ? undefined : 3).map((rec, idx) => (
                        <div
                          key={idx}
                          className="bg-[#0f0618] rounded-lg p-3 border border-[#2d1e50] hover:border-[#8b85f7]/30 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              {getActionIcon(rec.action)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold text-white capitalize">
                                    {rec.action} {rec.category}
                                  </span>
                                  <Badge className={getPriorityColor(rec.priority)}>
                                    {rec.priority}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-400 mb-2">{rec.rationale}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  {rec.percentage && (
                                    <span>Target: {rec.percentage > 0 ? '+' : ''}{rec.percentage}%</span>
                                  )}
                                  {rec.timeline && <span>⏱ {rec.timeline}</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Show more indicator */}
                    {!expandedSuggestion && suggestion.recommendations?.length > 3 && (
                      <p className="text-sm text-center text-gray-400">
                        +{suggestion.recommendations.length - 3} more recommendations
                      </p>
                    )}

                    {/* Target Allocation (when expanded) */}
                    {expandedSuggestion === suggestion.id && suggestion.target_allocation && (
                      <div className="bg-[#0f0618] rounded-lg p-4 border border-[#2d1e50]">
                        <h4 className="text-sm font-semibold text-white mb-3">
                          Recommended Target Allocation
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(suggestion.target_allocation).map(([category, percentage]) => (
                            <div key={category}>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-300 capitalize">{category}</span>
                                <span className="text-[#8b85f7] font-semibold">{percentage}%</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risk Analysis (when expanded) */}
                    {expandedSuggestion === suggestion.id && suggestion.risk_analysis && (
                      <div className="bg-[#0f0618] rounded-lg p-4 border border-yellow-500/20">
                        <h4 className="text-sm font-semibold text-yellow-400 mb-3">
                          Risk Analysis
                        </h4>
                        <div className="space-y-2 text-xs text-gray-300">
                          <div className="flex justify-between">
                            <span>Current Risk:</span>
                            <span className="text-yellow-400">
                              {suggestion.risk_analysis.current_risk_level}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Recommended Risk:</span>
                            <span className="text-green-400">
                              {suggestion.risk_analysis.recommended_risk_level}
                            </span>
                          </div>
                          {suggestion.risk_analysis.notes && (
                            <p className="pt-2 border-t border-[#2d1e50]">
                              {suggestion.risk_analysis.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => updateStatusMutation.mutate({
                          id: suggestion.id,
                          status: 'accepted',
                          notes: 'Accepted via UI'
                        })}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept Recommendations
                      </Button>
                      <Button
                        onClick={() => updateStatusMutation.mutate({
                          id: suggestion.id,
                          status: 'dismissed',
                          notes: 'Dismissed via UI'
                        })}
                        disabled={updateStatusMutation.isPending}
                        variant="outline"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}