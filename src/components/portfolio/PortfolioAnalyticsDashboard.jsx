import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Target, Flame } from 'lucide-react';

/**
 * Portfolio Analytics Dashboard Component
 * 
 * Features:
 * - ROI trends visualization over time
 * - Profit margin analysis by idea
 * - Portfolio performance vs. goals
 * - AI-identified success drivers and improvement areas
 */
export default function PortfolioAnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState('30'); // days

  const { data: portfolioIdeas = [] } = useQuery({
    queryKey: ['portfolioIdeas'],
    queryFn: () => base44.entities.PortfolioIdea.list()
  });

  const { data: financialData = [] } = useQuery({
    queryKey: ['financialData'],
    queryFn: () => base44.entities.FinancialData.list('-date', 100)
  });

  const { data: preferences } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.list();
      return prefs.length > 0 ? prefs[0] : null;
    }
  });

  /**
   * Calculate portfolio metrics and trends
   * Aggregates financial data and compares against goals
   */
  const portfolioMetrics = useMemo(() => {
    const daysAgo = parseInt(timeframe);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    const filteredData = financialData.filter(entry => 
      new Date(entry.date) >= cutoffDate
    );

    // Calculate aggregates
    const totalRevenue = filteredData.reduce((sum, d) => sum + (d.revenue || 0), 0);
    const totalExpenses = filteredData.reduce((sum, d) => sum + (d.expenses || 0), 0);
    const totalProfit = totalRevenue - totalExpenses;
    const avgMargin = filteredData.length > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

    // ROI calculation
    const totalInvestment = portfolioIdeas.reduce((sum, idea) => {
      const ideaData = financialData.filter(d => d.portfolio_idea_id === idea.id);
      return sum + ideaData.reduce((s, d) => s + (d.expenses || 0), 0);
    }, 0);
    const roi = totalInvestment > 0 ? ((totalProfit / totalInvestment) * 100).toFixed(1) : 0;

    // Goal comparison
    const monthlyGoal = preferences?.target_monthly_income || 1000;
    const actualMonthly = totalRevenue / (daysAgo / 30);
    const goalProgress = ((actualMonthly / monthlyGoal) * 100).toFixed(1);

    return {
      totalRevenue: totalRevenue.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
      avgMargin,
      roi,
      goalProgress,
      monthlyGoal,
      actualMonthly: actualMonthly.toFixed(2),
      dataPoints: filteredData.length
    };
  }, [financialData, portfolioIdeas, timeframe, preferences]);

  /**
   * Analyze profit margins by idea
   * Identifies which ideas are most profitable
   */
  const profitMarginByIdea = useMemo(() => {
    return portfolioIdeas.map(idea => {
      const ideaData = financialData.filter(d => d.portfolio_idea_id === idea.id);
      const revenue = ideaData.reduce((sum, d) => sum + (d.revenue || 0), 0);
      const expenses = ideaData.reduce((sum, d) => sum + (d.expenses || 0), 0);
      const profit = revenue - expenses;
      const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

      return {
        id: idea.id,
        title: idea.title,
        revenue: parseFloat(revenue.toFixed(2)),
        expenses: parseFloat(expenses.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        margin: parseFloat(margin)
      };
    }).filter(item => item.revenue > 0).sort((a, b) => b.margin - a.margin);
  }, [financialData, portfolioIdeas]);

  /**
   * ROI trends over time
   * Shows cumulative ROI progression
   */
  const roiTrends = useMemo(() => {
    const daysAgo = parseInt(timeframe);
    const trends = {};

    financialData.forEach(entry => {
      const entryDate = new Date(entry.date);
      if (entryDate >= new Date(Date.now() - daysAgo * 86400000)) {
        const dateStr = entry.date;
        if (!trends[dateStr]) {
          trends[dateStr] = { date: dateStr, revenue: 0, expenses: 0 };
        }
        trends[dateStr].revenue += entry.revenue || 0;
        trends[dateStr].expenses += entry.expenses || 0;
      }
    });

    return Object.values(trends)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        roi: item.expenses > 0 ? ((item.revenue / item.expenses) * 100).toFixed(1) : 0,
        profit: (item.revenue - item.expenses).toFixed(2)
      }));
  }, [financialData, timeframe]);

  return (
    <div className="space-y-6">
      {/* Time Period Selector */}
      <Tabs value={timeframe} onValueChange={setTimeframe} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="7">7 Days</TabsTrigger>
          <TabsTrigger value="30">30 Days</TabsTrigger>
          <TabsTrigger value="90">90 Days</TabsTrigger>
          <TabsTrigger value="365">1 Year</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-violet-200 bg-violet-50">
          <CardContent className="p-4">
            <p className="text-xs text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-violet-600">${portfolioMetrics.totalRevenue}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-4">
            <p className="text-xs text-gray-600">Total Profit</p>
            <p className="text-2xl font-bold text-emerald-600">${portfolioMetrics.totalProfit}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-xs text-gray-600">Avg Margin</p>
            <p className="text-2xl font-bold text-blue-600">{portfolioMetrics.avgMargin}%</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-xs text-gray-600">Overall ROI</p>
            <p className="text-2xl font-bold text-amber-600">{portfolioMetrics.roi}%</p>
          </CardContent>
        </Card>
      </div>

      {/* ROI Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-600" />
            ROI & Profit Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={roiTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="roi" stroke="#8b5cf6" name="ROI %" />
              <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#10b981" name="Profit $" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Profit Margin by Idea */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profit Margins by Idea</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profitMarginByIdea}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="margin" fill="#8b5cf6" name="Margin %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Goal Progress */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Monthly Income Goal</p>
              <p className="text-3xl font-bold text-indigo-600">${portfolioMetrics.actualMonthly} / ${portfolioMetrics.monthlyGoal}</p>
            </div>
            <Target className="w-12 h-12 text-indigo-300" />
          </div>
          <div className="w-full bg-indigo-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(parseFloat(portfolioMetrics.goalProgress), 100)}%` }}
            />
          </div>
          <p className="text-sm text-indigo-600 mt-2 font-medium">{portfolioMetrics.goalProgress}% of goal</p>
        </CardContent>
      </Card>

      {/* Top Performing Ideas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-600" />
            Top Performing Ideas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {profitMarginByIdea.slice(0, 5).map((idea, idx) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{idea.title}</p>
                  <p className="text-xs text-gray-500">Profit: ${idea.profit.toFixed(2)}</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">
                  {idea.margin}% margin
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}