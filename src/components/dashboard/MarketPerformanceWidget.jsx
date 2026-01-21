import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function MarketPerformanceWidget() {
  const { data: snapshots = [] } = useQuery({
    queryKey: ['market-snapshots'],
    queryFn: () => base44.entities.MarketDataSnapshot.list('-created_date', 30)
  });

  const { data: portfolioIdeas = [] } = useQuery({
    queryKey: ['portfolio-ideas'],
    queryFn: () => base44.entities.PortfolioIdea.list()
  });

  // Calculate portfolio vs market performance
  const latestSnapshot = snapshots[0] || {};
  const sentiment = latestSnapshot.sentiment_score || 0;
  const volatility = latestSnapshot.volatility_index || 0;

  // Historical sentiment for chart
  const chartData = snapshots.slice(0, 14).reverse().map(snap => ({
    date: new Date(snap.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sentiment: (snap.sentiment_score || 0) * 100,
    volatility: snap.volatility_index || 0
  }));

  // Portfolio health score (simple calculation)
  const activeIdeas = portfolioIdeas.filter(idea => ['in_progress', 'launched'].includes(idea.status)).length;
  const totalIdeas = portfolioIdeas.length;
  const portfolioHealth = totalIdeas > 0 ? (activeIdeas / totalIdeas) * 100 : 0;

  const getSentimentStatus = (score) => {
    if (score > 0.3) return { label: 'Bullish', color: 'text-[#10b981]', icon: TrendingUp };
    if (score < -0.3) return { label: 'Bearish', color: 'text-[#ef4444]', icon: TrendingDown };
    return { label: 'Neutral', color: 'text-[#64748b]', icon: Activity };
  };

  const sentimentStatus = getSentimentStatus(sentiment);
  const SentimentIcon = sentimentStatus.icon;

  return (
    <div className="space-y-6">
      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#64748b]">Market Sentiment</p>
              <SentimentIcon className={`w-5 h-5 ${sentimentStatus.color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{sentimentStatus.label}</p>
            <p className="text-xs text-[#64748b] mt-1">
              Score: {(sentiment * 100).toFixed(1)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#64748b]">Volatility Index</p>
              <Activity className="w-5 h-5 text-[#ff8e42]" />
            </div>
            <p className="text-2xl font-bold text-white">{volatility.toFixed(1)}</p>
            <Badge className={`mt-2 ${volatility > 30 ? 'bg-[#ef4444]/20 text-[#ef4444]' : 'bg-[#10b981]/20 text-[#10b981]'}`}>
              {volatility > 30 ? 'High Risk' : 'Stable'}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#64748b]">Portfolio Health</p>
              <AlertCircle className="w-5 h-5 text-[#8b85f7]" />
            </div>
            <p className="text-2xl font-bold text-white">{portfolioHealth.toFixed(0)}%</p>
            <p className="text-xs text-[#64748b] mt-1">
              {activeIdeas} of {totalIdeas} active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Market Trend Chart */}
      <Card className="bg-[#1a0f2e] border-[#2d1e50]">
        <CardHeader>
          <CardTitle className="text-white">Market Sentiment Trend (14 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b85f7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b85f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #2d1e50' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sentiment" 
                  stroke="#8b85f7" 
                  fillOpacity={1} 
                  fill="url(#sentimentGradient)"
                  name="Sentiment Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-[#64748b]">
              No market data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance vs Market Indicators */}
      <Card className="bg-[#1a0f2e] border-[#2d1e50]">
        <CardHeader>
          <CardTitle className="text-white">Market Indices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {latestSnapshot.market_indices && Object.entries(latestSnapshot.market_indices).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-[#0f0618] rounded-lg">
                <span className="text-[#64748b] uppercase text-sm">{key.replace('_', ' ')}</span>
                <span className="text-white font-semibold">{value?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}