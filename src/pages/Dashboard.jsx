import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, TrendingUp, Sparkles, Settings } from 'lucide-react';
import DealPerformanceMetrics from '@/components/dashboard/DealPerformanceMetrics';
import MarketPerformanceWidget from '@/components/dashboard/MarketPerformanceWidget';
import AIInsightsSummary from '@/components/dashboard/AIInsightsSummary';
import CustomizableWidgets from '@/components/dashboard/CustomizableWidgets';
import PredictiveInsightsDashboard from '@/components/analytics/PredictiveInsightsDashboard';

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