import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DealSourcingChart from '@/components/analytics/DealSourcingChart';
import ConversionRateChart from '@/components/analytics/ConversionRateChart';
import UserEngagementMetrics from '@/components/analytics/UserEngagementMetrics';
import IntegrationPerformance from '@/components/analytics/IntegrationPerformance';
import AnalyticsFilters from '@/components/analytics/AnalyticsFilters';
import PortfolioPerformanceCharts from '@/components/analytics/PortfolioPerformanceCharts';
import { TrendingUp, DollarSign, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Analytics() {
  const [filters, setFilters] = useState({
    dateRange: 'last_30_days',
    startDate: null,
    endDate: null,
    industries: [],
    minDealValue: 0
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['sourced-deals', filters],
    queryFn: async () => {
      const allDeals = await base44.entities.SourcedDealOpportunity.list();
      return allDeals.filter(deal => {
        if (filters.industries.length > 0 && !filters.industries.includes(deal.industry)) {
          return false;
        }
        if (filters.minDealValue > 0 && deal.estimated_value < filters.minDealValue) {
          return false;
        }
        return true;
      });
    }
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ['user-analytics'],
    queryFn: () => base44.entities.UserPreferences.list()
  });

  const { data: portfolioIdeas = [] } = useQuery({
    queryKey: ['portfolio-ideas'],
    queryFn: () => base44.entities.PortfolioIdea.list()
  });

  // Calculate KPIs
  const totalDeals = deals.length;
  const avgDealValue = deals.length > 0 
    ? deals.reduce((sum, d) => sum + (d.estimated_value || 0), 0) / deals.length 
    : 0;
  const totalUsers = analytics.length;
  const activeUsers = analytics.filter(u => u.has_completed_onboarding).length;

  const kpis = [
    {
      label: 'Total Deals Sourced',
      value: totalDeals,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      label: 'Avg Deal Value',
      value: `$${(avgDealValue / 1000).toFixed(1)}K`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'Active Users',
      value: `${activeUsers}/${totalUsers}`,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Conversion Rate',
      value: '12.4%',
      icon: Zap,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Analytics Dashboard"
          subtitle="Track performance metrics and insights"
        />

        {/* Filters */}
        <AnalyticsFilters filters={filters} onFilterChange={setFilters} />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-[#1a0f2e] border-[#2d1e50]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">{kpi.label}</span>
                      <div className={`w-10 h-10 rounded-lg ${kpi.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${kpi.color}`} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white">{kpi.value}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts */}
        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="bg-[#1a0f2e] border border-[#2d1e50]">
            <TabsTrigger value="portfolio">Portfolio Performance</TabsTrigger>
            <TabsTrigger value="deals">Deal Sourcing</TabsTrigger>
            <TabsTrigger value="conversion">Conversion Rates</TabsTrigger>
            <TabsTrigger value="engagement">User Engagement</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            <PortfolioPerformanceCharts portfolioIdeas={portfolioIdeas} />
          </TabsContent>

          <TabsContent value="deals" className="space-y-6">
            <DealSourcingChart deals={deals} filters={filters} />
          </TabsContent>

          <TabsContent value="conversion" className="space-y-6">
            <ConversionRateChart deals={deals} />
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <UserEngagementMetrics analytics={analytics} />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <IntegrationPerformance />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}