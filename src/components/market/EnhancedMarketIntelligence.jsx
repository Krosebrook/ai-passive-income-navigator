import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { TrendingUp, TrendingDown, AlertCircle, RefreshCw, Activity, BarChart3, Globe, DollarSign } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function EnhancedMarketIntelligence() {
  const [selectedSector, setSelectedSector] = useState(null);
  const queryClient = useQueryClient();

  const { data: latestSnapshot, isLoading } = useQuery({
    queryKey: ['market-snapshot'],
    queryFn: async () => {
      const snapshots = await base44.entities.MarketDataSnapshot.list('-snapshot_date', 1);
      return snapshots[0] || null;
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('analyzeMarketTrendsEnhanced', {});
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-snapshot'] });
      toast.success('Market analysis updated');
    }
  });

  const sectorAnalysisMutation = useMutation({
    mutationFn: async (sector) => {
      const result = await base44.functions.invoke('analyzeSectorPerformance', { sector });
      return result.data;
    },
    onSuccess: () => {
      toast.success('Sector analysis complete');
    }
  });

  const getSentimentColor = (score) => {
    if (score > 0.3) return 'text-green-400';
    if (score < -0.3) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getSentimentIcon = (score) => {
    if (score > 0.3) return TrendingUp;
    if (score < -0.3) return TrendingDown;
    return Activity;
  };

  const handleSectorAnalysis = async (sector) => {
    setSelectedSector(sector);
    await sectorAnalysisMutation.mutateAsync(sector);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="spinner mx-auto mb-4" />
        <p className="text-[#64748b]">Loading market intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#8b85f7]" />
            Enhanced Market Intelligence
          </h2>
          <p className="text-sm text-[#64748b] mt-1">
            Real-time market analysis powered by financial news and economic data
          </p>
        </div>
        <Button
          onClick={() => analyzeMutation.mutate()}
          disabled={analyzeMutation.isPending}
          className="gap-2 bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
        >
          <RefreshCw className={`w-4 h-4 ${analyzeMutation.isPending ? 'animate-spin' : ''}`} />
          Refresh Analysis
        </Button>
      </div>

      {!latestSnapshot ? (
        <Card className="border-[#2d1e50] bg-[#1a0f2e]">
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Market Data Yet</h3>
            <p className="text-[#64748b] mb-6">
              Click "Refresh Analysis" to fetch latest market intelligence
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Market Overview</TabsTrigger>
            <TabsTrigger value="sectors">Sector Analysis</TabsTrigger>
            <TabsTrigger value="macro">Macroeconomic</TabsTrigger>
            <TabsTrigger value="risks">Risk Indicators</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-[#2d1e50] bg-[#1a0f2e]">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#8b85f7]" />
                    Market Sentiment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getSentimentColor(latestSnapshot.sentiment_score)}`}>
                    {latestSnapshot.sentiment_score > 0 ? 'Bullish' : 
                     latestSnapshot.sentiment_score < 0 ? 'Bearish' : 'Neutral'}
                  </div>
                  <p className="text-xs text-[#64748b] mt-1">
                    Score: {latestSnapshot.sentiment_score?.toFixed(2) || 'N/A'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-[#2d1e50] bg-[#1a0f2e]">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#8b85f7]" />
                    Volatility Index
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latestSnapshot.volatility_index?.toFixed(1) || 'N/A'}
                  </div>
                  <p className="text-xs text-[#64748b] mt-1">
                    {latestSnapshot.volatility_index > 25 ? 'High volatility' : 'Normal levels'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-[#2d1e50] bg-[#1a0f2e]">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#8b85f7]" />
                    Last Updated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold">
                    {new Date(latestSnapshot.snapshot_date).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-[#64748b] mt-1">
                    {new Date(latestSnapshot.snapshot_date).toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            {latestSnapshot.market_indices && Object.keys(latestSnapshot.market_indices).length > 0 && (
              <Card className="border-[#2d1e50] bg-[#1a0f2e]">
                <CardHeader>
                  <CardTitle className="text-sm">Major Indices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    {Object.entries(latestSnapshot.market_indices).map(([key, value]) => (
                      <div key={key} className="bg-white/5 rounded-lg p-3">
                        <div className="text-xs text-[#64748b] mb-1">{key.toUpperCase()}</div>
                        <div className="text-lg font-bold">{value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sectors" className="space-y-4">
            {latestSnapshot.industry_data && Object.keys(latestSnapshot.industry_data).length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(latestSnapshot.industry_data).map(([sector, data]) => {
                  const SentimentIcon = getSentimentIcon(data.change_percent || 0);
                  return (
                    <motion.div key={sector} whileHover={{ scale: 1.02 }}>
                      <Card className="border-[#2d1e50] bg-[#1a0f2e] cursor-pointer"
                        onClick={() => handleSectorAnalysis(sector)}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base capitalize">{sector}</CardTitle>
                            <Badge variant="outline">
                              {data.sentiment || 'neutral'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[#64748b]">Performance</span>
                            <div className="flex items-center gap-2">
                              <SentimentIcon className={`w-4 h-4 ${getSentimentColor(data.change_percent)}`} />
                              <span className={`font-bold ${getSentimentColor(data.change_percent)}`}>
                                {data.change_percent?.toFixed(2)}%
                              </span>
                            </div>
                          </div>

                          {data.key_trends && data.key_trends.length > 0 && (
                            <div className="space-y-1">
                              <div className="text-xs text-[#8b85f7] font-semibold">Key Trends:</div>
                              {data.key_trends.slice(0, 2).map((trend, i) => (
                                <div key={i} className="text-xs text-[#a0aec0] flex items-start gap-1">
                                  <span className="text-[#8b85f7]">•</span>
                                  {trend}
                                </div>
                              ))}
                            </div>
                          )}

                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            disabled={sectorAnalysisMutation.isPending && selectedSector === sector}
                          >
                            {sectorAnalysisMutation.isPending && selectedSector === sector ? 
                              'Analyzing...' : 'Deep Dive Analysis'}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card className="border-[#2d1e50] bg-[#1a0f2e]">
                <CardContent className="py-12 text-center">
                  <p className="text-[#64748b]">No sector data available. Refresh analysis to load.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="macro" className="space-y-4">
            <Card className="border-[#2d1e50] bg-[#1a0f2e]">
              <CardHeader>
                <CardTitle className="text-sm">Commodities & Currencies</CardTitle>
              </CardHeader>
              <CardContent>
                {latestSnapshot.commodities && Object.keys(latestSnapshot.commodities).length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(latestSnapshot.commodities).map(([key, value]) => (
                      <div key={key} className="bg-white/5 rounded-lg p-4">
                        <div className="text-xs text-[#64748b] mb-2 capitalize">{key}</div>
                        <div className="text-xl font-bold">${value}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#64748b]">Commodity data not available</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-[#2d1e50] bg-[#1a0f2e]">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  Economic Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#a0aec0]">
                  Consider current interest rates, inflation trends, GDP growth, and employment data 
                  when evaluating investment opportunities. Market conditions are factored into 
                  deal scoring and portfolio forecasts automatically.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            <Card className="border-[#2d1e50] bg-[#1a0f2e]">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  Risk Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm">Market Volatility</span>
                  <Badge className={
                    latestSnapshot.volatility_index > 25 ? 'bg-red-500/20 text-red-400' :
                    latestSnapshot.volatility_index > 15 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }>
                    {latestSnapshot.volatility_index > 25 ? 'High' :
                     latestSnapshot.volatility_index > 15 ? 'Moderate' : 'Low'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm">Market Sentiment</span>
                  <Badge className={
                    latestSnapshot.sentiment_score > 0.3 ? 'bg-green-500/20 text-green-400' :
                    latestSnapshot.sentiment_score < -0.3 ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }>
                    {latestSnapshot.sentiment_score > 0.3 ? 'Positive' :
                     latestSnapshot.sentiment_score < -0.3 ? 'Negative' : 'Neutral'}
                  </Badge>
                </div>

                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-200">
                    <strong>Note:</strong> Risk indicators are automatically factored into deal scoring, 
                    origination strategies, and portfolio forecasts to optimize investment decisions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}