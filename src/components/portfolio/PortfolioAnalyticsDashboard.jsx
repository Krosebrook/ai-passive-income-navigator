import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, PieChart as PieIcon, Activity, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const COLORS = ['#8b85f7', '#00b7eb', '#ff8e42', '#10b981', '#ef4444', '#a855f7'];

export default function PortfolioAnalyticsDashboard() {
  const [scenarioMultiplier, setScenarioMultiplier] = useState(1);

  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['portfolio-metrics'],
    queryFn: async () => {
      const response = await base44.functions.invoke('calculatePortfolioMetrics', {});
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="spinner mx-auto mb-4" />
        <p className="text-[#64748b]">Calculating portfolio metrics...</p>
      </div>
    );
  }

  if (!metrics || metrics.total_investments === 0) {
    return (
      <Card className="border-[#2d1e50] bg-[#1a0f2e]">
        <CardContent className="py-12 text-center">
          <Activity className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Investments Yet</h3>
          <p className="text-[#64748b]">
            Start investing to see your portfolio analytics
          </p>
        </CardContent>
      </Card>
    );
  }

  const industryData = Object.entries(metrics.by_industry || {}).map(([name, data]) => ({
    name,
    value: data.current_value,
    roi: data.roi
  }));

  const gainsData = [
    { name: 'Unrealized', value: metrics.unrealized_gains || 0 },
    { name: 'Realized', value: metrics.realized_gains || 0 }
  ];

  const scenarioValue = metrics.current_value * scenarioMultiplier;
  const scenarioROI = ((scenarioValue - metrics.total_invested) / metrics.total_invested) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="w-6 h-6 text-[#8b85f7]" />
          Portfolio Analytics
        </h2>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-[#2d1e50] bg-[#1a0f2e]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[#64748b] font-normal">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${metrics.total_invested?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-[#2d1e50] bg-[#1a0f2e]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[#64748b] font-normal">Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#00b7eb]">${metrics.current_value?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-[#2d1e50] bg-[#1a0f2e]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[#64748b] font-normal">ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${metrics.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.roi?.toFixed(2) || 0}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#2d1e50] bg-[#1a0f2e]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[#64748b] font-normal">IRR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${metrics.irr >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.irr?.toFixed(2) || 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-[#2d1e50] bg-[#1a0f2e]">
          <CardHeader>
            <CardTitle className="text-base">Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metrics.performance_history || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #2d1e50' }}
                  labelStyle={{ color: '#8b85f7' }}
                />
                <Line type="monotone" dataKey="value" stroke="#8b85f7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#2d1e50] bg-[#1a0f2e]">
          <CardHeader>
            <CardTitle className="text-base">Industry Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={industryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {industryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #2d1e50' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-[#2d1e50] bg-[#1a0f2e]">
          <CardHeader>
            <CardTitle className="text-base">Unrealized vs Realized Gains</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={gainsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #2d1e50' }}
                />
                <Bar dataKey="value" fill="#00b7eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#2d1e50] bg-[#1a0f2e]">
          <CardHeader>
            <CardTitle className="text-base">Scenario Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-[#64748b] mb-2 block">
                Market Multiplier: {scenarioMultiplier.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={scenarioMultiplier}
                onChange={(e) => setScenarioMultiplier(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b]">Scenario Value:</span>
                <span className="font-bold">${scenarioValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b]">Scenario ROI:</span>
                <span className={`font-bold ${scenarioROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {scenarioROI.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b]">Change from Current:</span>
                <span className="font-bold">
                  {((scenarioMultiplier - 1) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-[#64748b]">
                Adjust the slider to see how market changes would affect your portfolio
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}