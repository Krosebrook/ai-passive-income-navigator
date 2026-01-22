import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function PortfolioPerformanceChart({ investments }) {
  // Generate performance data from investment history
  const performanceData = React.useMemo(() => {
    const dataMap = new Map();

    investments.forEach(investment => {
      if (investment.performance_history) {
        investment.performance_history.forEach(point => {
          const existing = dataMap.get(point.date) || { date: point.date, total_value: 0, total_roi: 0 };
          existing.total_value += point.value;
          existing.total_roi += point.roi || 0;
          dataMap.set(point.date, existing);
        });
      }
    });

    return Array.from(dataMap.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(d => ({
        ...d,
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total_roi: (d.total_roi / investments.length).toFixed(2)
      }));
  }, [investments]);

  return (
    <Card className="card-dark">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] bg-clip-text text-transparent">
          <TrendingUp className="w-5 h-5 text-[#8b85f7]" />
          Portfolio Performance Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b85f7" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b85f7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #2d1e50', borderRadius: '8px' }}
              labelStyle={{ color: '#ffffff' }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="total_value" 
              stroke="#8b85f7" 
              fillOpacity={1} 
              fill="url(#colorValue)"
              name="Portfolio Value ($)"
            />
            <Line 
              type="monotone" 
              dataKey="total_roi" 
              stroke="#00b7eb" 
              strokeWidth={2}
              name="ROI (%)"
              dot={{ fill: '#00b7eb', r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}