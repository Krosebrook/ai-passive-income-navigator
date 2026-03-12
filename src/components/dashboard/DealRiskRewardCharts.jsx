import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, ZAxis
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

const STATUS_COLORS = {
  pending: '#8b85f7',
  accepted: '#10b981',
  in_progress: '#00b7eb',
  rejected: '#ef4444',
  dismissed: '#64748b',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-[#1a0f2e] border border-[#2d1e50] rounded-lg p-3 text-xs shadow-xl max-w-xs">
      <p className="font-semibold text-white mb-1 truncate">{d?.title}</p>
      <p className="text-[#64748b]">Match Score: <span className="text-white">{d?.match_score}</span></p>
      <p className="text-[#64748b]">Risk: <span className="text-white">{d?.risk_score}/10</span></p>
      <p className="text-[#64748b]">Est. ROI: <span className="text-green-400">{d?.estimated_roi}%</span></p>
      <p className="text-[#64748b]">Industry: <span className="text-white">{d?.industry}</span></p>
    </div>
  );
};

function buildRadarData(deal) {
  return [
    { subject: 'Match', value: deal.match_score ?? 0 },
    { subject: 'ROI Potential', value: Math.min((deal.estimated_roi ?? 0), 100) },
    { subject: 'Low Risk', value: deal.risk_score != null ? (10 - deal.risk_score) * 10 : 50 },
    { subject: 'Confidence', value: deal.prediction_confidence ?? 50 },
    { subject: 'Value', value: deal.estimated_value ? Math.min((deal.estimated_value / 10000), 100) : 30 },
  ];
}

export default function DealRiskRewardCharts() {
  const [selectedDeal, setSelectedDeal] = useState(null);

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['sourced-deals-charts'],
    queryFn: () => base44.entities.SourcedDealOpportunity.list('-created_date', 50),
  });

  const activeDeals = deals.filter(d => d.status !== 'dismissed' && d.status !== 'rejected');

  // Scatter data: risk vs roi, bubble size = match_score
  const scatterData = activeDeals
    .filter(d => d.risk_score != null && d.estimated_roi != null)
    .map(d => ({
      ...d,
      x: d.risk_score,
      y: d.estimated_roi,
      z: d.match_score ?? 50,
    }));

  const radarDeal = selectedDeal ?? activeDeals[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-[#64748b]">
        <Activity className="w-5 h-5 mr-2 animate-pulse" /> Loading deals...
      </div>
    );
  }

  if (activeDeals.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[#64748b] border border-dashed border-[#2d1e50] rounded-xl">
        No active sourced deals yet. Run the Daily Deal Discovery automation to populate data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Risk vs Reward Scatter */}
      <div className="bg-[#1a0f2e] border border-[#2d1e50] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Risk vs. ROI — Deal Landscape</h3>
        <p className="text-xs text-[#64748b] mb-4">Bubble size = match score. Bottom-right = high reward, low risk.</p>
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
            <XAxis
              type="number" dataKey="x" name="Risk Score" domain={[0, 10]}
              label={{ value: 'Risk (1–10)', position: 'insideBottom', offset: -4, fill: '#64748b', fontSize: 11 }}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              type="number" dataKey="y" name="Est. ROI %"
              label={{ value: 'Est. ROI %', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <ZAxis type="number" dataKey="z" range={[40, 300]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#2d1e50' }} />
            <Scatter
              data={scatterData}
              fill="#8b85f7"
              fillOpacity={0.75}
              onClick={(d) => setSelectedDeal(d)}
              cursor="pointer"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Chart for selected deal */}
      {radarDeal && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deal Selector */}
          <div className="bg-[#1a0f2e] border border-[#2d1e50] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Select Deal for Profile</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {activeDeals.slice(0, 20).map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDeal(d)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between gap-2 ${
                    radarDeal.id === d.id
                      ? 'bg-[#8b85f7]/20 border border-[#8b85f7]/50 text-white'
                      : 'hover:bg-[#2d1e50] text-[#94a3b8] border border-transparent'
                  }`}
                >
                  <span className="truncate font-medium">{d.title}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge
                      className="text-[10px] px-1 py-0"
                      style={{ background: `${STATUS_COLORS[d.status]}20`, color: STATUS_COLORS[d.status], border: `1px solid ${STATUS_COLORS[d.status]}50` }}
                    >
                      {d.status}
                    </Badge>
                    <span className="text-[#8b85f7] font-bold">{d.match_score ?? '—'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-[#1a0f2e] border border-[#2d1e50] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1 truncate">{radarDeal.title}</h3>
            <p className="text-xs text-[#64748b] mb-3">{radarDeal.industry} · {radarDeal.status}</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={buildRadarData(radarDeal)} outerRadius="70%">
                <PolarGrid stroke="#2d1e50" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name={radarDeal.title}
                  dataKey="value"
                  stroke="#8b85f7"
                  fill="#8b85f7"
                  fillOpacity={0.35}
                  strokeWidth={2}
                />
                <Tooltip
                  formatter={(v) => [`${v}`, '']}
                  contentStyle={{ background: '#1a0f2e', border: '1px solid #2d1e50', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#fff' }}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-center">
                <p className="text-xs text-[#64748b]">Match</p>
                <p className="text-lg font-bold text-[#8b85f7]">{radarDeal.match_score ?? '—'}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#64748b]">Risk</p>
                <p className="text-lg font-bold text-[#ff8e42]">{radarDeal.risk_score ?? '—'}/10</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#64748b]">Est. ROI</p>
                <p className="text-lg font-bold text-green-400">{radarDeal.estimated_roi != null ? `${radarDeal.estimated_roi}%` : '—'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}