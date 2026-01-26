import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Sparkles, AlertCircle, Clock, BarChart3, Target, Zap, Bell, BellOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function EmergingOpportunitiesPanel() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const queryClient = useQueryClient();

  // Fetch followed trends
  const { data: followedTrends = [], isLoading } = useQuery({
    queryKey: ['followed-trends'],
    queryFn: async () => {
      const trends = await base44.entities.FollowedTrend.filter({ is_active: true });
      return trends.sort((a, b) => (b.confidence_score || 0) - (a.confidence_score || 0));
    }
  });

  // Detect emerging trends
  const detectTrendsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('detectEmergingTrends', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followed-trends'] });
    }
  });

  // Create automated alerts
  const createAlertsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('createAutomatedTrendAlerts', {});
      return response.data;
    },
    onSuccess: (data) => {
      alert(`Created ${data.alerts_created} automated alerts for emerging opportunities!`);
      queryClient.invalidateQueries({ queryKey: ['followed-trends'] });
    }
  });

  const handleDetectTrends = async () => {
    setIsAnalyzing(true);
    try {
      await detectTrendsMutation.mutateAsync();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMaturityColor = (maturity) => {
    if (maturity < 3) return 'text-green-500';
    if (maturity < 6) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 80) return 'bg-green-500/20 text-green-400 border-green-500/50';
    if (confidence > 60) return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#8b85f7]" />
            Emerging Opportunities
          </h2>
          <p className="text-sm text-[#64748b] mt-1">
            AI-detected nascent trends before they become mainstream
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => createAlertsMutation.mutate()}
            variant="outline"
            disabled={createAlertsMutation.isPending}
            className="gap-2"
          >
            <Bell className="w-4 h-4" />
            {createAlertsMutation.isPending ? 'Creating...' : 'Auto-Alert'}
          </Button>
          <Button
            onClick={handleDetectTrends}
            disabled={isAnalyzing}
            className="gap-2 bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
          >
            <TrendingUp className="w-4 h-4" />
            {isAnalyzing ? 'Analyzing...' : 'Detect Trends'}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="spinner mx-auto mb-4" />
          <p className="text-[#64748b]">Loading opportunities...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && followedTrends.length === 0 && (
        <Card className="border-[#2d1e50] bg-[#1a0f2e]">
          <CardContent className="py-12 text-center">
            <Sparkles className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Emerging Trends Yet</h3>
            <p className="text-[#64748b] mb-6">
              Click "Detect Trends" to discover nascent market opportunities
            </p>
            <Button onClick={handleDetectTrends} disabled={isAnalyzing}>
              Start Discovery
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Trends Grid */}
      {!isLoading && followedTrends.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {followedTrends.map((trend, index) => (
            <motion.div
              key={trend.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-[#2d1e50] bg-[#1a0f2e] hover:border-[#8b85f7]/30 transition-all cursor-pointer group"
                onClick={() => setSelectedTrend(trend)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {trend.trend_name}
                        {trend.current_status === 'emerging' && (
                          <Badge className="bg-green-500/20 text-green-400 text-xs">
                            Nascent
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-xs text-[#64748b] mt-1 line-clamp-2">
                        {trend.trend_description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-xs text-[#64748b] mb-1">
                        <Target className="w-3 h-3" />
                        Confidence
                      </div>
                      <div className="text-lg font-bold">
                        {trend.confidence_score || 0}%
                      </div>
                      <Badge className={`text-xs mt-1 ${getConfidenceColor(trend.confidence_score || 0)}`}>
                        {trend.confidence_score > 80 ? 'High' : trend.confidence_score > 60 ? 'Medium' : 'Low'}
                      </Badge>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-xs text-[#64748b] mb-1">
                        <BarChart3 className="w-3 h-3" />
                        Maturity
                      </div>
                      <div className={`text-lg font-bold ${getMaturityColor(trend.maturity || 0)}`}>
                        {trend.maturity || 0}/10
                      </div>
                      <div className="text-xs text-[#64748b] mt-1">
                        {trend.maturity < 3 ? 'Very Early' : trend.maturity < 6 ? 'Early' : 'Emerging'}
                      </div>
                    </div>
                  </div>

                  {/* Indicators */}
                  {trend.key_indicators && trend.key_indicators.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-[#64748b]">
                        <Zap className="w-3 h-3" />
                        Key Signals
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {trend.key_indicators.slice(0, 3).map((indicator, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {indicator}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Data Sources */}
                  {trend.data_sources && (
                    <div className="flex items-center gap-2 text-xs text-[#64748b]">
                      <AlertCircle className="w-3 h-3" />
                      Sources: {trend.data_sources.join(', ')}
                    </div>
                  )}

                  {/* Action Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-[#8b85f7]/10 group-hover:border-[#8b85f7]"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to deals or forecast
                    }}
                  >
                    Explore Opportunities
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}