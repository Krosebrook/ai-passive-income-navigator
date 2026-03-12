/**
 * PortfolioAnalysis
 * ─────────────────
 * Aggregates all saved (accepted/in_progress) + watched deals to provide:
 *   1. Top-level KPI bar (total projected ROI, avg risk, est. value, deal count)
 *   2. Industry concentration — bar chart + pie
 *   3. Risk vs ROI scatter with quadrant labels
 *   4. AI-generated diversification strategy suggestions
 */

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ScatterChart, Scatter, ZAxis, ReferenceLine, Label,
} from 'recharts';
import { TrendingUp, AlertTriangle, DollarSign, Layers, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

// ── Colour palette ────────────────────────────────────────────
const INDUSTRY_COLORS = [
  '#8b85f7','#00b7eb','#ff8e42','#10b981','#f59e0b',
  '#ef4444','#a78bfa','#34d399','#60a5fa','#fb7185',
];

const QUADRANT_LABELS = [
  { x: 2,  y: 75, label: '★ Stars',        color: '#10b981', sub: 'Low risk, high ROI' },
  { x: 7.5,y: 75, label: '⚡ High Reward',  color: '#f59e0b', sub: 'High risk, high ROI' },
  { x: 2,  y: 15, label: '◆ Safe Bets',    color: '#00b7eb', sub: 'Low risk, low ROI' },
  { x: 7.5,y: 15, label: '✕ Avoid',        color: '#ef4444', sub: 'High risk, low ROI' },
];

// ── Helpers ───────────────────────────────────────────────────
function weightedAvg(deals, key) {
  const valid = deals.filter(d => d[key] != null);
  if (!valid.length) return null;
  return valid.reduce((s, d) => s + d[key], 0) / valid.length;
}

function totalEstimatedValue(deals) {
  return deals.reduce((s, d) => s + (d.estimated_value ?? 0), 0);
}

function buildIndustryConcentration(deals) {
  const map = {};
  for (const d of deals) {
    const ind = d.industry || 'Unknown';
    if (!map[ind]) map[ind] = { name: ind, count: 0, totalROI: 0, totalValue: 0 };
    map[ind].count++;
    map[ind].totalROI  += d.estimated_roi   ?? 0;
    map[ind].totalValue += d.estimated_value ?? 0;
  }
  return Object.values(map)
    .map(e => ({ ...e, avgROI: e.count ? e.totalROI / e.count : 0 }))
    .sort((a, b) => b.count - a.count);
}

// Herfindahl–Hirschman Index — concentration measure (0=diverse, 1=mono)
function hhiScore(concentration, total) {
  return concentration.reduce((s, e) => s + (e.count / total) ** 2, 0);
}

function riskLabel(score) {
  if (score == null) return { label: 'Unknown', color: '#64748b' };
  if (score <= 3)   return { label: 'Low',    color: '#10b981' };
  if (score <= 6)   return { label: 'Medium', color: '#f59e0b' };
  return               { label: 'High',   color: '#ef4444' };
}

// ── Sub-components ────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, sub, color, border }) {
  return (
    <div className={`bg-[#1a0f2e] border rounded-xl p-4 flex items-center gap-4 ${border ?? 'border-[#2d1e50]'}`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
           style={{ background: `${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xl font-bold text-white">{value ?? '—'}</p>
        <p className="text-xs text-[#64748b]">{label}</p>
        {sub && <p className="text-[11px] mt-0.5" style={{ color }}>{sub}</p>}
      </div>
    </div>
  );
}

const CustomScatterTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-[#1a0f2e] border border-[#2d1e50] rounded-lg p-3 text-xs max-w-[180px]">
      <p className="font-semibold text-white mb-1 truncate">{d?.title}</p>
      <p className="text-[#64748b]">Industry: <span className="text-white">{d?.industry}</span></p>
      <p className="text-[#64748b]">ROI: <span className="text-[#10b981]">{d?.y}%</span></p>
      <p className="text-[#64748b]">Risk: <span className="text-[#ff8e42]">{d?.x}/10</span></p>
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a0f2e] border border-[#2d1e50] rounded-lg p-2 text-xs">
      <p className="text-white font-semibold">{payload[0].name}</p>
      <p className="text-[#64748b]">{payload[0].value} deals ({(payload[0].payload.percent * 100).toFixed(0)}%)</p>
    </div>
  );
};

// ── Diversification Strategy Card ─────────────────────────────
function DiversificationStrategy({ hhi, concentration, avgRisk, avgROI }) {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);

  const topIndustry = concentration[0];
  const topShare = concentration.length
    ? ((topIndustry?.count / concentration.reduce((s, e) => s + e.count, 0)) * 100).toFixed(0)
    : 0;

  // Rule-based suggestions (instant, no API)
  const staticSuggestions = useMemo(() => {
    const tips = [];
    if (hhi > 0.4)
      tips.push({ type: 'warning', text: `Heavy concentration in ${topIndustry?.name ?? 'one sector'} (${topShare}% of portfolio). Add deals from 2–3 other industries to reduce correlated risk.` });
    if (avgRisk > 6)
      tips.push({ type: 'danger', text: `Average risk score is high (${avgRisk?.toFixed(1)}/10). Balance with 2–3 lower-risk deals (risk ≤4) to stabilize the portfolio.` });
    if (avgROI < 15 && avgRisk < 5)
      tips.push({ type: 'info', text: `Portfolio is conservative (${avgROI?.toFixed(0)}% avg ROI, low risk). If your goal is growth, consider adding 1–2 moderate-risk, higher-ROI opportunities.` });
    if (concentration.length < 3)
      tips.push({ type: 'warning', text: `Only ${concentration.length} industr${concentration.length === 1 ? 'y' : 'ies'} represented. A healthy portfolio spans at least 4–5 sectors.` });
    if (!tips.length)
      tips.push({ type: 'positive', text: `Portfolio looks well-diversified across ${concentration.length} industries with balanced risk (${avgRisk?.toFixed(1)}/10) and ROI (${avgROI?.toFixed(0)}%).` });
    return tips;
  }, [hhi, topIndustry, topShare, avgRisk, avgROI, concentration.length]);

  const getAIAdvice = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a portfolio diversification advisor. Analyze this investment portfolio:
- Industries: ${concentration.map(e => `${e.name} (${e.count} deals, avg ROI ${e.avgROI.toFixed(0)}%)`).join(', ')}
- Average risk score: ${avgRisk?.toFixed(1)}/10
- Average ROI: ${avgROI?.toFixed(0)}%
- HHI concentration score: ${hhi.toFixed(3)} (0=diverse, 1=concentrated)

Provide 3 specific, actionable diversification strategies as a JSON array:
{"strategies": [{"title": "...", "detail": "...", "priority": "high|medium|low"}]}`,
        response_json_schema: {
          type: 'object',
          properties: {
            strategies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  detail: { type: 'string' },
                  priority: { type: 'string' },
                },
              },
            },
          },
        },
      });
      setAdvice(res.strategies ?? []);
    } catch {
      setAdvice([]);
    }
    setLoading(false);
  };

  const priorityColor = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

  return (
    <div className="bg-[#1a0f2e] border border-[#2d1e50] rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#8b85f7]" />
          <h3 className="font-semibold text-white">Diversification Analysis</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 border-[#8b85f7]/40 text-[#8b85f7] hover:bg-[#8b85f7]/10 text-xs"
          onClick={getAIAdvice}
          disabled={loading}
        >
          {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          AI Strategies
        </Button>
      </div>

      {/* HHI meter */}
      <div>
        <div className="flex justify-between text-xs text-[#64748b] mb-1">
          <span>Concentration (HHI)</span>
          <span className={hhi > 0.4 ? 'text-red-400' : hhi > 0.25 ? 'text-yellow-400' : 'text-green-400'}>
            {hhi > 0.4 ? 'Concentrated' : hhi > 0.25 ? 'Moderate' : 'Well-diversified'}
          </span>
        </div>
        <div className="h-2 bg-[#0f0618] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(hhi * 100, 100)}%`,
              background: hhi > 0.4 ? '#ef4444' : hhi > 0.25 ? '#f59e0b' : '#10b981',
            }}
          />
        </div>
      </div>

      {/* Rule-based tips */}
      <div className="space-y-2">
        {staticSuggestions.map((tip, i) => (
          <div key={i} className={`flex gap-2 text-xs rounded-lg p-2.5 border ${
            tip.type === 'danger'   ? 'bg-red-500/10 border-red-500/20 text-red-300' :
            tip.type === 'warning'  ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300' :
            tip.type === 'positive' ? 'bg-green-500/10 border-green-500/20 text-green-300' :
                                      'bg-[#8b85f7]/10 border-[#8b85f7]/20 text-[#c4b5fd]'
          }`}>
            <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
            {tip.text}
          </div>
        ))}
      </div>

      {/* AI strategies */}
      {advice?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 pt-2 border-t border-[#2d1e50]">
          <p className="text-xs text-[#64748b] flex items-center gap-1"><Sparkles className="w-3 h-3 text-[#8b85f7]" /> AI-generated strategies</p>
          {advice.map((s, i) => (
            <div key={i} className="bg-[#0f0618] border border-[#2d1e50] rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-white">{s.title}</p>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: `${priorityColor[s.priority]}20`, color: priorityColor[s.priority] }}>
                  {s.priority}
                </span>
              </div>
              <p className="text-xs text-[#94a3b8]">{s.detail}</p>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function PortfolioAnalysis() {
  const { data: savedDeals = [], isLoading: savedLoading } = useQuery({
    queryKey: ['portfolio-analysis-saved'],
    queryFn: () => base44.entities.SourcedDealOpportunity.filter({ status: 'accepted' }),
  });

  const { data: inProgressDeals = [], isLoading: ipLoading } = useQuery({
    queryKey: ['portfolio-analysis-inprogress'],
    queryFn: () => base44.entities.SourcedDealOpportunity.filter({ status: 'in_progress' }),
  });

  const { data: watchedDeals = [], isLoading: watchedLoading } = useQuery({
    queryKey: ['portfolio-analysis-watched'],
    queryFn: () => base44.entities.SourcedDealOpportunity.filter({ is_watched: true }),
  });

  const isLoading = savedLoading || ipLoading || watchedLoading;

  // Merge & deduplicate by id
  const allDeals = useMemo(() => {
    const map = new Map();
    [...savedDeals, ...inProgressDeals, ...watchedDeals].forEach(d => map.set(d.id, d));
    return Array.from(map.values());
  }, [savedDeals, inProgressDeals, watchedDeals]);

  const concentration = useMemo(() => buildIndustryConcentration(allDeals), [allDeals]);
  const avgROI  = useMemo(() => weightedAvg(allDeals, 'estimated_roi'),  [allDeals]);
  const avgRisk = useMemo(() => weightedAvg(allDeals, 'risk_score'),     [allDeals]);
  const totalValue = useMemo(() => totalEstimatedValue(allDeals), [allDeals]);
  const hhi = useMemo(() => allDeals.length ? hhiScore(concentration, allDeals.length) : 0, [concentration, allDeals.length]);

  const scatterData = useMemo(() =>
    allDeals
      .filter(d => d.risk_score != null && d.estimated_roi != null)
      .map(d => ({ x: d.risk_score, y: d.estimated_roi, z: d.estimated_value ?? 50000, title: d.title, industry: d.industry })),
    [allDeals]
  );

  const pieData = useMemo(() =>
    concentration.map((e, i) => ({
      name: e.name, value: e.count,
      percent: allDeals.length ? e.count / allDeals.length : 0,
      color: INDUSTRY_COLORS[i % INDUSTRY_COLORS.length],
    })),
    [concentration, allDeals.length]
  );

  const risk = riskLabel(avgRisk);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-[#64748b] gap-2">
        <RefreshCw className="w-4 h-4 animate-spin" /> Building portfolio analysis...
      </div>
    );
  }

  if (allDeals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-3 border border-dashed border-[#2d1e50] rounded-xl">
        <Layers className="w-10 h-10 text-[#2d1e50]" />
        <p className="text-[#64748b] text-sm">No saved or watched deals yet.</p>
        <p className="text-[#64748b] text-xs">Accept deals in Deal Discovery or watch them from your pipeline to see portfolio analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── KPI Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Layers}
          label="Deals Tracked"
          value={allDeals.length}
          sub={`${savedDeals.length} accepted · ${watchedDeals.length} watched`}
          color="#8b85f7"
        />
        <KPICard
          icon={TrendingUp}
          label="Avg Projected ROI"
          value={avgROI != null ? `${avgROI.toFixed(1)}%` : '—'}
          sub="across all tracked deals"
          color="#10b981"
          border="border-green-500/30"
        />
        <KPICard
          icon={AlertTriangle}
          label="Avg Risk Score"
          value={avgRisk != null ? `${avgRisk.toFixed(1)}/10` : '—'}
          sub={risk.label}
          color={risk.color}
          border={`border-[${risk.color}]/30`}
        />
        <KPICard
          icon={DollarSign}
          label="Est. Total Value"
          value={totalValue > 0 ? `$${(totalValue / 1_000_000).toFixed(1)}M` : '—'}
          sub="sum of estimated deal values"
          color="#ff8e42"
          border="border-[#ff8e42]/30"
        />
      </div>

      {/* ── Industry Concentration ───────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-[#1a0f2e] border border-[#2d1e50] rounded-xl p-5">
          <h3 className="font-semibold text-white text-sm mb-4">Industry Concentration</h3>
          {concentration.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={concentration} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={90} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a0f2e', border: '1px solid #2d1e50', borderRadius: 8 }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#8b85f7' }}
                  formatter={(v, n, p) => [`${v} deal${v > 1 ? 's' : ''} · avg ROI ${p.payload.avgROI.toFixed(0)}%`, 'Count']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {concentration.map((_, i) => (
                    <Cell key={i} fill={INDUSTRY_COLORS[i % INDUSTRY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-[#64748b] text-sm text-center py-8">No data</p>
          )}
        </div>

        {/* Pie + legend */}
        <div className="bg-[#1a0f2e] border border-[#2d1e50] rounded-xl p-5">
          <h3 className="font-semibold text-white text-sm mb-4">Portfolio Share by Industry</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5 overflow-auto max-h-44">
              {pieData.map((e, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: e.color }} />
                    <span className="text-[#94a3b8] truncate">{e.name}</span>
                  </div>
                  <span className="text-white font-medium flex-shrink-0">{(e.percent * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Risk vs ROI Scatter ──────────────────────────── */}
      {scatterData.length > 0 && (
        <div className="bg-[#1a0f2e] border border-[#2d1e50] rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-white text-sm">Risk vs. ROI Landscape</h3>
            <span className="text-xs text-[#64748b]">Bubble size = estimated value</span>
          </div>
          <p className="text-xs text-[#64748b] mb-4">Each dot is a tracked deal. Ideal zone: low risk (left), high ROI (top).</p>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
              <XAxis type="number" dataKey="x" domain={[0, 10]} name="Risk" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false}>
                <Label value="Risk Score →" position="insideBottom" offset={-10} fill="#64748b" fontSize={11} />
              </XAxis>
              <YAxis type="number" dataKey="y" name="ROI %" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false}>
                <Label value="ROI % →" angle={-90} position="insideLeft" offset={10} fill="#64748b" fontSize={11} />
              </YAxis>
              <ZAxis type="number" dataKey="z" range={[40, 400]} />
              <Tooltip content={<CustomScatterTooltip />} />
              {/* Quadrant dividers */}
              <ReferenceLine x={5} stroke="#2d1e50" strokeDasharray="4 4" />
              <ReferenceLine y={30} stroke="#2d1e50" strokeDasharray="4 4" />
              <Scatter data={scatterData} fill="#8b85f7" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
          {/* Quadrant legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            {QUADRANT_LABELS.map((q, i) => (
              <div key={i} className="text-center">
                <p className="text-xs font-semibold" style={{ color: q.color }}>{q.label}</p>
                <p className="text-[10px] text-[#64748b]">{q.sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Diversification Strategies ───────────────────── */}
      <DiversificationStrategy
        hhi={hhi}
        concentration={concentration}
        avgRisk={avgRisk}
        avgROI={avgROI}
      />
    </div>
  );
}