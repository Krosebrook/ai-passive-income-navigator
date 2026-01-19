import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, TrendingUp, AlertCircle, BookmarkPlus, 
  ExternalLink, Loader2, RefreshCw, CheckCircle, X, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function NewDealsFeed() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [analyzingDealId, setAnalyzingDealId] = useState(null);
  const [expandedDealId, setExpandedDealId] = useState(null);
  const queryClient = useQueryClient();

  const { data: newDeals = [], isLoading } = useQuery({
    queryKey: ['new-deals-feed'],
    queryFn: async () => {
      const deals = await base44.entities.SourcedDealOpportunity.filter(
        { status: 'pending', is_generated: true },
        '-created_date',
        20
      );
      return deals;
    }
  });

  const generateDealsMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('proactivelySourceDeals', { count: 5 });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['new-deals-feed'] });
      toast.success('New opportunities discovered!');
      setIsGenerating(false);
    },
    onError: (error) => {
      toast.error('Failed to source new deals');
      setIsGenerating(false);
    }
  });

  const saveDealMutation = useMutation({
    mutationFn: (dealId) => base44.entities.SourcedDealOpportunity.update(dealId, { 
      status: 'accepted'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['new-deals-feed'] });
      toast.success('Deal saved to pipeline!');
    }
  });

  const dismissDealMutation = useMutation({
    mutationFn: (dealId) => base44.entities.SourcedDealOpportunity.update(dealId, { 
      status: 'dismissed'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['new-deals-feed'] });
    }
  });

  const analyzeDealMutation = useMutation({
    mutationFn: async (dealId) => {
      const result = await base44.functions.invoke('performDealDueDiligence', { dealId });
      return result.data;
    },
    onSuccess: (data, dealId) => {
      queryClient.invalidateQueries({ queryKey: ['new-deals-feed'] });
      setExpandedDealId(dealId);
      setAnalyzingDealId(null);
      toast.success('AI due diligence complete!');
    },
    onError: () => {
      setAnalyzingDealId(null);
      toast.error('Failed to analyze deal');
    }
  });

  const getRiskColor = (score) => {
    if (score <= 3) return 'text-green-400';
    if (score <= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskLabel = (score) => {
    if (score <= 3) return 'Low Risk';
    if (score <= 6) return 'Medium Risk';
    return 'High Risk';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#8b85f7]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8b85f7]" />
            New Deal Opportunities
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            AI-sourced investment prospects matching your preferences
          </p>
        </div>
        <Button
          onClick={() => {
            setIsGenerating(true);
            generateDealsMutation.mutate();
          }}
          disabled={isGenerating}
          className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] hover:from-[#9a95ff] hover:to-[#00d4ff]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sourcing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Source New Deals
            </>
          )}
        </Button>
      </div>

      {/* Empty State */}
      {newDeals.length === 0 ? (
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardContent className="p-12 text-center">
            <TrendingUp className="w-16 h-16 mx-auto text-[#8b85f7] mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No New Deals Yet
            </h3>
            <p className="text-gray-400 mb-6">
              Click "Source New Deals" to discover personalized investment opportunities
            </p>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 gap-4">
            {newDeals.map((deal, idx) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-[#1a0f2e] border-[#2d1e50] hover:border-[#8b85f7]/50 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-white">{deal.title}</CardTitle>
                          {deal.match_score && (
                            <Badge className="bg-[#8b85f7]/20 text-[#8b85f7] border-[#8b85f7]/50">
                              {deal.match_score}% Match
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {deal.industry}
                          </Badge>
                          {deal.deal_structure && (
                            <Badge variant="outline" className="text-xs">
                              {deal.deal_structure}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-300">{deal.summary}</p>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {deal.estimated_roi && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Est. ROI</p>
                          <p className="text-lg font-semibold text-green-400">
                            {deal.estimated_roi}%
                          </p>
                        </div>
                      )}
                      {deal.time_to_roi && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Time to ROI</p>
                          <p className="text-sm font-semibold text-white">
                            {deal.time_to_roi}
                          </p>
                        </div>
                      )}
                      {deal.required_investment && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Investment</p>
                          <p className="text-sm font-semibold text-white">
                            ${deal.required_investment.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {deal.risk_score && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Risk Level</p>
                          <p className={`text-sm font-semibold ${getRiskColor(deal.risk_score)}`}>
                            {getRiskLabel(deal.risk_score)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Key Opportunities */}
                    {deal.key_opportunities?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[#8b85f7] mb-2">Key Opportunities:</p>
                        <ul className="space-y-1">
                          {deal.key_opportunities.slice(0, 3).map((opp, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                              <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                              {opp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* How to Pursue */}
                    {deal.how_to_pursue && (
                      <div className="bg-[#8b85f7]/5 rounded-lg p-3 border border-[#8b85f7]/20">
                        <p className="text-xs font-semibold text-[#8b85f7] mb-1">How to Pursue:</p>
                        <p className="text-xs text-gray-300">{deal.how_to_pursue}</p>
                      </div>
                    )}

                    {/* AI Due Diligence Results */}
                    {deal.dd_viability_summary && expandedDealId === deal.id && (
                      <div className="space-y-3 mt-4 pt-4 border-t border-[#2d1e50]">
                        <div className="flex items-center gap-2 mb-2">
                          <Search className="w-4 h-4 text-[#00b7eb]" />
                          <p className="text-sm font-semibold text-[#00b7eb]">AI Due Diligence</p>
                        </div>

                        {/* Viability Summary */}
                        <div className="bg-[#00b7eb]/5 rounded-lg p-3 border border-[#00b7eb]/20">
                          <p className="text-xs font-semibold text-[#00b7eb] mb-1">Viability Assessment:</p>
                          <p className="text-xs text-gray-300">{deal.dd_viability_summary}</p>
                        </div>

                        {/* Actionable Steps */}
                        {deal.dd_actionable_steps?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-green-400 mb-2">Actionable Steps:</p>
                            <ul className="space-y-1">
                              {deal.dd_actionable_steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                                  <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Red Flags */}
                        {deal.dd_red_flags?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-red-400 mb-2">Potential Red Flags:</p>
                            <ul className="space-y-1">
                              {deal.dd_red_flags.map((flag, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                                  <AlertCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                                  {flag}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Risk Mitigation */}
                        {deal.dd_risk_mitigation && Object.keys(deal.dd_risk_mitigation).length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-yellow-400 mb-2">Risk Mitigation Strategies:</p>
                            <div className="space-y-2">
                              {Object.entries(deal.dd_risk_mitigation).map(([risk, mitigation], i) => (
                                <div key={i} className="bg-yellow-500/5 rounded p-2 border border-yellow-500/20">
                                  <p className="text-xs text-yellow-400 font-medium mb-1">{risk}</p>
                                  <p className="text-xs text-gray-300">{mitigation}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => {
                          setAnalyzingDealId(deal.id);
                          analyzeDealMutation.mutate(deal.id);
                        }}
                        disabled={analyzingDealId === deal.id || deal.dd_viability_summary}
                        variant="outline"
                        className="flex-1 border-[#00b7eb] text-[#00b7eb] hover:bg-[#00b7eb]/10"
                      >
                        {analyzingDealId === deal.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : deal.dd_viability_summary ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Analyzed
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4 mr-2" />
                            AI Due Diligence
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => saveDealMutation.mutate(deal.id)}
                        disabled={saveDealMutation.isPending}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        <BookmarkPlus className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      {deal.source_url && (
                        <Button
                          onClick={() => window.open(deal.source_url, '_blank')}
                          variant="outline"
                          size="icon"
                          className="border-[#2d1e50] text-gray-400 hover:text-white"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => dismissDealMutation.mutate(deal.id)}
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}