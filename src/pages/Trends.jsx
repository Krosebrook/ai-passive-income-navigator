import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  TrendingUp, Lightbulb, Zap, Wrench, RefreshCw,
  Loader2, Bell, Sparkles
} from 'lucide-react';

import PageHeader from '@/components/ui/PageHeader';
import TrendCard from '@/components/trends/TrendCard';
import TrendAnalysisPanel from '@/components/trends/TrendAnalysisPanel';
import TrendVisualization from '@/components/trends/TrendVisualization';
import AlertSetupModal from '@/components/trends/AlertSetupModal';
import EmergingNiches from '@/components/trends/EmergingNiches';

const TREND_CATEGORIES = [
  { id: 'opportunity', label: 'Opportunities', icon: TrendingUp, analysisKey: 'opportunities' },
  { id: 'niche', label: 'Hot Niches', icon: Lightbulb, analysisKey: 'niches' },
  { id: 'shift', label: 'Market Shifts', icon: Zap, analysisKey: 'consumer' },
  { id: 'tool', label: 'Rising Tools', icon: Wrench, analysisKey: 'technologies' }
];

export default function Trends() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('opportunity');
  const [trends, setTrends] = useState({});
  const [trendAnalysis, setTrendAnalysis] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [selectedTrendForAlert, setSelectedTrendForAlert] = useState(null);
  const [emergingNiches, setEmergingNiches] = useState([]);
  const [isPredicting, setIsPredicting] = useState(false);

  const { data: followedTrends = [] } = useQuery({
    queryKey: ['followedTrends'],
    queryFn: () => base44.entities.FollowedTrend.list()
  });

  const followMutation = useMutation({
    mutationFn: async (trend) => {
      await base44.entities.FollowedTrend.create({
        trend_name: trend.name,
        trend_category: trend.category,
        trend_data: {
          description: trend.description,
          growth_rate: trend.growth_rate,
          market_size: trend.market_size,
          target_audience: trend.target_audience
        },
        notification_preferences: {
          email_alerts: true,
          in_app_alerts: true,
          alert_threshold: 'significant'
        },
        followed_date: new Date().toISOString()
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['followedTrends'] })
  });

  const unfollowMutation = useMutation({
    mutationFn: async (trend) => {
      const existing = followedTrends.find(f => f.trend_name === trend.name);
      if (existing) {
        await base44.entities.FollowedTrend.delete(existing.id);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['followedTrends'] })
  });

  const generateTrends = async () => {
    setIsGenerating(true);

    const prompts = {
      opportunity: "List 6 emerging passive income opportunities in 2024-2025. For each include: name, description (2 sentences), growth_rate (percentage), market_size, target_audience. Focus on AI-powered and digital opportunities.",
      niche: "List 6 hot niches for passive income in 2024-2025. For each include: name, description, growth_rate, market_size, target_audience. Focus on underserved markets with high potential.",
      shift: "List 6 major market shifts affecting passive income in 2024-2025. For each include: name, description, growth_rate (can be negative for declining), impact on passive income seekers.",
      tool: "List 6 rising AI tools for passive income in 2024-2025. For each include: name, description, growth_rate, pricing_range, use_cases."
    };

    const results = {};
    
    for (const category of TREND_CATEGORIES) {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompts[category.id],
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            trends: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  growth_rate: { type: 'string' },
                  market_size: { type: 'string' },
                  target_audience: { type: 'string' },
                  growth_direction: { type: 'string' }
                }
              }
            }
          }
        }
      });

      results[category.id] = (response.trends || []).map(t => ({
        ...t,
        category: category.id,
        growth_direction: t.growth_rate?.includes('-') ? 'down' : 'up'
      }));
    }

    setTrends(results);
    setLastUpdated(new Date());
    setIsGenerating(false);
  };

  const analyzeTrends = async (category) => {
    setIsAnalyzing(true);
    const analysisKey = TREND_CATEGORIES.find(c => c.id === category)?.analysisKey || 'opportunities';
    
    const response = await base44.functions.invoke('analyzeMarketTrends', { category: analysisKey });
    setTrendAnalysis(prev => ({
      ...prev,
      [category]: response.data
    }));
    setIsAnalyzing(false);
  };

  const predictEmergingNiches = async () => {
    setIsPredicting(true);
    try {
      const response = await base44.functions.invoke('analyzeMarketTrends', { category: 'niches' });
      setEmergingNiches(response.data.niches || []);
    } catch (error) {
      console.error('Failed to predict niches:', error);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSetupAlert = (trend) => {
    setSelectedTrendForAlert(trend);
    setAlertModalOpen(true);
  };

  useEffect(() => {
    if (Object.keys(trends).length === 0) {
      generateTrends();
      predictEmergingNiches();
    }
  }, []);

  useEffect(() => {
    if (!trendAnalysis[activeTab] && Object.keys(trends).length > 0) {
      analyzeTrends(activeTab);
    }
  }, [activeTab]);

  const currentTrends = trends[activeTab] || [];
  const isFollowed = (trend) => followedTrends.some(f => f.trend_name === trend.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Market Trends"
          subtitle="AI-powered insights on passive income opportunities"
          gradient="from-emerald-600 to-teal-600"
          action={
            <div className="flex gap-2">
              <Button
                onClick={predictEmergingNiches}
                disabled={isPredicting}
                variant="outline"
                className="gap-2"
              >
                {isPredicting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Predict Niches</span>
              </Button>
              <Button
                onClick={generateTrends}
                disabled={isGenerating}
                variant="outline"
                className="gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh
              </Button>
            </div>
          }
        />

        {/* Followed Trends Summary */}
        {followedTrends.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Following {followedTrends.length} Trends</h3>
                    <p className="text-violet-200 text-sm">You'll receive alerts for significant changes</p>
                  </div>
                  <Bell className="w-8 h-8 text-violet-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Category Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-4 bg-white shadow-sm rounded-xl p-1">
            {TREND_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white rounded-lg"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{cat.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Emerging Niches AI Predictions */}
        {!isPredicting && emergingNiches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <EmergingNiches niches={emergingNiches} />
          </motion.div>
        )}

        {/* Data Visualization */}
        {!isGenerating && currentTrends.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <TrendVisualization trends={currentTrends} category={activeTab} />
          </motion.div>
        )}

        {/* AI Analysis */}
        {!isGenerating && Object.keys(trends).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-10 h-10 text-violet-600 animate-spin mb-2" />
                <p className="text-gray-600 text-sm">Generating detailed insights...</p>
              </div>
            ) : (
              <TrendAnalysisPanel 
                analysis={trendAnalysis[activeTab]} 
                category={activeTab}
              />
            )}
          </motion.div>
        )}

        {/* Trends Grid */}
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Analyzing market trends...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
          </div>
        ) : currentTrends.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No trends available. Click refresh to generate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTrends.map((trend, index) => (
              <TrendCard
                key={index}
                trend={trend}
                index={index}
                isFollowed={isFollowed(trend)}
                onFollow={() => followMutation.mutate(trend)}
                onUnfollow={() => unfollowMutation.mutate(trend)}
                onSetupAlert={() => handleSetupAlert(trend)}
              />
            ))}
          </div>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <p className="text-center text-sm text-gray-400 mt-8">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Alert Setup Modal */}
      <AlertSetupModal
        open={alertModalOpen}
        onClose={() => {
          setAlertModalOpen(false);
          setSelectedTrendForAlert(null);
        }}
        trend={selectedTrendForAlert}
      />
    </div>
  );
}