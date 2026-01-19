import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, PieChart as PieIcon, Target, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const COLORS = ['#8b85f7', '#00b7eb', '#ff8e42', '#10b981', '#f59e0b'];

export default function PortfolioPerformanceCharts({ portfolioIdeas = [] }) {
  const [simulationGrowth, setSimulationGrowth] = useState(15);
  const [simulationYears, setSimulationYears] = useState(5);

  // Portfolio growth over time (simulated data)
  const growthData = useMemo(() => {
    const months = 12;
    return Array.from({ length: months }, (_, i) => ({
      month: new Date(2025, i).toLocaleDateString('en-US', { month: 'short' }),
      portfolio: 10000 + (i * 2500) + (Math.random() * 1000),
      target: 10000 + (i * 2000)
    }));
  }, []);

  // Asset allocation
  const allocationData = useMemo(() => {
    const grouped = portfolioIdeas.reduce((acc, idea) => {
      const category = idea.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [portfolioIdeas]);

  // Risk diversification
  const riskData = [
    { name: 'Low Risk', value: 30, color: '#10b981' },
    { name: 'Medium Risk', value: 50, color: '#f59e0b' },
    { name: 'High Risk', value: 20, color: '#ef4444' }
  ];

  // Target performance
  const currentReturn = 18.5;
  const targetReturn = 15;

  // Simulation data
  const simulationData = useMemo(() => {
    return Array.from({ length: simulationYears }, (_, i) => ({
      year: `Year ${i + 1}`,
      conservative: 10000 * Math.pow(1 + 0.05, i + 1),
      moderate: 10000 * Math.pow(1 + (simulationGrowth / 100), i + 1),
      aggressive: 10000 * Math.pow(1 + 0.25, i + 1)
    }));
  }, [simulationGrowth, simulationYears]);

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Portfolio Value</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-white">$42,500</div>
            <div className="text-sm text-green-400 mt-1">+18.5% YTD</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Current vs Target</span>
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-white">{currentReturn}%</div>
            <div className={`text-sm mt-1 ${currentReturn > targetReturn ? 'text-green-400' : 'text-yellow-400'}`}>
              Target: {targetReturn}% {currentReturn > targetReturn ? '✓' : ''}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Active Positions</span>
              <PieIcon className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-white">{portfolioIdeas.length}</div>
            <div className="text-sm text-gray-400 mt-1">Across {allocationData.length} categories</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Growth */}
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Portfolio Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b85f7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b85f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #2d1e50', borderRadius: '8px' }}
                  labelStyle={{ color: '#ffffff' }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Area type="monotone" dataKey="portfolio" stroke="#8b85f7" fillOpacity={1} fill="url(#colorPortfolio)" />
                <Line type="monotone" dataKey="target" stroke="#00b7eb" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Asset Allocation */}
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <PieIcon className="w-5 h-5 text-purple-500" />
              Asset Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #2d1e50', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Diversification */}
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #2d1e50', borderRadius: '8px' }}
                  labelStyle={{ color: '#ffffff' }}
                  formatter={(value) => `${value}%`}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Investment Scenario Simulator */}
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="w-5 h-5 text-blue-500" />
              Scenario Simulator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-4">
              <div>
                <Label className="text-sm text-gray-400">Annual Return: {simulationGrowth}%</Label>
                <Slider
                  value={[simulationGrowth]}
                  onValueChange={([val]) => setSimulationGrowth(val)}
                  min={5}
                  max={50}
                  step={5}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-400">Time Horizon: {simulationYears} years</Label>
                <Slider
                  value={[simulationYears]}
                  onValueChange={([val]) => setSimulationYears(val)}
                  min={1}
                  max={20}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #2d1e50', borderRadius: '8px' }}
                  labelStyle={{ color: '#ffffff' }}
                  formatter={(value) => `$${(value / 1000).toFixed(1)}K`}
                />
                <Line type="monotone" dataKey="conservative" stroke="#10b981" strokeWidth={2} name="Conservative (5%)" />
                <Line type="monotone" dataKey="moderate" stroke="#8b85f7" strokeWidth={2} name={`Moderate (${simulationGrowth}%)`} />
                <Line type="monotone" dataKey="aggressive" stroke="#ef4444" strokeWidth={2} name="Aggressive (25%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}