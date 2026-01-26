import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { Sparkles, Target, TrendingUp, Users, DollarSign, Calendar, AlertTriangle, CheckCircle2, Lightbulb, Brain } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FounderSearchPanel from '../founders/FounderSearchPanel';

export default function AIOriginatedDeals() {
  const [isOriginating, setIsOriginating] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const queryClient = useQueryClient();

  // Fetch AI-originated deals
  const { data: originatedDeals = [], isLoading } = useQuery({
    queryKey: ['originated-deals'],
    queryFn: async () => {
      const deals = await base44.entities.SourcedDealOpportunity.filter({ 
        source: 'ai_generated',
        is_generated: true 
      });
      return deals.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
  });

  // Originate new deals
  const originateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('originateNewDeals', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['originated-deals'] });
    }
  });

  const handleOriginate = async () => {
    setIsOriginating(true);
    try {
      await originateMutation.mutateAsync();
    } finally {
      setIsOriginating(false);
    }
  };

  const parseDealData = (deal) => {
    try {
      const parsed = JSON.parse(deal.description);
      return {
        marketGap: parsed.market_gap || {},
        dealStructure: parsed.deal_structure || {},
        founderProfile: parsed.founder_profile || {}
      };
    } catch {
      return { marketGap: {}, dealStructure: {}, founderProfile: {} };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#8b85f7]" />
            AI-Originated Deals
          </h2>
          <p className="text-sm text-[#64748b] mt-1">
            Opportunities created by AI, not sourced from platforms
          </p>
        </div>
        <Button
          onClick={handleOriginate}
          disabled={isOriginating}
          className="gap-2 bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
        >
          <Sparkles className="w-4 h-4" />
          {isOriginating ? 'Originating...' : 'Originate New Deals'}
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="border-[#8b85f7]/30 bg-gradient-to-r from-[#8b85f7]/10 to-[#583cf0]/10">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-[#8b85f7] flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-white mb-1">What are AI-Originated Deals?</p>
              <p className="text-[#a0aec0]">
                These aren't deals from AngelList or Crunchbase. AI analyzes market gaps, predicts high-potential business models, 
                and generates complete investment opportunities that don't exist yet. Your job: find the founder and execute.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="spinner mx-auto mb-4" />
          <p className="text-[#64748b]">Loading originated deals...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && originatedDeals.length === 0 && (
        <Card className="border-[#2d1e50] bg-[#1a0f2e]">
          <CardContent className="py-12 text-center">
            <Brain className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Originated Deals Yet</h3>
            <p className="text-[#64748b] mb-6">
              Let AI analyze market gaps and create investment opportunities from scratch
            </p>
            <Button onClick={handleOriginate} disabled={isOriginating}>
              Originate First Deal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Deals Grid */}
      {!isLoading && originatedDeals.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {originatedDeals.map((deal, index) => {
            const { marketGap, dealStructure } = parseDealData(deal);
            
            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-[#2d1e50] bg-[#1a0f2e] hover:border-[#8b85f7]/50 transition-all cursor-pointer group h-full"
                  onClick={() => setSelectedDeal(deal)}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-[#8b85f7]/20 text-[#8b85f7] border-[#8b85f7]/50">
                            AI-Originated
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Match: {deal.match_score}%
                          </Badge>
                        </div>
                        <CardTitle className="text-base group-hover:text-[#8b85f7] transition-colors">
                          {deal.title}
                        </CardTitle>
                        <p className="text-xs text-[#64748b] mt-1 line-clamp-2">
                          {deal.summary}
                        </p>
                      </div>
                      <Brain className="w-5 h-5 text-[#8b85f7] flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-xs text-[#64748b] mb-1">
                          <DollarSign className="w-3 h-3" />
                          Investment
                        </div>
                        <div className="text-sm font-bold">
                          ${(deal.required_investment || 0).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-xs text-[#64748b] mb-1">
                          <TrendingUp className="w-3 h-3" />
                          Target ROI
                        </div>
                        <div className="text-sm font-bold text-green-400">
                          {deal.estimated_roi || 150}%
                        </div>
                      </div>
                    </div>

                    {/* Market Gap */}
                    {marketGap.market_gap_description && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-[#64748b]">
                          <Target className="w-3 h-3" />
                          Market Gap
                        </div>
                        <p className="text-xs text-[#a0aec0] line-clamp-2">
                          {marketGap.market_gap_description}
                        </p>
                      </div>
                    )}

                    {/* Founder Search Indicator */}
                    <div className="flex items-center gap-2 p-3 bg-[#8b85f7]/10 border border-[#8b85f7]/30 rounded-lg">
                      <Users className="w-4 h-4 text-[#8b85f7] flex-shrink-0" />
                      <p className="text-xs text-[#a0aec0]">
                        Next: Find ideal founder
                      </p>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full group-hover:bg-[#8b85f7]/10 group-hover:border-[#8b85f7]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDeal(deal);
                      }}
                    >
                      View Full Deal Structure
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Deal Detail Modal */}
      <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedDeal && (() => {
            const { marketGap, dealStructure, founderProfile } = parseDealData(selectedDeal);
            
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#8b85f7]" />
                    {selectedDeal.title}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Executive Summary */}
                  <div>
                    <h3 className="text-sm font-semibold text-[#8b85f7] mb-2">Executive Summary</h3>
                    <p className="text-sm text-[#a0aec0]">{selectedDeal.summary}</p>
                  </div>

                  {/* Market Gap Analysis */}
                  {marketGap.market_gap_description && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-[#8b85f7] flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Market Gap Analysis
                      </h3>
                      <div className="bg-white/5 rounded-lg p-4 space-y-2">
                        <p className="text-sm text-[#a0aec0]">{marketGap.market_gap_description}</p>
                        {marketGap.why_gap_exists && (
                          <p className="text-xs text-[#64748b] italic">Why it exists: {marketGap.why_gap_exists}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Deal Structure */}
                  {dealStructure.investment_structure && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-[#8b85f7] flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Investment Structure
                      </h3>
                      <div className="bg-white/5 rounded-lg p-4 text-sm text-[#a0aec0] whitespace-pre-wrap">
                        {typeof dealStructure.investment_structure === 'string' 
                          ? dealStructure.investment_structure 
                          : JSON.stringify(dealStructure.investment_structure, null, 2)}
                      </div>
                    </div>
                  )}

                  {/* Founder Profile */}
                  {founderProfile.ideal_founder_background && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-[#8b85f7] flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Ideal Founder Profile
                      </h3>
                      <div className="bg-white/5 rounded-lg p-4 text-sm text-[#a0aec0]">
                        {founderProfile.ideal_founder_background}
                      </div>
                    </div>
                  )}

                  {/* Founder Search */}
                  <div className="space-y-3">
                    <FounderSearchPanel deal={selectedDeal} />
                  </div>

                  {/* Next Steps */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-[#8b85f7] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      How to Pursue
                    </h3>
                    <div className="bg-white/5 rounded-lg p-4">
                      <pre className="text-xs text-[#a0aec0] whitespace-pre-wrap font-sans">
                        {selectedDeal.how_to_pursue}
                      </pre>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
                      onClick={() => {
                        // Move to pipeline
                        setSelectedDeal(null);
                      }}
                    >
                      Move to Pipeline
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedDeal(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}