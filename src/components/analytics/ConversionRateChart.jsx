import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Target, TrendingUp } from 'lucide-react';

const COLORS = ['#8b85f7', '#00b7eb', '#ff8e42', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ConversionRateChart({ deals }) {
  const industryData = useMemo(() => {
    const grouped = deals.reduce((acc, deal) => {
      const industry = deal.industry || 'Unknown';
      if (!acc[industry]) {
        acc[industry] = { name: industry, total: 0, converted: 0 };
      }
      acc[industry].total += 1;
      if (deal.status === 'accepted' || deal.status === 'in_progress') {
        acc[industry].converted += 1;
      }
      return acc;
    }, {});

    return Object.values(grouped).map(item => ({
      ...item,
      rate: item.total > 0 ? ((item.converted / item.total) * 100).toFixed(1) : 0,
      value: item.total
    })).sort((a, b) => b.value - a.value);
  }, [deals]);

  const statusData = useMemo(() => {
    const grouped = deals.reduce((acc, deal) => {
      const status = deal.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, value]) => ({ 
      name: name.replace('_', ' ').toUpperCase(), 
      value 
    }));
  }, [deals]);

  const overallConversionRate = useMemo(() => {
    const converted = deals.filter(d => d.status === 'accepted' || d.status === 'in_progress').length;
    return deals.length > 0 ? ((converted / deals.length) * 100).toFixed(1) : 0;
  }, [deals]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Deal Status Distribution */}
      <Card className="bg-[#1a0f2e] border-[#2d1e50]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="w-5 h-5 text-[#8b85f7]" />
            Deal Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a0f2e', 
                  border: '1px solid #2d1e50',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-6 text-center">
            <div className="text-4xl font-bold text-[#8b85f7]">{overallConversionRate}%</div>
            <div className="text-sm text-gray-400 mt-1">Overall Conversion Rate</div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion by Industry */}
      <Card className="bg-[#1a0f2e] border-[#2d1e50]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Conversion Rate by Industry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={industryData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
              <XAxis type="number" stroke="#64748b" tick={{ fill: '#64748b' }} />
              <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a0f2e', 
                  border: '1px solid #2d1e50',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#ffffff' }}
                formatter={(value, name) => [
                  name === 'rate' ? `${value}%` : value,
                  name === 'rate' ? 'Conversion Rate' : 'Total Deals'
                ]}
              />
              <Bar dataKey="rate" fill="#10b981" name="Conversion %" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6">
            <div className="text-sm text-gray-400 mb-2">Top Performing Industry</div>
            {industryData.length > 0 && (
              <div className="flex items-center justify-between bg-[#0f0618] rounded-lg p-3 border border-[#2d1e50]">
                <span className="text-white font-medium">{industryData[0].name}</span>
                <span className="text-green-400 font-bold">{industryData[0].rate}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}