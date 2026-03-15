import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, Sparkles, RefreshCw,
  Target, AlertTriangle, CheckCircle2, Loader2, Calendar, Zap
} from 'lucide-react';

const ACTION_CONFIG = {
  hold: {
    label: 'HOLD',
    icon: Minus,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    gradient: 'from-blue-600 to-blue-800',
    desc: 'Maintain current position and monitor'
  },
  accelerate: {
    label: 'ACCELERATE',
    icon: TrendingUp,
    color: 'bg-green-500/20 text-green-400 border-green-500/40',
    gradient: 'from-green-600 to-emerald-700',
    desc: 'Push for faster deal closure'
  },
  divest: {
    label: 'DIVEST',
    icon: TrendingDown,
    color: 'bg-red-500/20 text-red-400 border-red-500/40',
    gradient: 'from-red-600 to-red-800',
    desc: 'Exit or reduce exposure'
  }
};

const VELOCITY_COLORS = {
  ahead: 'text-green-400',
  on_track: 'text-blue-400',
  behind: 'text-yellow-400',
  stalled: 'text-red-400'
};

const SCENARIO_COLORS = {
  optimistic: '#10b981',
  base_case: '#8b85f7',
  pessimistic: '#ef4444'
};

export default function ExitForecastPanel({ deal }) {
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);

  const forecast = deal?.exit_forecast;

  const runMutation = useMutation({
    mutationFn: () => base44.functions.invoke('forecastDealExits', { deal_id: deal.id }),
    onMutate: () => setIsRunning(true),
    onSuccess: () => {
      toast.success('Forecast generated!');
      queryClient.invalidateQueries({ queryKey: ['deal-pipeline'] });
      setIsRunning(false);
    },
    onError: (err) => {
      toast.error('Forecast failed: ' + (err.message || 'Unknown'));
      setIsRunning(false);
    }
  });

  if (isRunning) {
    return (
      <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Generating Exit Forecast</h3>
          <p className="text-[#64748b] text-sm mb-3">Analyzing market trends, historical data, and deal velocity...</p>
          <div className="flex items-center justify-center gap-2 text-[#8b85f7] text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Processing...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!forecast) {
    return (
      <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00b7eb] to-[#8b85f7] flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Exit Horizon Forecaster</h3>
          <p className="text-[#64748b] mb-6 max-w-md mx-auto text-sm">
            Get AI-driven ROI scenarios, optimal exit windows, and a hold/accelerate/divest recommendation based on current market trends.
          </p>
          <Button onClick={() => runMutation.mutate()} className="bg-gradient-to-r from-[#00b7eb] to-[#8b85f7]">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Exit Forecast
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { roi_scenarios = [], exit_horizon = {}, recommendation = {}, value_drivers = [], risk_factors = [], milestone_checklist = [] } = forecast;
  const actionConfig = ACTION_CONFIG[recommendation.action] || ACTION_CONFIG.hold;
  const ActionIcon = actionConfig.icon;

  const chartData = roi_scenarios.map(s => ({
    name: s.scenario === 'base_case' ? 'Base Case' : s.scenario.charAt(0).toUpperCase() + s.scenario.slice(1),
    roi: s.projected_roi_pct,
    months: s.exit_timeline_months,
    probability: s.probability_pct,
    fill: SCENARIO_COLORS[s.scenario] || '#8b85f7'
  }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className={`border ${actionConfig.color} text-sm px-3 py-1`}>
            <ActionIcon className="w-3 h-3 mr-1" />
            {actionConfig.label}
          </Badge>
          <span className="text-[#64748b] text-xs">
            {forecast.forecast_confidence}% confidence • {new Date(forecast.generated_at).toLocaleDateString()}
          </span>
        </div>
        <Button size="sm" variant="ghost" onClick={() => runMutation.mutate()} className="text-[#64748b] hover:text-[#8b85f7]">
          <RefreshCw className="w-3 h-3 mr-1" /> Refresh
        </Button>
      </div>

      {/* Recommendation Card */}
      <Card className={`bg-gradient-to-r ${actionConfig.gradient} border-0`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <ActionIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white font-bold text-lg">{actionConfig.label}</p>
                <Badge className="bg-white/20 text-white border-0 text-xs">
                  {recommendation.confidence_level} confidence
                </Badge>
              </div>
              <p className="text-white/80 text-sm">{recommendation.reasoning}</p>
            </div>
          </div>
          {recommendation.action_steps?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-white/70 text-xs font-semibold mb-2">Action Steps:</p>
              {recommendation.action_steps.map((s, i) => (
                <p key={i} className="text-white/80 text-xs">→ {s}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ROI Scenarios Chart */}
      {chartData.length > 0 && (
        <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#8b85f7]" />
              ROI Scenarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #2d1e50', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(val, name) => [
                    name === 'roi' ? `${val}% ROI` : `${val} months`,
                    name === 'roi' ? 'Projected ROI' : 'Timeline'
                  ]}
                />
                <Bar dataKey="roi" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {roi_scenarios.map((s) => (
                <div key={s.scenario} className="text-center p-2 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                  <p className="text-xs text-[#64748b] capitalize">{s.scenario.replace('_', ' ')}</p>
                  <p className="text-sm font-bold" style={{ color: SCENARIO_COLORS[s.scenario] }}>
                    {s.projected_roi_pct}%
                  </p>
                  <p className="text-xs text-[#64748b]">{s.exit_timeline_months}mo • {s.probability_pct}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exit Horizon */}
      {exit_horizon.projected_completion_date && (
        <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[#8b85f7]" />
              <span className="text-white font-semibold text-sm">Exit Horizon</span>
              {exit_horizon.deal_velocity && (
                <Badge className={`text-xs ml-auto ${
                  exit_horizon.deal_velocity === 'ahead' ? 'bg-green-500/20 text-green-400' :
                  exit_horizon.deal_velocity === 'on_track' ? 'bg-blue-500/20 text-blue-400' :
                  exit_horizon.deal_velocity === 'behind' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {exit_horizon.deal_velocity.replace('_', ' ')}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                <p className="text-xs text-[#64748b]">Projected Close</p>
                <p className="text-white font-medium">{exit_horizon.projected_completion_date}</p>
              </div>
              <div className="p-2 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                <p className="text-xs text-[#64748b]">Optimal Window</p>
                <p className="text-white font-medium text-xs">{exit_horizon.optimal_window_start} – {exit_horizon.optimal_window_end}</p>
              </div>
            </div>
            {exit_horizon.velocity_notes && (
              <p className="text-xs text-[#64748b] mt-2">{exit_horizon.velocity_notes}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Value Drivers + Risk Factors */}
      <div className="grid grid-cols-2 gap-3">
        {value_drivers.length > 0 && (
          <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
            <CardContent className="p-3">
              <p className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Value Drivers
              </p>
              <ul className="space-y-1">
                {value_drivers.map((d, i) => (
                  <li key={i} className="text-xs text-[#94a3b8]">• {d}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {risk_factors.length > 0 && (
          <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
            <CardContent className="p-3">
              <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Risk Factors
              </p>
              <ul className="space-y-1">
                {risk_factors.map((r, i) => (
                  <li key={i} className="text-xs text-[#94a3b8]">• {r}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Milestone Checklist */}
      {milestone_checklist.length > 0 && (
        <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
          <CardContent className="p-3">
            <p className="text-xs font-semibold text-[#8b85f7] mb-2 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Milestones to Maximize Outcome
            </p>
            {milestone_checklist.map((m, i) => (
              <div key={i} className="flex items-start gap-2 py-1">
                <span className="w-4 h-4 rounded-full bg-[#8b85f7]/20 text-[#8b85f7] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-xs text-[#94a3b8]">{m}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}