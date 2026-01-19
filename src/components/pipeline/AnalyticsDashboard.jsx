import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Clock, CheckCircle, DollarSign, Users, Zap, Loader2 } from 'lucide-react';

const COLORS = ['#8b85f7', '#00b7eb', '#ff8e42', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['pipeline-analytics'],
    queryFn: async () => {
      const result = await base44.functions.invoke('calculatePipelineAnalytics', {});
      return result.data.analytics;
    },
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#8b85f7]" />
      </div>
    );
  }

  const { overview, stageMetrics, teamPerformance, recentActivity, velocity } = analytics;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Active Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{overview.activeDeals}</div>
            <p className="text-xs text-gray-500 mt-1">
              {overview.totalDeals} total deals
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Avg Cycle Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{overview.averageCycleTime}</div>
            <p className="text-xs text-gray-500 mt-1">days to close</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Projected ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">
              ${(overview.projectedROI / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ${(overview.weightedROI / 1000).toFixed(0)}K weighted
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Task Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{overview.taskCompletionRate}%</div>
            <p className="text-xs text-gray-500 mt-1">completion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Distribution */}
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader>
            <CardTitle className="text-white">Deal Distribution by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stageMetrics.distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
                <XAxis dataKey="stage" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #2d1e50' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#8b85f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Rates */}
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader>
            <CardTitle className="text-white">Stage Conversion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(stageMetrics.conversionRates).map(([stage, rate]) => ({ stage, rate }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
                <XAxis dataKey="stage" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #2d1e50' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="rate" fill="#00b7eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamPerformance.slice(0, 5).map((member, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#0f0618]">
                  <div>
                    <p className="font-medium text-white">{member.name}</p>
                    <p className="text-xs text-gray-500">
                      {member.total} deals • {member.completed} completed
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#8b85f7]">
                      {member.completionRate}%
                    </div>
                    <p className="text-xs text-gray-500">
                      ${(member.totalValue / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Velocity Chart */}
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Deal Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={velocity.slice(-6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b"
                  tickFormatter={(val) => new Date(val + '-01').toLocaleDateString('en', { month: 'short' })}
                />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #2d1e50' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completions" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights & Recommendations */}
      <Card className="bg-[#1a0f2e] border-[#2d1e50]">
        <CardHeader>
          <CardTitle className="text-white">Actionable Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overview.averageCycleTime > 60 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <TrendingDown className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-400">Long Cycle Time Detected</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Average cycle time is {overview.averageCycleTime} days. Consider streamlining your process or identifying bottlenecks.
                  </p>
                </div>
              </div>
            )}

            {overview.taskCompletionRate < 70 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-400">Low Task Completion</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Only {overview.taskCompletionRate}% of tasks are completed. Review task assignments and deadlines.
                  </p>
                </div>
              </div>
            )}

            {recentActivity.newDeals > recentActivity.completions * 2 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <TrendingUp className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-400">Pipeline Growing</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {recentActivity.newDeals} new deals in last 30 days vs {recentActivity.completions} completions. 
                    Consider increasing capacity or refining lead qualification.
                  </p>
                </div>
              </div>
            )}

            {overview.averageCycleTime < 30 && overview.taskCompletionRate > 80 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-400">Excellent Performance</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Your pipeline is healthy with fast cycle times and high task completion rates. Keep up the great work!
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}