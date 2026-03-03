import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, TrendingDown, Sparkles, RefreshCw, Shield,
  AlertTriangle, CheckCircle2, Target, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const HEALTH_COLORS = {
  excellent: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  good: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
  fair: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  poor: 'text-red-400 border-red-500/40 bg-red-500/10'
};

const SCENARIO_COLORS = { bear: '#ef4444', base: '#8b85f7', bull: '#10b981' };
const SEVERITY_COLORS = { high: 'text-red-400', medium: 'text-yellow-400', low: 'text-blue-400' };
const PRIORITY_COLORS = { high: 'bg-red-500/20 text-red-400', medium: 'bg-yellow-500/20 text-yellow-400', low: 'bg-blue-500/20 text-blue-400' };

export default function FinancialForecastPanel() {
  const [horizon, setHorizon] = useState('12_months');
  const [goalAmount, setGoalAmount] = useState('');
  const [forecast, setForecast] = useState(null);
  const [meta, setMeta] = useState(null);
  const [expandedSection, setExpandedSection] = useState('scenarios');

  const forecastMutation = useMutation({
    mutationFn: async () => {
      const goals = goalAmount ? { target_value: Number(goalAmount) } : {};
      const result = await base44.functions.invoke('forecastPortfolioPerformance', { horizon, goals });
      return result.data;
    },
    onSuccess: (data) => {
      if (data.message === 'no_investments') {
        toast.info('Add investments to your portfolio first to generate a forecast.');
        return;
      }
      setForecast(data.forecast);
      setMeta(data.portfolio_meta);
      toast.success('Forecast generated!');
    },
    onError: () => toast.error('Forecast failed. Please try again.')
  });

  // Build chart data from growth_projection
  const chartData = forecast?.growth_projection
    ? forecast.growth_projection.months.map((m, i) => ({
        month: `Mo ${m}`,
        Bear: forecast.growth_projection.bear?.[i],
        Base: forecast.growth_projection.base?.[i],
        Bull: forecast.growth_projection.bull?.[i]
      }))
    : [];

  const health = forecast?.portfolio_health;
  const healthConfig = health ? HEALTH_COLORS[health.rating] || HEALTH_COLORS.fair : null;

  const toggle = (section) => setExpandedSection(prev => prev === section ? null : section);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="card-dark border-[#2d1e50]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gradient">
            <Sparkles className="w-5 h-5" />
            AI Financial Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-sm text-white mb-2 block">Forecast Horizon</Label>
              <Select value={horizon} onValueChange={setHorizon}>
                <SelectTrigger className="bg-[#0f0618] border-[#2d1e50]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3_months">3 Months</SelectItem>
                  <SelectItem value="6_months">6 Months</SelectItem>
                  <SelectItem value="12_months">12 Months</SelectItem>
                  <SelectItem value="24_months">24 Months</SelectItem>
                  <SelectItem value="5_years">5 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-white mb-2 block">Target Portfolio Value ($)</Label>
              <Input
                type="number"
                value={goalAmount}
                onChange={e => setGoalAmount(e.target.value)}
                placeholder="Optional goal amount"
                className="bg-[#0f0618] border-[#2d1e50]"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => forecastMutation.mutate()}
                disabled={forecastMutation.isPending}
                className="w-full bg-gradient-to-r from-[#8b85f7] to-[#583cf0] gap-2"
              >
                {forecastMutation.isPending
                  ? <><RefreshCw className="w-4 h-4 animate-spin" />Forecasting...</>
                  : <><Sparkles className="w-4 h-4" />Generate Forecast</>
                }
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {forecast && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

          {/* Portfolio Health */}
          {health && (
            <Card className="card-dark border-[#2d1e50]">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className={`text-4xl font-black ${healthConfig?.split(' ')[0]}`}>
                      {health.score}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">Portfolio Health</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${healthConfig}`}>
                          {health.rating}
                        </span>
                      </div>
                      <p className="text-sm text-[#a0aec0] mt-1 max-w-lg">{health.summary}</p>
                    </div>
                  </div>
                  {meta && (
                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-[#64748b]">Invested</p>
                        <p className="font-bold text-white">${meta.total_invested?.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[#64748b]">Current</p>
                        <p className="font-bold text-[#00b7eb]">${meta.current_value?.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-3 mt-4">
                  {health.strengths?.length > 0 && (
                    <div>
                      <p className="text-xs text-emerald-400 font-semibold mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Strengths
                      </p>
                      <ul className="space-y-0.5">
                        {health.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-[#a0aec0]">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {health.weaknesses?.length > 0 && (
                    <div>
                      <p className="text-xs text-yellow-400 font-semibold mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Weaknesses
                      </p>
                      <ul className="space-y-0.5">
                        {health.weaknesses.map((w, i) => (
                          <li key={i} className="text-xs text-[#a0aec0]">• {w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Growth Projection Chart */}
          {chartData.length > 0 && (
            <Card className="card-dark border-[#2d1e50]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#8b85f7]" />
                  Growth Projection — Bear / Base / Bull
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a0f2e', border: '1px solid #2d1e50', borderRadius: 8 }}
                      formatter={v => `$${v?.toLocaleString()}`}
                    />
                    <Legend />
                    {['Bear', 'Base', 'Bull'].map(s => (
                      <Line key={s} type="monotone" dataKey={s} stroke={SCENARIO_COLORS[s.toLowerCase()]}
                        strokeWidth={s === 'Base' ? 2.5 : 1.5} strokeDasharray={s !== 'Base' ? '4 4' : undefined} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                {/* ROI summary pills */}
                <div className="flex gap-3 mt-3 flex-wrap">
                  {['bear', 'base', 'bull'].map(s => (
                    <div key={s} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: SCENARIO_COLORS[s] }} />
                      <span className="text-[#64748b] capitalize">{s}:</span>
                      <span className="font-bold" style={{ color: SCENARIO_COLORS[s] }}>
                        {forecast.growth_projection?.[`${s}_roi`] != null
                          ? `${forecast.growth_projection[`${s}_roi`].toFixed(1)}% ROI`
                          : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Collapsible Sections */}
          {[
            {
              key: 'scenarios',
              title: 'Market Scenarios',
              icon: <Shield className="w-4 h-4 text-[#8b85f7]" />,
              content: (
                <div className="grid md:grid-cols-3 gap-3">
                  {forecast.scenarios?.map((sc, i) => (
                    <div key={i} className="rounded-lg p-3" style={{ background: SCENARIO_COLORS[sc.key] + '15', border: `1px solid ${SCENARIO_COLORS[sc.key]}40` }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-white">{sc.name}</span>
                        <Badge className="text-xs" style={{ background: SCENARIO_COLORS[sc.key] + '30', color: SCENARIO_COLORS[sc.key] }}>
                          {sc.probability}
                        </Badge>
                      </div>
                      <p className="text-xl font-black" style={{ color: SCENARIO_COLORS[sc.key] }}>
                        {sc.projected_roi != null ? `${sc.projected_roi.toFixed(1)}%` : '—'}
                      </p>
                      <p className="text-xs text-[#a0aec0] mt-1">{sc.description}</p>
                      {sc.triggers?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-[#64748b] font-semibold mb-1">Triggers:</p>
                          {sc.triggers.slice(0, 2).map((t, j) => (
                            <p key={j} className="text-xs text-[#a0aec0]">• {t}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            },
            {
              key: 'risks',
              title: 'Risk Factors',
              icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
              content: (
                <div className="space-y-2">
                  {forecast.risk_factors?.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                      <span className={`text-xs font-bold uppercase mt-0.5 w-12 flex-shrink-0 ${SEVERITY_COLORS[r.severity]}`}>
                        {r.severity}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white">{r.factor}</p>
                        <p className="text-xs text-[#a0aec0]">{r.description}</p>
                        {r.mitigation && (
                          <p className="text-xs text-emerald-400 mt-1">↳ {r.mitigation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            },
            {
              key: 'actions',
              title: 'Optimization Actions',
              icon: <Zap className="w-4 h-4 text-[#ff8e42]" />,
              content: (
                <div className="space-y-2">
                  {forecast.optimization_actions?.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 flex-shrink-0 ${PRIORITY_COLORS[a.priority]}`}>
                        {a.priority}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{a.action}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {a.expected_impact && (
                            <span className="text-xs text-emerald-400">📈 {a.expected_impact}</span>
                          )}
                          {a.timeline && (
                            <span className="text-xs text-[#64748b]">🕐 {a.timeline}</span>
                          )}
                          {a.category && (
                            <Badge variant="outline" className="text-xs">{a.category}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            },
            {
              key: 'goals',
              title: 'Goal Alignment',
              icon: <Target className="w-4 h-4 text-[#00b7eb]" />,
              content: forecast.goal_alignment && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {forecast.goal_alignment.on_track
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      : <TrendingDown className="w-5 h-5 text-red-400" />
                    }
                    <span className={`font-semibold ${forecast.goal_alignment.on_track ? 'text-emerald-400' : 'text-red-400'}`}>
                      {forecast.goal_alignment.on_track ? 'On Track' : 'Needs Adjustment'}
                    </span>
                  </div>
                  {forecast.goal_alignment.gap_analysis && (
                    <p className="text-sm text-[#a0aec0]">{forecast.goal_alignment.gap_analysis}</p>
                  )}
                  {forecast.goal_alignment.required_monthly_return != null && (
                    <p className="text-sm text-[#64748b]">
                      Required monthly return: <span className="text-white font-semibold">{forecast.goal_alignment.required_monthly_return}%</span>
                    </p>
                  )}
                  {forecast.goal_alignment.suggestions?.length > 0 && (
                    <ul className="space-y-1">
                      {forecast.goal_alignment.suggestions.map((s, i) => (
                        <li key={i} className="text-xs text-[#a0aec0]">• {s}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            }
          ].map(section => (
            <Card key={section.key} className="card-dark border-[#2d1e50]">
              <button
                className="w-full text-left px-5 py-3 flex items-center justify-between"
                onClick={() => toggle(section.key)}
              >
                <span className="flex items-center gap-2 font-semibold text-white text-sm">
                  {section.icon} {section.title}
                </span>
                {expandedSection === section.key
                  ? <ChevronUp className="w-4 h-4 text-[#64748b]" />
                  : <ChevronDown className="w-4 h-4 text-[#64748b]" />
                }
              </button>
              <AnimatePresence>
                {expandedSection === section.key && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="pt-0 pb-4">{section.content}</CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}

          {/* Market Impact */}
          {forecast.market_impact_summary && (
            <Card className="card-dark border-[#2d1e50]">
              <CardContent className="py-4">
                <p className="text-xs text-[#8b85f7] font-semibold uppercase tracking-wide mb-1">Market Context</p>
                <p className="text-sm text-[#a0aec0]">{forecast.market_impact_summary}</p>
              </CardContent>
            </Card>
          )}

        </motion.div>
      )}
    </div>
  );
}