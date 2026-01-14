import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, Target, Zap,
  ArrowUpRight, FolderHeart, Sparkles,
  BarChart3, PieChart
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart as RechartsPie,
  Pie, Cell
} from 'recharts';

import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import RecommendedIdeas from '@/components/dashboard/RecommendedIdeas';
import { CATEGORIES, STATUS_COLORS } from '@/components/data/ideasCatalog';

const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const { data: portfolioIdeas = [], isLoading: loadingPortfolio } = useQuery({
    queryKey: ['portfolioIdeas'],
    queryFn: () => base44.entities.PortfolioIdea.list('-created_date')
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => base44.entities.Bookmark.list()
  });

  const { data: enrichments = [] } = useQuery({
    queryKey: ['enrichments'],
    queryFn: () => base44.entities.IdeaEnrichment.list()
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['performanceMetrics'],
    queryFn: () => base44.entities.PerformanceMetric.list('-date', 30)
  });

  // Calculate stats
  const stats = useMemo(() => {
    const statusCounts = portfolioIdeas.reduce((acc, idea) => {
      acc[idea.status] = (acc[idea.status] || 0) + 1;
      return acc;
    }, {});

    const categoryCounts = portfolioIdeas.reduce((acc, idea) => {
      const catName = CATEGORIES.find(c => c.id === idea.category)?.name || idea.category;
      acc[catName] = (acc[catName] || 0) + 1;
      return acc;
    }, {});

    const totalRevenue = metrics.reduce((sum, m) => sum + (m.revenue || 0), 0);

    return {
      totalIdeas: portfolioIdeas.length,
      activeIdeas: statusCounts['in_progress'] || 0,
      launchedIdeas: statusCounts['launched'] || 0,
      enrichedIdeas: enrichments.length,
      bookmarksCount: bookmarks.length,
      totalRevenue,
      statusData: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
      categoryData: Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))
    };
  }, [portfolioIdeas, bookmarks, enrichments, metrics]);

  // Revenue chart data
  const revenueChartData = useMemo(() => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayMetrics = metrics.filter(m => m.date === dateStr);
      const revenue = dayMetrics.reduce((sum, m) => sum + (m.revenue || 0), 0);
      last30Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue
      });
    }
    return last30Days;
  }, [metrics]);

  if (loadingPortfolio) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Dashboard"
          subtitle="Overview of your passive income journey"
          gradient="from-violet-600 to-purple-600"
        />

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Portfolio Ideas', value: stats.totalIdeas, icon: FolderHeart, color: 'text-violet-600', bg: 'bg-violet-100' },
            { label: 'In Progress', value: stats.activeIdeas, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-100' },
            { label: 'Launched', value: stats.launchedIdeas, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
            { label: 'AI Enriched', value: stats.enrichedIdeas, icon: Sparkles, color: 'text-blue-600', bg: 'bg-blue-100' }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white border-0 shadow-sm h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-violet-600" />
                  Revenue Trend (30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: 'none', 
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white border-0 shadow-sm h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-violet-600" />
                  By Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.categoryData.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={stats.categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-400">
                    No data yet
                  </div>
                )}
                <div className="space-y-2 mt-4">
                  {stats.categoryData.slice(0, 4).map((cat, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} 
                        />
                        <span className="text-gray-600 truncate max-w-[120px]">{cat.name}</span>
                      </div>
                      <span className="font-medium">{cat.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Link to={createPageUrl('Home')}>
            <Card className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-6">
                <Target className="w-8 h-8 mb-3" />
                <h3 className="font-semibold text-lg mb-1">Discover Ideas</h3>
                <p className="text-violet-200 text-sm">Browse 30+ curated opportunities</p>
              </CardContent>
            </Card>
          </Link>
          <Link to={createPageUrl('Portfolio')}>
            <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-6">
                <FolderHeart className="w-8 h-8 mb-3" />
                <h3 className="font-semibold text-lg mb-1">My Portfolio</h3>
                <p className="text-emerald-100 text-sm">{stats.totalIdeas} ideas tracked</p>
              </CardContent>
            </Card>
          </Link>
          <Link to={createPageUrl('Trends')}>
            <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-6">
                <TrendingUp className="w-8 h-8 mb-3" />
                <h3 className="font-semibold text-lg mb-1">Market Trends</h3>
                <p className="text-amber-100 text-sm">AI-powered forecasts</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Recommended Ideas Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <RecommendedIdeas />
        </motion.div>

        {/* Recent Portfolio Ideas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Portfolio Activity</CardTitle>
              <Link to={createPageUrl('Portfolio')}>
                <Button variant="ghost" size="sm" className="gap-2">
                  View All
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {portfolioIdeas.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FolderHeart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No ideas in your portfolio yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {portfolioIdeas.slice(0, 5).map((idea, i) => (
                    <div key={idea.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${idea.color || 'from-violet-500 to-purple-500'}`} />
                        <div>
                          <h4 className="font-medium text-gray-900">{idea.title}</h4>
                          <p className="text-sm text-gray-500">{idea.category?.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[idea.status] || 'bg-gray-100 text-gray-600'}`}>
                        {idea.status?.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}