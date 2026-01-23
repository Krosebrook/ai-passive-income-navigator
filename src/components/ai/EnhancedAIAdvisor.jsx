import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  AlertTriangle, TrendingUp, Target, Zap, 
  BarChart3, Brain, CheckCircle2, XCircle,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function EnhancedAIAdvisor() {
  const [activeTab, setActiveTab] = useState('risks');
  const [loading, setLoading] = useState({});
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [whatIfScenario, setWhatIfScenario] = useState(null);
  const [marketTrends, setMarketTrends] = useState(null);
  const [goalTracking, setGoalTracking] = useState(null);

  const [scenarioParams, setScenarioParams] = useState({
    scenario_type: 'new_investment',
    parameters: {}
  });

  // Analyze portfolio risks
  const analyzeRisks = async () => {
    setLoading({ ...loading, risks: true });
    try {
      const { data } = await base44.functions.invoke('detectPortfolioRisks', {});
      setRiskAnalysis(data);
      toast.success('Risk analysis complete');
    } catch (error) {
      toast.error('Failed to analyze risks');
    } finally {
      setLoading({ ...loading, risks: false });
    }
  };

  // Generate what-if scenario
  const generateScenario = async () => {
    setLoading({ ...loading, scenario: true });
    try {
      const { data } = await base44.functions.invoke('generateWhatIfScenario', scenarioParams);
      setWhatIfScenario(data.scenario);
      toast.success('Scenario generated');
    } catch (error) {
      toast.error('Failed to generate scenario');
    } finally {
      setLoading({ ...loading, scenario: false });
    }
  };

  // Analyze market trends
  const analyzeTrends = async () => {
    setLoading({ ...loading, trends: true });
    try {
      const { data } = await base44.functions.invoke('analyzeMarketTrends', {
        industries: ['Technology', 'Healthcare', 'Finance', 'Real Estate'],
        timeframe: '6 months'
      });
      setMarketTrends(data.analysis);
      toast.success('Market analysis complete');
    } catch (error) {
      toast.error('Failed to analyze trends');
    } finally {
      setLoading({ ...loading, trends: false });
    }
  };

  // Track financial goals
  const trackGoals = async () => {
    setLoading({ ...loading, goals: true });
    try {
      const { data } = await base44.functions.invoke('trackFinancialGoals', {});
      setGoalTracking(data);
      toast.success('Goals updated');
    } catch (error) {
      toast.error('Failed to track goals');
    } finally {
      setLoading({ ...loading, goals: false });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="card-dark border-[#8b85f7]/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] bg-clip-text text-transparent">
            <Brain className="w-6 h-6 text-[#8b85f7]" />
            Enhanced AI Investment Advisor
          </CardTitle>
          <p className="text-sm text-gray-400">
            Proactive insights, scenario planning, and goal tracking
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-[#1a0f2e] border border-[#2d1e50]">
          <TabsTrigger value="risks">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger value="scenarios">
            <Zap className="w-4 h-4 mr-2" />
            What-If
          </TabsTrigger>
          <TabsTrigger value="trends">
            <BarChart3 className="w-4 h-4 mr-2" />
            Market Trends
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="w-4 h-4 mr-2" />
            Goals
          </TabsTrigger>
        </TabsList>

        {/* Risk Analysis Tab */}
        <TabsContent value="risks" className="space-y-4">
          <Card className="card-dark">
            <CardContent className="p-6">
              {!riskAnalysis ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Portfolio Risk Analysis
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Identify concentration risks, underperformance, and diversification gaps
                  </p>
                  <Button onClick={analyzeRisks} disabled={loading.risks} className="btn-primary">
                    {loading.risks ? <LoadingSpinner size="sm" /> : 'Analyze Risks'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">Risk Assessment</h3>
                      <p className="text-sm text-gray-400">
                        Health Score: {riskAnalysis.analysis.portfolio_health_score}/100
                      </p>
                    </div>
                    <Badge className={
                      riskAnalysis.analysis.overall_risk_level === 'critical' ? 'bg-red-500' :
                      riskAnalysis.analysis.overall_risk_level === 'high' ? 'bg-orange-500' :
                      riskAnalysis.analysis.overall_risk_level === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                    }>
                      {riskAnalysis.analysis.overall_risk_level.toUpperCase()}
                    </Badge>
                  </div>

                  {riskAnalysis.analysis.identified_risks.map((risk, idx) => (
                    <Card key={idx} className="bg-[#0f0618] border-[#2d1e50]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white">{risk.risk_type.replace('_', ' ')}</h4>
                          <Badge className={
                            risk.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
                            risk.severity === 'high' ? 'bg-orange-500/20 text-orange-500' :
                            risk.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'
                          }>
                            {risk.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">{risk.description}</p>
                        <div className="p-3 rounded-lg bg-[#1a0f2e] border border-[#2d1e50]">
                          <p className="text-sm text-[#00b7eb] font-medium mb-2">Recommendation:</p>
                          <p className="text-sm text-gray-300">{risk.recommendation}</p>
                        </div>
                        {risk.action_items && risk.action_items.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-400 mb-2">Action Items:</p>
                            <ul className="space-y-1">
                              {risk.action_items.map((item, i) => (
                                <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                  <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  <Button onClick={analyzeRisks} variant="outline" className="w-full">
                    Refresh Analysis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* What-If Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <Card className="card-dark">
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Generate What-If Scenario</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="e.g., What if I invest $10,000 in real estate?"
                    onChange={(e) => setScenarioParams({
                      ...scenarioParams,
                      scenario_type: 'new_investment',
                      parameters: { description: e.target.value }
                    })}
                  />
                  <Button onClick={generateScenario} disabled={loading.scenario} className="w-full btn-primary">
                    {loading.scenario ? <LoadingSpinner size="sm" /> : 'Generate Scenario'}
                  </Button>
                </div>
              </div>

              {whatIfScenario && (
                <div className="space-y-4 pt-4 border-t border-[#2d1e50]">
                  <h4 className="font-semibold text-white">{whatIfScenario.scenario_name}</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-[#0f0618] border-[#2d1e50]">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-400 mb-2">Current Value</p>
                        <p className="text-2xl font-bold text-white">
                          ${whatIfScenario.current_state.total_value.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#0f0618] border-[#2d1e50]">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-400 mb-2">Projected Value</p>
                        <p className="text-2xl font-bold text-white flex items-center gap-2">
                          ${whatIfScenario.projected_state.total_value.toLocaleString()}
                          {whatIfScenario.projected_state.value_change_percentage > 0 ? (
                            <ArrowUpRight className="w-5 h-5 text-green-500" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-red-500" />
                          )}
                        </p>
                        <p className={`text-sm ${whatIfScenario.projected_state.value_change_percentage > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {whatIfScenario.projected_state.value_change_percentage > 0 ? '+' : ''}
                          {whatIfScenario.projected_state.value_change_percentage.toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-[#0f0618] border-[#2d1e50]">
                    <CardContent className="p-4">
                      <h5 className="font-semibold text-white mb-3">Recommendation</h5>
                      <Badge className={
                        whatIfScenario.recommendation.action === 'proceed' ? 'bg-green-500/20 text-green-500' :
                        whatIfScenario.recommendation.action === 'modify' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'
                      }>
                        {whatIfScenario.recommendation.action.toUpperCase()}
                      </Badge>
                      <p className="text-sm text-gray-300 mt-2">{whatIfScenario.recommendation.reasoning}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card className="card-dark">
            <CardContent className="p-6">
              {!marketTrends ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Market Trend Analysis
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Get AI-driven insights on market movements and opportunities
                  </p>
                  <Button onClick={analyzeTrends} disabled={loading.trends} className="btn-primary">
                    {loading.trends ? <LoadingSpinner size="sm" /> : 'Analyze Market'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                    <h3 className="font-semibold text-white mb-2">Market Overview</h3>
                    <Badge className={
                      marketTrends.market_overview.overall_sentiment === 'bullish' ? 'bg-green-500' :
                      marketTrends.market_overview.overall_sentiment === 'bearish' ? 'bg-red-500' : 'bg-gray-500'
                    }>
                      {marketTrends.market_overview.overall_sentiment.toUpperCase()}
                    </Badge>
                    <p className="text-sm text-gray-300 mt-2">{marketTrends.market_overview.summary}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3">Actionable Insights</h4>
                    <div className="space-y-2">
                      {marketTrends.actionable_insights.map((insight, idx) => (
                        <Card key={idx} className="bg-[#0f0618] border-[#2d1e50]">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm text-white font-medium">{insight.insight}</p>
                              <Badge className={
                                insight.priority === 'high' ? 'bg-red-500/20 text-red-500' :
                                insight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'
                              }>
                                {insight.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-[#00b7eb]">{insight.action}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <Card className="card-dark">
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Financial Goal Tracking
                </h3>
                <p className="text-gray-400 mb-6">
                  Set goals and get AI-powered progress tracking and recommendations
                </p>
                <Button onClick={trackGoals} disabled={loading.goals} className="btn-primary">
                  {loading.goals ? <LoadingSpinner size="sm" /> : 'Track Goals'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}