import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { Search, Target, TrendingUp, AlertTriangle, ExternalLink, Flag, Zap } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AutoDiscoveredDeals() {
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['auto-discovered-deals'],
    queryFn: async () => {
      const data = await base44.entities.SourcedDealOpportunity.filter({ 
        source: 'api_sourced'
      });
      return data.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    }
  });

  const searchMutation = useMutation({
    mutationFn: async () => {
      await base44.functions.invoke('searchDealPlatforms', {});
      await base44.functions.invoke('scoreDealOpportunities', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-discovered-deals'] });
      toast.success('Deal search and scoring completed');
    }
  });

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      await searchMutation.mutateAsync();
    } finally {
      setIsSearching(false);
    }
  };

  const getPriorityColor = (score) => {
    if (score >= 80) return 'bg-red-500/20 text-red-400 border-red-500/50';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
  };

  const getRiskColor = (score) => {
    if (score <= 3) return 'text-green-400';
    if (score <= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Search className="w-6 h-6 text-[#8b85f7]" />
            Auto-Discovered Deals
          </h2>
          <p className="text-sm text-[#64748b] mt-1">
            Automatically sourced from PitchBook, Crunchbase, and industry news
          </p>
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className="gap-2 bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
        >
          <Zap className="w-4 h-4" />
          {isSearching ? 'Searching...' : 'Discover Deals'}
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="spinner mx-auto mb-4" />
          <p className="text-[#64748b]">Loading discovered deals...</p>
        </div>
      )}

      {!isLoading && deals.length === 0 && (
        <Card className="border-[#2d1e50] bg-[#1a0f2e]">
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Deals Yet</h3>
            <p className="text-[#64748b] mb-6">
              Click "Discover Deals" to search external platforms
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && deals.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {deals.map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-[#2d1e50] bg-[#1a0f2e] hover:border-[#8b85f7]/50 transition-all cursor-pointer"
                onClick={() => setSelectedDeal(deal)}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getPriorityColor(deal.match_score)}>
                          {deal.match_score >= 80 ? 'High Priority' : 
                           deal.match_score >= 60 ? 'Medium Priority' : 'Low Priority'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Match: {deal.match_score || 0}%
                        </Badge>
                      </div>
                      <CardTitle className="text-base">{deal.title}</CardTitle>
                      <p className="text-xs text-[#64748b] mt-1">{deal.industry}</p>
                    </div>
                    <Flag className="w-5 h-5 text-[#8b85f7] flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-[#a0aec0] line-clamp-2">{deal.summary}</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-[#64748b] mb-1">Investment</div>
                      <div className="text-sm font-bold">
                        ${(deal.required_investment || 0).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-[#64748b] mb-1">Risk Score</div>
                      <div className={`text-sm font-bold ${getRiskColor(deal.risk_score)}`}>
                        {deal.risk_score || 5}/10
                      </div>
                    </div>
                  </div>

                  {deal.predicted_roi && (
                    <div className="flex items-center justify-between p-2 bg-green-500/10 rounded-lg">
                      <span className="text-xs text-[#64748b]">Predicted ROI</span>
                      <span className="text-sm font-bold text-green-400">
                        {deal.predicted_roi}%
                      </span>
                    </div>
                  )}

                  {deal.source_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(deal.source_url, '_blank');
                      }}
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Source
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedDeal && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-[#8b85f7]" />
                  {selectedDeal.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(selectedDeal.match_score)}>
                    Match: {selectedDeal.match_score}%
                  </Badge>
                  <Badge variant="outline">{selectedDeal.industry}</Badge>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#8b85f7] mb-2">Summary</h3>
                  <p className="text-sm text-[#a0aec0]">{selectedDeal.summary}</p>
                </div>

                {selectedDeal.key_opportunities && selectedDeal.key_opportunities.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#8b85f7] mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Key Opportunities
                    </h3>
                    <ul className="space-y-1">
                      {selectedDeal.key_opportunities.map((opp, i) => (
                        <li key={i} className="text-sm text-[#a0aec0] flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">•</span>
                          {opp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedDeal.key_risks && selectedDeal.key_risks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#8b85f7] mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Key Risks
                    </h3>
                    <ul className="space-y-1">
                      {selectedDeal.key_risks.map((risk, i) => (
                        <li key={i} className="text-sm text-[#a0aec0] flex items-start gap-2">
                          <span className="text-red-400 mt-0.5">•</span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedDeal.source_url && (
                  <Button
                    className="w-full gap-2"
                    onClick={() => window.open(selectedDeal.source_url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Full Details on Source Platform
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}