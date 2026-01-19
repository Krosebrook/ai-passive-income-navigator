import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw, Loader2, AlertCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function MarketDataFeed({ industries = [] }) {
  const queryClient = useQueryClient();

  const { data: latestSnapshot, isLoading } = useQuery({
    queryKey: ['market-data-latest'],
    queryFn: async () => {
      const snapshots = await base44.entities.MarketDataSnapshot.list('-snapshot_date', 1);
      return snapshots[0];
    },
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  const { data: historicalData = [] } = useQuery({
    queryKey: ['market-data-historical'],
    queryFn: async () => {
      const snapshots = await base44.entities.MarketDataSnapshot.list('-snapshot_date', 24);
      return snapshots.reverse();
    }
  });

  const fetchMarketMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('fetchMarketData', { industries });
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['market-data-latest'] });
      queryClient.invalidateQueries({ queryKey: ['market-data-historical'] });
      toast.success(`Market data updated${data.data.triggeredAlerts > 0 ? ` (${data.data.triggeredAlerts} alerts triggered)` : ''}`);
    },
    onError: () => {
      toast.error('Failed to fetch market data');
    }
  });

  const getSentimentColor = (score) => {
    if (score > 0.3) return 'text-emerald-400';
    if (score < -0.3) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getSentimentIcon = (score) => {
    if (score > 0.3) return <TrendingUp className="w-4 h-4" />;
    if (score < -0.3) return <TrendingDown className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  if (isLoading && !latestSnapshot) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#8b85f7]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Market Intelligence</h2>
          {latestSnapshot && (
            <p className="text-sm text-gray-400 mt-1">
              Last updated: {new Date(latestSnapshot.snapshot_date).toLocaleString()}
            </p>
          )}
        </div>
        <Button
          onClick={() => fetchMarketMutation.mutate()}
          disabled={fetchMarketMutation.isPending}
          className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb]"
        >
          {fetchMarketMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh Data
        </Button>
      </div>

      {latestSnapshot && (
        <>
          {/* Market Indices */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {latestSnapshot.market_indices && Object.entries(latestSnapshot.market_indices).map(([key, value]) => (
              <Card key={key} className="bg-[#1a0f2e] border-[#2d1e50]">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-400 uppercase mb-1">{key}</p>
                  <p className="text-2xl font-bold text-white">
                    {value?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Overall Sentiment */}
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Market Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${getSentimentColor(latestSnapshot.sentiment_score)}`}>
                  {latestSnapshot.sentiment_score > 0 ? '+' : ''}
                  {(latestSnapshot.sentiment_score * 100).toFixed(0)}
                </div>
                <div className={getSentimentColor(latestSnapshot.sentiment_score)}>
                  {getSentimentIcon(latestSnapshot.sentiment_score)}
                </div>
                <div className="flex-1">
                  <Badge className={
                    latestSnapshot.sentiment_score > 0.3 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : latestSnapshot.sentiment_score < -0.3 
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }>
                    {latestSnapshot.sentiment_score > 0.3 ? 'Bullish' : latestSnapshot.sentiment_score < -0.3 ? 'Bearish' : 'Neutral'}
                  </Badge>
                  <p className="text-sm text-gray-400 mt-2">
                    Volatility Index (VIX): {latestSnapshot.volatility_index?.toFixed(2) || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commodities */}
          {latestSnapshot.commodities && (
            <Card className="bg-[#1a0f2e] border-[#2d1e50]">
              <CardHeader>
                <CardTitle>Commodities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(latestSnapshot.commodities).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs text-gray-400 uppercase mb-1">{key}</p>
                      <p className="text-xl font-bold text-[#00b7eb]">
                        ${value?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Industry Trends */}
          {latestSnapshot.industry_data && Object.keys(latestSnapshot.industry_data).length > 0 && (
            <Card className="bg-[#1a0f2e] border-[#2d1e50]">
              <CardHeader>
                <CardTitle>Industry Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(latestSnapshot.industry_data).map(([industry, data]) => (
                    <div key={industry} className="p-4 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{industry}</h4>
                        <Badge className={
                          data.sentiment === 'bullish' || data.sentiment === 'positive'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : data.sentiment === 'bearish' || data.sentiment === 'negative'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }>
                          {data.change_percent > 0 ? '+' : ''}{data.change_percent?.toFixed(2)}%
                        </Badge>
                      </div>
                      {data.key_trends && data.key_trends.length > 0 && (
                        <ul className="space-y-1 mt-2">
                          {data.key_trends.slice(0, 3).map((trend, idx) => (
                            <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                              <span className="text-[#8b85f7]">•</span>
                              {trend}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historical Sentiment Chart */}
          {historicalData.length > 1 && (
            <Card className="bg-[#1a0f2e] border-[#2d1e50]">
              <CardHeader>
                <CardTitle>Market Sentiment Trend (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={historicalData}>
                    <defs>
                      <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
                    <XAxis 
                      dataKey="snapshot_date" 
                      stroke="#64748b"
                      tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit' })}
                    />
                    <YAxis stroke="#64748b" domain={[-1, 1]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #2d1e50' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sentiment_score" 
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#sentimentGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!latestSnapshot && !isLoading && (
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardContent className="p-12 text-center">
            <p className="text-gray-400 mb-4">No market data available</p>
            <Button
              onClick={() => fetchMarketMutation.mutate()}
              disabled={fetchMarketMutation.isPending}
              className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb]"
            >
              Fetch Market Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}