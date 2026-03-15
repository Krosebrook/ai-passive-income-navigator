import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, RefreshCw, Star, TrendingUp, Shield, Target, Loader2, Zap, AlertCircle } from 'lucide-react';

const FIT_CONFIG = {
  excellent: { color: 'bg-green-500/20 text-green-400 border-green-500/40', bar: 'bg-green-500' },
  good: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/40', bar: 'bg-blue-500' },
  fair: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40', bar: 'bg-yellow-500' },
  poor: { color: 'bg-red-500/20 text-red-400 border-red-500/40', bar: 'bg-red-400' }
};

const IMPACT_CONFIG = {
  positive: { label: 'Diversifies Portfolio', color: 'text-green-400' },
  neutral: { label: 'Neutral Impact', color: 'text-[#64748b]' },
  negative: { label: 'Increases Concentration', color: 'text-red-400' }
};

function DealMatchCard({ deal }) {
  const fit = FIT_CONFIG[deal.matchmaker_fit_rating] || FIT_CONFIG.fair;
  const impact = IMPACT_CONFIG[deal.matchmaker_diversification_impact] || IMPACT_CONFIG.neutral;
  const score = deal.matchmaker_score || deal.match_score || 0;

  return (
    <Card className="bg-[#0f0618] border border-[#2d1e50] hover:border-[#8b85f7]/40 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-white font-semibold text-sm">{deal.title}</p>
              {deal.matchmaker_high_potential && (
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-[#64748b]">{deal.industry}</p>
          </div>
          <Badge className={`border text-xs flex-shrink-0 ${fit.color}`}>
            {deal.matchmaker_fit_rating || 'unscored'}
          </Badge>
        </div>

        {/* Score Bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1.5 bg-[#2d1e50] rounded-full overflow-hidden">
            <div className={`h-1.5 rounded-full ${fit.bar}`} style={{ width: `${score}%` }} />
          </div>
          <span className="text-xs font-bold text-white w-8 text-right">{score}</span>
        </div>

        {/* Match Reasons */}
        {deal.matchmaker_reasons?.length > 0 && (
          <div className="mb-2">
            <ul className="space-y-0.5">
              {deal.matchmaker_reasons.slice(0, 3).map((r, i) => (
                <li key={i} className="text-xs text-[#94a3b8] flex items-start gap-1">
                  <span className="text-[#8b85f7] mt-0.5">•</span> {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs ${impact.color}`}>{impact.label}</span>
          {deal.estimated_roi && (
            <span className="text-xs text-[#8b85f7]">~{deal.estimated_roi}% ROI</span>
          )}
        </div>

        {deal.matchmaker_recommendation && (
          <p className="text-xs text-[#64748b] mt-2 italic border-t border-[#2d1e50] pt-2">
            {deal.matchmaker_recommendation}
          </p>
        )}

        {deal.matchmaker_concerns?.length > 0 && (
          <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-400 flex items-center gap-1 mb-1">
              <AlertCircle className="w-3 h-3" /> Concerns
            </p>
            {deal.matchmaker_concerns.slice(0, 2).map((c, i) => (
              <p key={i} className="text-xs text-red-300">• {c}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MatchmakerPanel() {
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const { data: pendingDeals = [], isLoading } = useQuery({
    queryKey: ['matchmaker-deals'],
    queryFn: () => base44.entities.SourcedDealOpportunity.filter({ status: 'pending' })
  });

  const { data: scoredDeals = [] } = useQuery({
    queryKey: ['scored-deals'],
    queryFn: () => base44.entities.SourcedDealOpportunity.list('-matchmaker_score', 20)
  });

  const runMutation = useMutation({
    mutationFn: () => base44.functions.invoke('runMatchmakerEngine', {}),
    onMutate: () => setIsRunning(true),
    onSuccess: (res) => {
      setLastResult(res.data);
      toast.success(`Matchmaker complete: ${res.data?.high_potential_count || 0} high-potential deals found`);
      queryClient.invalidateQueries({ queryKey: ['matchmaker-deals'] });
      queryClient.invalidateQueries({ queryKey: ['scored-deals'] });
      setIsRunning(false);
    },
    onError: (err) => {
      toast.error('Matchmaker failed: ' + (err.message || 'Unknown error'));
      setIsRunning(false);
    }
  });

  const highPotentialDeals = scoredDeals.filter(d => d.matchmaker_high_potential);
  const topScoredDeals = [...scoredDeals]
    .filter(d => d.matchmaker_score != null)
    .sort((a, b) => (b.matchmaker_score || 0) - (a.matchmaker_score || 0))
    .slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-[#8b85f7]" />
            Matchmaker Engine
          </h3>
          <p className="text-xs text-[#64748b] mt-0.5">
            {pendingDeals.length} pending deals • {highPotentialDeals.length} flagged high-potential
          </p>
        </div>
        <Button
          onClick={() => runMutation.mutate()}
          disabled={isRunning || pendingDeals.length === 0}
          className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0] gap-2"
          size="sm"
        >
          {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {isRunning ? 'Analyzing...' : 'Run Matchmaker'}
        </Button>
      </div>

      {/* Last Run Summary */}
      {lastResult && (
        <Card className="bg-[#0f0618] border border-[#8b85f7]/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#8b85f7]" />
                <span className="text-[#64748b]">Last run:</span>
              </div>
              <span className="text-white">{lastResult.total_evaluated} evaluated</span>
              <span className="text-yellow-400 flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400" />
                {lastResult.high_potential_count} high-potential
              </span>
            </div>
            {lastResult.market_summary && (
              <p className="text-xs text-[#64748b] mt-2 italic">{lastResult.market_summary}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* High Potential Section */}
      {highPotentialDeals.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <h4 className="text-white font-semibold text-sm">High-Potential Flagged Deals</h4>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40 text-xs">{highPotentialDeals.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {highPotentialDeals.map(deal => (
              <DealMatchCard key={deal.id} deal={deal} />
            ))}
          </div>
        </div>
      )}

      {/* All Scored Deals */}
      {topScoredDeals.length > 0 && (
        <div>
          <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#8b85f7]" />
            Top Matches by Score
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topScoredDeals.map(deal => (
              <DealMatchCard key={deal.id} deal={deal} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {topScoredDeals.length === 0 && !isLoading && (
        <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 text-[#2d1e50] mx-auto mb-3" />
            <p className="text-[#64748b] text-sm mb-2">No deals have been scored yet.</p>
            <p className="text-xs text-[#2d1e50]">Run the Matchmaker to analyze pending deals against your investment criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}