import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, TrendingUp, Sparkles, Settings, BarChart2, Target, Bookmark, PieChart } from 'lucide-react';
import DealPerformanceMetrics from '@/components/dashboard/DealPerformanceMetrics';
import MarketPerformanceWidget from '@/components/dashboard/MarketPerformanceWidget';
import AIInsightsSummary from '@/components/dashboard/AIInsightsSummary';
import CustomizableWidgets from '@/components/dashboard/CustomizableWidgets';
import PredictiveInsightsDashboard from '@/components/analytics/PredictiveInsightsDashboard';
import MarketIntelligenceCharts from '@/components/dashboard/MarketIntelligenceCharts';
import DealRiskRewardCharts from '@/components/dashboard/DealRiskRewardCharts';
import WatchlistDashboard from '@/components/dashboard/WatchlistDashboard';
import PortfolioAnalysis from '@/components/dashboard/PortfolioAnalysis';

export default function Dashboard() {
  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['dashboard-deals'],
    queryFn: () => base44.entities.DealPipeline.list()
  });

  return (
    <div className="min-h-screen bg-[#0f0618] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Performance Dashboard
          </h1>
          <p className="text-[#64748b] text-lg">
            Track your KPIs, market performance, and AI-powered insights
          </p>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-[#1a0f2e] border border-[#2d1e50]">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#8b85f7]">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="deals" className="data-[state=active]:bg-[#8b85f7]">
              <TrendingUp className="w-4 h-4 mr-2" />
              Deal Metrics
            </TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-[#8b85f7]">
              <TrendingUp className="w-4 h-4 mr-2" />
              Market Performance
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-[#8b85f7]">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="predictive" className="data-[state=active]:bg-[#8b85f7]">
              <TrendingUp className="w-4 h-4 mr-2" />
              Predictive Analytics
            </TabsTrigger>
            <TabsTrigger value="portfolio-analysis" className="data-[state=active]:bg-[#8b85f7]">
              <PieChart className="w-4 h-4 mr-2" />
              Portfolio Analysis
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="data-[state=active]:bg-[#8b85f7]">
              <Bookmark className="w-4 h-4 mr-2" />
              Watchlist
            </TabsTrigger>
            <TabsTrigger value="market-intel" className="data-[state=active]:bg-[#8b85f7]">
              <BarChart2 className="w-4 h-4 mr-2" />
              Market Intel
            </TabsTrigger>
            <TabsTrigger value="deal-profiles" className="data-[state=active]:bg-[#8b85f7]">
              <Target className="w-4 h-4 mr-2" />
              Deal Profiles
            </TabsTrigger>
            <TabsTrigger value="customize" className="data-[state=active]:bg-[#8b85f7]">
              <Settings className="w-4 h-4 mr-2" />
              Customize
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - All Widgets */}
          <TabsContent value="overview">
            <CustomizableWidgets>
              <div key="deal-metrics">
                <DealPerformanceMetrics deals={deals} />
              </div>
              <div key="market-performance">
                <MarketPerformanceWidget />
              </div>
              <div key="ai-insights">
                <AIInsightsSummary />
              </div>
            </CustomizableWidgets>
          </TabsContent>

          {/* Deal Metrics Tab */}
          <TabsContent value="deals">
            <DealPerformanceMetrics deals={deals} />
          </TabsContent>

          {/* Market Performance Tab */}
          <TabsContent value="market">
            <MarketPerformanceWidget />
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai">
            <AIInsightsSummary />
          </TabsContent>

          {/* Predictive Analytics Tab */}
          <TabsContent value="predictive">
            <PredictiveInsightsDashboard />
          </TabsContent>

          {/* Watchlist Tab */}
          <TabsContent value="watchlist">
            <WatchlistDashboard />
          </TabsContent>

          {/* Market Intelligence Tab */}
          <TabsContent value="market-intel">
            <MarketIntelligenceCharts />
          </TabsContent>

          {/* Deal Risk-Reward Tab */}
          <TabsContent value="deal-profiles">
            <DealRiskRewardCharts />
          </TabsContent>

          {/* Customize Tab */}
          <TabsContent value="customize">
            <CustomizableWidgets>
              <div key="deal-metrics">
                <DealPerformanceMetrics deals={deals} />
              </div>
              <div key="market-performance">
                <MarketPerformanceWidget />
              </div>
              <div key="ai-insights">
                <AIInsightsSummary />
              </div>
            </CustomizableWidgets>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}