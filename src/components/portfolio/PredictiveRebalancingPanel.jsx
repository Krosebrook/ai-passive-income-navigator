import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Calendar, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function PredictiveRebalancingPanel() {
  const [isForecasting, setIsForecasting] = useState(false);
  const queryClient = useQueryClient();

  const { data: forecast, isLoading } = useQuery({
    queryKey: ['portfolio-forecast'],
    queryFn: async () => {
      const response = await base44.functions.invoke('forecastPortfolioPerformance', {
        timeframe: '12_months'
      });
      return response.data.forecast;
    }
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['rebalancing-alerts'],
    queryFn: async () => {
      const data = await base44.entities.InvestmentAlert.filter({ 
        alert_type: 'rebalancing_needed',
        status: 'active'
      });
      return data;
    }
  });

  const generateRebalancingMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generatePredictiveRebalancing', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rebalancing-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-forecast'] });
      toast.success('Predictive rebalancing plan generated');
    }
  });

  const dismissAlertMutation = useMutation({
    mutationFn: async (alertId) => {
      await base44.entities.InvestmentAlert.update(alertId, { status: 'dismissed' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rebalancing-alerts'] });
      toast.success('Alert dismissed');
    }
  });

  const handleGenerateRebalancing = async () => {
    setIsForecasting(true);
    try {
      await generateRebalancingMutation.mutateAsync();
    } finally {
      setIsForecasting(false);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'bg-red-500/20 text-red-400 border-red-500/50';
    if (priority === 'medium') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
  };

  const getActionIcon = (action) => {
    if (action === 'increase') return <TrendingUp className="w-4 h-4" />;
    if (action === 'reduce') return <TrendingDown className="w-4 h-4" />;
    return <Target className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#8b85f7]" />
            Predictive Rebalancing
          </h2>
          <p className="text-sm text-[#64748b] mt-1">
            AI-forecasted performance and proactive optimization
          </p>
        </div>
        <Button
          onClick={handleGenerateRebalancing}
          disabled={isForecasting}
          className="gap-2 bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
        >
          <Zap className="w-4 h-4" />
          {isForecasting ? 'Forecasting...' : 'Generate Forecast'}
        </Button>
      </div>

      {/* Portfolio Forecast */}
      {forecast?.portfolio_forecast && (
        <Card className="border-[#2d1e50] bg-[#1a0f2e]">
          <CardHeader>
            <CardTitle className="text-base">12-Month Portfolio Forecast</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-xs text-green-400 mb-1">Best Case</p>
                <p className="text-2xl font-bold text-green-400">
                  ${forecast.portfolio_forecast.best_case_value?.toLocaleString() || 0}
                </p>
              </div>
              
              <div className="bg-[#8b85f7]/10 border border-[#8b85f7]/30 rounded-lg p-4">
                <p className="text-xs text-[#8b85f7] mb-1">Likely Case</p>
                <p className="text-2xl font-bold text-[#8b85f7]">
                  ${forecast.portfolio_forecast.likely_value?.toLocaleString() || 0}
                </p>
              </div>
              
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-xs text-red-400 mb-1">Worst Case</p>
                <p className="text-2xl font-bold text-red-400">
                  ${forecast.portfolio_forecast.worst_case_value?.toLocaleString() || 0}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#64748b]">Forecast Confidence</span>
              <span className="font-bold">{forecast.portfolio_forecast.confidence || 0}%</span>
            </div>
            <Progress value={forecast.portfolio_forecast.confidence || 0} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#8b85f7] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Active Rebalancing Alerts ({alerts.length})
          </h3>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-red-500/30 bg-red-500/5">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <h4 className="font-semibold text-sm">{alert.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#a0aec0] mb-2">{alert.description}</p>
                      <p className="text-xs text-[#8b85f7]">
                        <strong>Action:</strong> {alert.recommended_action}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissAlertMutation.mutate(alert.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Rebalancing Recommendations */}
      {forecast?.rebalancing_recommendations && forecast.rebalancing_recommendations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#8b85f7]">
            Recommended Actions ({forecast.rebalancing_recommendations.length})
          </h3>
          <div className="space-y-3">
            {forecast.rebalancing_recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-[#2d1e50] bg-[#1a0f2e]">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getActionIcon(rec.action)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-sm capitalize">
                            {rec.action} {rec.target}
                          </h4>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority} priority
                          </Badge>
                        </div>
                        <p className="text-xs text-[#a0aec0] mb-2">{rec.rationale}</p>
                        <div className="flex items-center gap-4 text-xs text-[#64748b]">
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {Math.abs(rec.percentage_change)}% change
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {rec.optimal_timing}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Investment Forecasts */}
      {forecast?.individual_forecasts && forecast.individual_forecasts.length > 0 && (
        <Card className="border-[#2d1e50] bg-[#1a0f2e]">
          <CardHeader>
            <CardTitle className="text-base">Investment-by-Investment Forecast</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {forecast.individual_forecasts.map((invForecast, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-semibold">{invForecast.investment_name}</p>
                  <p className="text-xs text-[#64748b]">
                    {invForecast.key_factors?.[0] || 'Analyzing...'}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    invForecast.predicted_value_change_percent >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {invForecast.predicted_value_change_percent >= 0 ? '+' : ''}
                    {invForecast.predicted_value_change_percent?.toFixed(1) || 0}%
                  </p>
                  <p className="text-xs text-[#64748b]">
                    {invForecast.confidence}% confidence
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Risk Events */}
      {forecast?.risk_events && forecast.risk_events.length > 0 && (
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Risk Events to Monitor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {forecast.risk_events.map((event, index) => (
                <li key={index} className="text-sm text-[#a0aec0] flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">•</span>
                  {event}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}