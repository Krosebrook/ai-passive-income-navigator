import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, CheckCircle2, Target } from 'lucide-react';

export default function DealPerformanceMetrics({ deals = [] }) {
  // Calculate closure rates
  const totalDeals = deals.length;
  const closedDeals = deals.filter(d => d.stage === 'closed_won').length;
  const lostDeals = deals.filter(d => d.stage === 'closed_lost').length;
  const closureRate = totalDeals > 0 ? ((closedDeals / totalDeals) * 100).toFixed(1) : 0;

  // Calculate average deal cycle time
  const completedDeals = deals.filter(d => d.stage === 'closed_won' || d.stage === 'closed_lost');
  const avgCycleTime = completedDeals.length > 0
    ? completedDeals.reduce((acc, deal) => {
        const created = new Date(deal.created_date);
        const updated = new Date(deal.updated_date);
        const days = Math.floor((updated - created) / (1000 * 60 * 60 * 24));
        return acc + days;
      }, 0) / completedDeals.length
    : 0;

  // Stage distribution data
  const stageData = [
    { name: 'Prospecting', value: deals.filter(d => d.stage === 'prospecting').length, color: '#8b85f7' },
    { name: 'Qualified', value: deals.filter(d => d.stage === 'qualified').length, color: '#00b7eb' },
    { name: 'Proposal', value: deals.filter(d => d.stage === 'proposal').length, color: '#ff8e42' },
    { name: 'Negotiation', value: deals.filter(d => d.stage === 'negotiation').length, color: '#ff69b4' },
    { name: 'Closed Won', value: closedDeals, color: '#10b981' },
    { name: 'Closed Lost', value: lostDeals, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Monthly trend data (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthDeals = deals.filter(d => {
      const dealDate = new Date(d.created_date);
      return dealDate.getMonth() === date.getMonth() && dealDate.getFullYear() === date.getFullYear();
    });
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      deals: monthDeals.length,
      closed: monthDeals.filter(d => d.stage === 'closed_won').length
    };
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#8b85f7]/20 to-[#583cf0]/10 border-[#8b85f7]/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748b]">Total Deals</p>
                <p className="text-3xl font-bold text-white mt-1">{totalDeals}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#8b85f7]/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-[#8b85f7]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#10b981]/20 to-[#059669]/10 border-[#10b981]/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748b]">Closure Rate</p>
                <p className="text-3xl font-bold text-white mt-1">{closureRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-[#10b981]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#00b7eb]/20 to-[#0284c7]/10 border-[#00b7eb]/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748b]">Avg Cycle Time</p>
                <p className="text-3xl font-bold text-white mt-1">{Math.round(avgCycleTime)}</p>
                <p className="text-xs text-[#64748b]">days</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#00b7eb]/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#00b7eb]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#ff8e42]/20 to-[#f59e0b]/10 border-[#ff8e42]/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748b]">Win Rate</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {completedDeals.length > 0 ? ((closedDeals / completedDeals.length) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#ff8e42]/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#ff8e42]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader>
            <CardTitle className="text-white">Deal Pipeline Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #2d1e50' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="deals" stroke="#8b85f7" strokeWidth={2} name="Total Deals" />
                <Line type="monotone" dataKey="closed" stroke="#10b981" strokeWidth={2} name="Closed Won" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stage Distribution */}
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader>
            <CardTitle className="text-white">Pipeline Stage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #2d1e50' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}