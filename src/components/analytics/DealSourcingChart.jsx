import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';

export default function DealSourcingChart({ deals, filters }) {
  const chartData = useMemo(() => {
    // Group deals by week/month
    const groupBy = filters.dateRange === 'last_7_days' ? 'day' : 
                    filters.dateRange === 'last_30_days' ? 'week' : 'month';
    
    const grouped = deals.reduce((acc, deal) => {
      const date = new Date(deal.created_date);
      let key;
      
      if (groupBy === 'day') {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      
      if (!acc[key]) {
        acc[key] = { name: key, count: 0, totalValue: 0, avgValue: 0 };
      }
      acc[key].count += 1;
      acc[key].totalValue += deal.estimated_value || 0;
      
      return acc;
    }, {});

    return Object.values(grouped).map(item => ({
      ...item,
      avgValue: item.count > 0 ? Math.round(item.totalValue / item.count) : 0
    })).slice(-12);
  }, [deals, filters]);

  const stats = useMemo(() => {
    const total = deals.length;
    const totalValue = deals.reduce((sum, d) => sum + (d.estimated_value || 0), 0);
    const avgValue = total > 0 ? totalValue / total : 0;
    
    return { total, totalValue, avgValue };
  }, [deals]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Deals Over Time */}
      <Card className="bg-[#1a0f2e] border-[#2d1e50]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-[#8b85f7]" />
            Deals Sourced Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a0f2e', 
                  border: '1px solid #2d1e50',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#ffffff' }}
              />
              <Legend wrapperStyle={{ color: '#64748b' }} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#8b85f7" 
                strokeWidth={3}
                name="Deals"
                dot={{ fill: '#8b85f7', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-gray-400">Total Deals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                ${(stats.totalValue / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-gray-400">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                ${(stats.avgValue / 1000).toFixed(1)}K
              </div>
              <div className="text-xs text-gray-400">Avg Value</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Deal Value */}
      <Card className="bg-[#1a0f2e] border-[#2d1e50]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <DollarSign className="w-5 h-5 text-green-500" />
            Deal Value Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a0f2e', 
                  border: '1px solid #2d1e50',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#ffffff' }}
                formatter={(value) => `$${(value / 1000).toFixed(1)}K`}
              />
              <Legend wrapperStyle={{ color: '#64748b' }} />
              <Bar 
                dataKey="avgValue" 
                fill="#10b981" 
                name="Avg Value"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Highest Value Deal</span>
              <span className="text-white font-semibold">
                ${Math.max(...deals.map(d => d.estimated_value || 0)).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Lowest Value Deal</span>
              <span className="text-white font-semibold">
                ${Math.min(...deals.map(d => d.estimated_value || 0).filter(v => v > 0)).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}