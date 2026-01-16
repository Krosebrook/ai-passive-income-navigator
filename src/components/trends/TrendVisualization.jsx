import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, DollarSign, Users, Zap } from 'lucide-react';

/**
 * Trend Visualization Component
 * Displays interactive charts for trend analysis and growth projections
 */
export default function TrendVisualization({ trends, category: _category }) {
  // Generate mock growth data based on current growth rates
  const generateGrowthData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => {
      const data = { month };
      trends.slice(0, 3).forEach(trend => {
        const growthRate = parseFloat(trend.growth_rate?.replace(/[^\d.-]/g, '') || 0);
        const baseValue = 100;
        data[trend.name] = Math.round(baseValue * Math.pow(1 + (growthRate / 100), index + 1));
      });
      return data;
    });
  };

  const growthData = generateGrowthData();
  
  // Market size comparison
  const marketSizeData = trends.slice(0, 5).map(trend => ({
    name: trend.name.length > 20 ? trend.name.substring(0, 20) + '...' : trend.name,
    value: parseFloat(trend.market_size?.replace(/[^\d.]/g, '') || Math.random() * 100),
    growth: parseFloat(trend.growth_rate?.replace(/[^\d.-]/g, '') || 0)
  }));

  // Investment vs potential
  const investmentData = trends.slice(0, 5).map(trend => {
    const investmentMatch = trend.investment_required?.match(/[\d,]+/);
    const investment = investmentMatch ? parseFloat(investmentMatch[0].replace(/,/g, '')) : Math.random() * 5000;
    
    return {
      name: trend.name.length > 15 ? trend.name.substring(0, 15) + '...' : trend.name,
      investment: Math.round(investment),
      potential: Math.round(investment * (1 + Math.random() * 3))
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Growth Projection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <TrendingUp className="w-5 h-5" />
            6-Month Growth Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={growthData}>
              <defs>
                {trends.slice(0, 3).map((trend, index) => (
                  <linearGradient key={trend.name} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={['#10b981', '#3b82f6', '#8b5cf6'][index]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={['#10b981', '#3b82f6', '#8b5cf6'][index]} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis dataKey="month" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {trends.slice(0, 3).map((trend, index) => (
                <Area
                  key={trend.name}
                  type="monotone"
                  dataKey={trend.name}
                  stroke={['#10b981', '#3b82f6', '#8b5cf6'][index]}
                  fillOpacity={1}
                  fill={`url(#color${index})`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Market Size Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Users className="w-5 h-5" />
              Market Size Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={marketSizeData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Investment vs Potential */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-violet-700">
              <DollarSign className="w-5 h-5" />
              Investment vs Revenue Potential
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={investmentData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={80} />
                <YAxis className="text-xs" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="investment" fill="#f59e0b" name="Initial Investment" radius={[8, 8, 0, 0]} />
                <Bar dataKey="potential" fill="#8b5cf6" name="Revenue Potential" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Avg Growth</p>
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(trends.reduce((acc, t) => acc + parseFloat(t.growth_rate?.replace(/[^\d.-]/g, '') || 0), 0) / trends.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Active Trends</p>
                <p className="text-lg font-bold text-gray-900">{trends.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Opportunities</p>
                <p className="text-lg font-bold text-gray-900">
                  {trends.filter(t => t.growth_direction === 'up').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Market Size</p>
                <p className="text-lg font-bold text-gray-900">Large</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}