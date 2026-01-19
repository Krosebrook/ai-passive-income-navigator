import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, TrendingUp, AlertTriangle, Target, CheckCircle, 
  Loader2, Sparkles, ChevronRight, Shield, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function AIInvestmentAdvisor() {
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [activeTab, setActiveTab] = useState('strategy');
  const queryClient = useQueryClient();

  const { data: strategy, isLoading: strategyLoading } = useQuery({
    queryKey: ['investment-strategy'],
    queryFn: async () => {
      const result = await base44.functions.invoke('generateInvestmentStrategy', {});
      return result.data;
    },
    enabled: false
  });

  const { data: riskAnalysis, refetch: refetchRisks } = useQuery({
    queryKey: ['market-risks'],
    queryFn: async () => {
      const result = await base44.functions.invoke('detectMarketRisks', {});
      return result.data;
    },
    refetchInterval: 3600000 // Refresh every hour
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['investment-alerts'],
    queryFn: () => base44.entities.InvestmentAlert.filter({ status: 'active' }, '-generated_at')
  });

  const generateStrategyMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('generateInvestmentStrategy', {});
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-strategy'] });
      toast.success('Investment strategy generated!');
      setIsGeneratingStrategy(false);
    },
    onError: () => {
      toast.error('Failed to generate strategy');
      setIsGeneratingStrategy(false);
    }
  });

  const dismissAlertMutation = useMutation({
    mutationFn: (alertId) => base44.entities.InvestmentAlert.update(alertId, { 
      status: 'dismissed',
      acknowledged_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-alerts'] });
    }
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: (alertId) => base44.entities.InvestmentAlert.update(alertId, { 
      status: 'acknowledged',
      acknowledged_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-alerts'] });
    }
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-400';
      case 'elevated': return 'text-orange-400';
      case 'moderate': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#8b85f7]" />
            AI Investment Advisor
          </h2>
          <p className="text-gray-400 mt-1">
            Personalized strategies and proactive market monitoring
          </p>
        </div>
        <Button
          onClick={refetchRisks}
          variant="outline"
          className="border-[#2d1e50] text-gray-400 hover:text-white"
        >
          <Zap className="w-4 h-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>

      {/* Active Alerts Banner */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-400">
                      Requires your attention
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('alerts')}
                  className="text-red-400 hover:text-red-300"
                >
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-[#1a0f2e]">
          <TabsTrigger value="strategy" className="gap-2">
            <Target className="w-4 h-4" />
            Strategy
          </TabsTrigger>
          <TabsTrigger value="risks" className="gap-2">
            <Shield className="w-4 h-4" />
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2 relative">
            <AlertTriangle className="w-4 h-4" />
            Alerts
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Strategy Tab */}
        <TabsContent value="strategy" className="space-y-4">
          {!strategy?.strategy && !strategyLoading ? (
            <Card className="bg-[#1a0f2e] border-[#2d1e50]">
              <CardContent className="p-12 text-center">
                <Brain className="w-16 h-16 mx-auto text-[#8b85f7] mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Generate Your Investment Strategy
                </h3>
                <p className="text-gray-400 mb-6">
                  Get personalized recommendations based on your goals and market conditions
                </p>
                <Button
                  onClick={() => {
                    setIsGeneratingStrategy(true);
                    generateStrategyMutation.mutate();
                  }}
                  disabled={isGeneratingStrategy}
                  className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] hover:from-[#9a95ff] hover:to-[#00d4ff]"
                >
                  {isGeneratingStrategy ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Strategy
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : strategy?.strategy && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Strategic Direction */}
                <Card className="bg-[#1a0f2e] border-[#2d1e50]">
                  <CardHeader>
                    <CardTitle className="text-white">Strategic Direction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed">
                      {strategy.strategy.strategic_direction}
                    </p>
                  </CardContent>
                </Card>

                {/* Asset Allocation */}
                {strategy.strategy.asset_allocation?.recommended_categories && (
                  <Card className="bg-[#1a0f2e] border-[#2d1e50]">
                    <CardHeader>
                      <CardTitle className="text-white">Recommended Asset Allocation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {strategy.strategy.asset_allocation.recommended_categories.map((cat, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white capitalize">{cat.category}</span>
                            <span className="text-sm font-semibold text-[#8b85f7]">{cat.percentage}%</span>
                          </div>
                          <Progress value={cat.percentage} className="h-2 mb-1" />
                          <p className="text-xs text-gray-400">{cat.rationale}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Short-term Actions */}
                <Card className="bg-[#1a0f2e] border-[#2d1e50]">
                  <CardHeader>
                    <CardTitle className="text-white">Short-Term Actions (3-6 months)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {strategy.strategy.short_term_actions?.map((action, idx) => (
                      <div key={idx} className="bg-[#0f0618] rounded-lg p-3 border border-[#2d1e50]">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-semibold text-white">{action.action}</p>
                          <Badge className={getSeverityColor(action.priority)}>
                            {action.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mb-1">Timeline: {action.timeline}</p>
                        <p className="text-xs text-gray-300">Impact: {action.expected_impact}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Long-term Milestones */}
                <Card className="bg-[#1a0f2e] border-[#2d1e50]">
                  <CardHeader>
                    <CardTitle className="text-white">Long-Term Milestones (1-3 years)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {strategy.strategy.long_term_milestones?.map((milestone, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#8b85f7]/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <Target className="w-4 h-4 text-[#8b85f7]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white mb-1">{milestone.milestone}</p>
                          <p className="text-xs text-gray-400 mb-1">Timeframe: {milestone.timeframe}</p>
                          <p className="text-xs text-gray-300">Success: {milestone.success_criteria}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          )}
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risks" className="space-y-4">
          {riskAnalysis?.analysis && (
            <div className="space-y-4">
              {/* Overall Risk Level */}
              <Card className="bg-[#1a0f2e] border-[#2d1e50]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Overall Portfolio Risk</p>
                      <p className={`text-2xl font-bold capitalize ${getRiskLevelColor(riskAnalysis.analysis.overall_risk_level)}`}>
                        {riskAnalysis.analysis.overall_risk_level}
                      </p>
                    </div>
                    <Shield className={`w-12 h-12 ${getRiskLevelColor(riskAnalysis.analysis.overall_risk_level)}`} />
                  </div>
                </CardContent>
              </Card>

              {/* Market Shifts */}
              {riskAnalysis.analysis.market_shifts?.length > 0 && (
                <Card className="bg-[#1a0f2e] border-[#2d1e50]">
                  <CardHeader>
                    <CardTitle className="text-white">Market Shifts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {riskAnalysis.analysis.market_shifts.map((shift, idx) => (
                      <div key={idx} className="bg-[#0f0618] rounded-lg p-3 border border-[#2d1e50]">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-semibold text-white">{shift.shift}</p>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                            {shift.relevance_score}% relevant
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-300">{shift.impact}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Opportunities */}
              {riskAnalysis.analysis.opportunities?.length > 0 && (
                <Card className="bg-[#1a0f2e] border-[#2d1e50]">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      Emerging Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {riskAnalysis.analysis.opportunities.map((opp, idx) => (
                      <div key={idx} className="bg-green-500/5 rounded-lg p-3 border border-green-500/20">
                        <p className="text-sm font-semibold text-white mb-1">{opp.opportunity}</p>
                        <p className="text-xs text-gray-400 mb-2">Impact: {opp.potential_impact}</p>
                        <p className="text-xs text-green-400">Action: {opp.action_required}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card className="bg-[#1a0f2e] border-[#2d1e50]">
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">All Clear!</h3>
                <p className="text-gray-400">No active alerts at this time</p>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence>
              {alerts.map((alert, idx) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="bg-[#1a0f2e] border-[#2d1e50]">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            alert.severity === 'high' ? 'text-red-400' :
                            alert.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                          }`} />
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white mb-1">{alert.title}</h4>
                            <p className="text-sm text-gray-300 mb-3">{alert.description}</p>
                            
                            {alert.recommended_action && (
                              <div className="bg-[#8b85f7]/10 rounded-lg p-3 border border-[#8b85f7]/30 mb-3">
                                <p className="text-xs font-semibold text-[#8b85f7] mb-1">Recommended Action:</p>
                                <p className="text-xs text-gray-300">{alert.recommended_action}</p>
                              </div>
                            )}

                            {alert.affected_areas?.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {alert.affected_areas.map((area, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {area}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                          className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Acknowledge
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => dismissAlertMutation.mutate(alert.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}