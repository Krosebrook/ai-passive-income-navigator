import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  TrendingUp, TrendingDown, DollarSign, Percent, 
  RefreshCw, Download, Calendar, Loader2 
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * Performance Tracker
 * Displays real-time financial metrics and syncs with monetization platforms
 */
export default function PerformanceTracker({ portfolioIdeaId, ideaTitle }) {
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);

  // Fetch integrations
  const { data: integrations = [] } = useQuery({
    queryKey: ['integrations', portfolioIdeaId],
    queryFn: () => base44.entities.MonetizationIntegration.filter({ 
      portfolio_idea_id: portfolioIdeaId 
    })
  });

  // Fetch financial data
  const { data: financialData = [] } = useQuery({
    queryKey: ['financial-data', portfolioIdeaId],
    queryFn: () => base44.entities.FinancialData.filter({ 
      portfolio_idea_id: portfolioIdeaId 
    })
  });

  // Calculate metrics
  const totalRevenue = integrations.reduce((sum, i) => sum + (i.total_revenue || 0), 0);
  const recentData = financialData.slice(-7); // Last 7 entries
  const totalExpenses = recentData.reduce((sum, d) => sum + (d.expenses || 0), 0);
  const totalProfit = totalRevenue - totalExpenses;
  const roi = totalExpenses > 0 ? ((totalProfit / totalExpenses) * 100) : 0;
  
  // Calculate growth rate
  const oldRevenue = financialData.slice(0, 7).reduce((sum, d) => sum + (d.revenue || 0), 0);
  const newRevenue = recentData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const growthRate = oldRevenue > 0 ? (((newRevenue - oldRevenue) / oldRevenue) * 100) : 0;

  // Sync data mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('syncMonetizationData', { 
        portfolioIdeaId 
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['financial-data'] });
      toast.success(`Synced ${response.data.synced_platforms} platforms`);
    },
    onError: () => {
      toast.error('Sync failed');
    }
  });

  const handleSync = async () => {
    setSyncing(true);
    await syncMutation.mutateAsync();
    setSyncing(false);
  };

  // Chart data
  const chartData = recentData.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: d.revenue || 0,
    expenses: d.expenses || 0,
    profit: d.profit || 0
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
            <div className="flex items-center gap-1 mt-1">
              {growthRate >= 0 ? (
                <TrendingUp className="w-3 h-3 text-emerald-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
              <span className={`text-xs ${growthRate >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {growthRate.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Profit</p>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">${totalProfit.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">After expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">ROI</p>
              <Percent className="w-4 h-4 text-violet-600" />
            </div>
            <p className="text-2xl font-bold">{roi.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">Return on investment</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Growth Rate</p>
              {growthRate >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
            </div>
            <p className="text-2xl font-bold">{growthRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Revenue & Profit Trend</CardTitle>
            <Button onClick={handleSync} disabled={syncing} size="sm">
              {syncing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Syncing...</>
              ) : (
                <><RefreshCw className="w-4 h-4 mr-2" /> Sync Data</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No data available. Sync your platforms to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connected Platforms */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Platforms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {integrations.map(integration => (
              <div key={integration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold capitalize">{integration.platform}</p>
                  <p className="text-xs text-gray-600">
                    {integration.last_sync 
                      ? `Last sync: ${new Date(integration.last_sync).toLocaleDateString()}`
                      : 'Not synced yet'
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">${integration.total_revenue || 0}</p>
                  <p className="text-xs text-gray-600">{integration.total_sales || 0} sales</p>
                </div>
              </div>
            ))}
            {integrations.length === 0 && (
              <div className="col-span-2 text-center py-6 text-gray-500">
                No platforms connected yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}