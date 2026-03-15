import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Globe, TrendingUp, TrendingDown, Minus, RefreshCw, Loader2,
  Zap, AlertTriangle, CheckCircle2, BarChart3, Sparkles
} from 'lucide-react';

const SENTIMENT_CONFIG = {
  very_bullish: { label: '🚀 Very Bullish', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: TrendingUp },
  bullish: { label: '📈 Bullish', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: TrendingUp },
  neutral: { label: '➡️ Neutral', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: Minus },
  bearish: { label: '📉 Bearish', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', icon: TrendingDown },
  very_bearish: { label: '🔻 Very Bearish', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: TrendingDown }
};

export default function LiveMarketPulse() {
  const queryClient = useQueryClient();

  const { data: snapshot, isLoading } = useQuery({
    queryKey: ['market-pulse-latest'],
    queryFn: () => base44.entities.MarketDataSnapshot.list('-snapshot_date', 1).then(r => r[0] || null),
    staleTime: 5 * 60 * 1000
  });

  const refreshMutation = useMutation({
    mutationFn: () => base44.functions.invoke('liveMarketPulse', { force_refresh: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-pulse-latest'] });
      toast.success('Market pulse updated!');
    },
    onError: () => toast.error('Refresh failed')
  });

  const pulse = snapshot?.raw_pulse || {};
  const sentimentConf = SENTIMENT_CONFIG[pulse.overall_sentiment] || SENTIMENT_CONFIG.neutral;
  const SentimentIcon = sentimentConf.icon;
  const sectors = pulse.sector_data || {};
  const sectorKeys = Object.keys(sectors).slice(0, 6);

  const ageMinutes = snapshot?.snapshot_date
    ? Math.floor((Date.now() - new Date(snapshot.snapshot_date).getTime()) / 60000)
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#8b85f7]" />
          <h3 className="text-white font-semibold">Live Market Pulse</h3>
          {ageMinutes !== null && (
            <Badge className="bg-[#2d1e50] text-[#64748b] border-0 text-xs">
              {ageMinutes < 60 ? `${ageMinutes}m ago` : `${Math.floor(ageMinutes / 60)}h ago`}
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          className="text-[#64748b] hover:text-[#8b85f7] text-xs"
        >
          {refreshMutation.isPending
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <RefreshCw className="w-3 h-3 mr-1" />
          }
          {refreshMutation.isPending ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {isLoading && (
        <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-[#8b85f7] animate-spin mx-auto mb-2" />
            <p className="text-[#64748b] text-sm">Loading market data...</p>
          </CardContent>
        </Card>
      )}

      {!snapshot && !isLoading && (
        <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
          <CardContent className="p-8 text-center">
            <Globe className="w-12 h-12 text-[#2d1e50] mx-auto mb-3" />
            <p className="text-[#64748b] text-sm mb-3">No market data yet. Fetch a live pulse.</p>
            <Button
              size="sm"
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
            >
              {refreshMutation.isPending
                ? <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Fetching...</>
                : <><Sparkles className="w-3 h-3 mr-2" /> Fetch Live Pulse</>
              }
            </Button>
          </CardContent>
        </Card>
      )}

      {snapshot && (
        <>
          {/* Overall Sentiment */}
          <Card className={`border ${sentimentConf.bg}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <SentimentIcon className={`w-5 h-5 ${sentimentConf.color}`} />
                  <span className={`font-bold ${sentimentConf.color}`}>{sentimentConf.label}</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{pulse.sentiment_score || snapshot.sentiment_score ? Math.round((pulse.sentiment_score || snapshot.sentiment_score) * (pulse.sentiment_score > 1 ? 1 : 100)) : '—'}</p>
                  <p className="text-xs text-[#64748b]">Sentiment</p>
                </div>
              </div>
              {pulse.macro_context && (
                <p className="text-xs text-[#94a3b8]">{pulse.macro_context}</p>
              )}
            </CardContent>
          </Card>

          {/* Fear/Greed + Emerging */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
              <CardContent className="p-3">
                <p className="text-xs text-[#64748b] mb-1">Fear/Greed Index</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#2d1e50] rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        (pulse.fear_greed_index || 50) >= 70 ? 'bg-green-500' :
                        (pulse.fear_greed_index || 50) >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${pulse.fear_greed_index || 50}%` }}
                    />
                  </div>
                  <span className="text-white font-bold text-sm">{pulse.fear_greed_index || 50}</span>
                </div>
                <p className="text-xs text-[#64748b] mt-1">
                  {(pulse.fear_greed_index || 50) >= 70 ? 'Greed' : (pulse.fear_greed_index || 50) >= 40 ? 'Neutral' : 'Fear'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
              <CardContent className="p-3">
                <p className="text-xs text-[#64748b] mb-1">Hot Structures</p>
                <div className="space-y-0.5">
                  {(pulse.hot_deal_structures || []).slice(0, 3).map((s, i) => (
                    <p key={i} className="text-xs text-[#8b85f7]">• {s}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sector Momentum */}
          {sectorKeys.length > 0 && (
            <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#8b85f7]" /> Sector Momentum
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {sectorKeys.map((sector) => {
                    const data = sectors[sector];
                    const isBull = data?.momentum?.toLowerCase().includes('bull');
                    const isBear = data?.momentum?.toLowerCase().includes('bear');
                    return (
                      <div key={sector} className="flex items-start gap-2 p-2 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${isBull ? 'bg-green-500' : isBear ? 'bg-red-500' : 'bg-yellow-500'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-white truncate">{sector}</p>
                            <Badge className={`text-xs border-0 flex-shrink-0 ml-1 ${
                              isBull ? 'bg-green-500/20 text-green-400' : isBear ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {data?.momentum || 'neutral'}
                            </Badge>
                          </div>
                          {data?.entry_signal && (
                            <p className="text-xs text-[#64748b] mt-0.5 truncate">{data.entry_signal}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emerging + Avoid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pulse.emerging_opportunities?.length > 0 && (
              <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
                <CardContent className="p-3">
                  <p className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Emerging Now
                  </p>
                  {pulse.emerging_opportunities.slice(0, 3).map((op, i) => (
                    <p key={i} className="text-xs text-[#94a3b8]">• {op}</p>
                  ))}
                </CardContent>
              </Card>
            )}
            {pulse.avoid_sectors?.length > 0 && (
              <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
                <CardContent className="p-3">
                  <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Avoid Now
                  </p>
                  {pulse.avoid_sectors.slice(0, 3).map((s, i) => (
                    <p key={i} className="text-xs text-[#94a3b8]">• {s}</p>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Regions Trending */}
          {pulse.regions_trending?.length > 0 && (
            <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
              <CardContent className="p-3">
                <p className="text-xs font-semibold text-[#8b85f7] mb-2 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Hot Regions
                </p>
                <div className="flex flex-wrap gap-2">
                  {pulse.regions_trending.map((r, i) => (
                    <Badge key={i} className="bg-[#0f0618] text-[#94a3b8] border border-[#2d1e50] text-xs">
                      {r}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}