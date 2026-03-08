import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Activity, ArrowRight } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { toast } from 'sonner';
import WatchButton from '@/components/deals/WatchButton';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CHANGE_THRESHOLD = 15; // % point change considered "significant"

function detectAlerts(deal) {
  const snap = deal.watch_snapshot;
  if (!snap) return [];
  const alerts = [];

  if (deal.risk_score != null && snap.risk_score != null) {
    const delta = deal.risk_score - snap.risk_score;
    if (Math.abs(delta) >= 1.5) {
      alerts.push({
        type: delta > 0 ? 'danger' : 'positive',
        label: `Risk ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta).toFixed(1)} pts`,
      });
    }
  }

  if (deal.estimated_roi != null && snap.estimated_roi != null) {
    const delta = deal.estimated_roi - snap.estimated_roi;
    if (Math.abs(delta) >= CHANGE_THRESHOLD) {
      alerts.push({
        type: delta > 0 ? 'positive' : 'danger',
        label: `ROI ${delta > 0 ? 'up' : 'down'} ${Math.abs(delta).toFixed(0)}%`,
      });
    }
  }

  if (deal.match_score != null && snap.match_score != null) {
    const delta = deal.match_score - snap.match_score;
    if (Math.abs(delta) >= CHANGE_THRESHOLD) {
      alerts.push({
        type: delta > 0 ? 'positive' : 'warning',
        label: `Match score ${delta > 0 ? '+' : ''}${delta.toFixed(0)} pts`,
      });
    }
  }

  if (deal.status !== snap.status) {
    alerts.push({
      type: 'info',
      label: `Status changed: ${snap.status} → ${deal.status}`,
    });
  }

  return alerts;
}

const ALERT_STYLES = {
  danger:   'bg-red-500/10 text-red-400 border-red-500/30',
  positive: 'bg-green-500/10 text-green-400 border-green-500/30',
  warning:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  info:     'bg-[#8b85f7]/10 text-[#8b85f7] border-[#8b85f7]/30',
};

const STATUS_COLORS = {
  pending:     '#8b85f7',
  accepted:    '#10b981',
  in_progress: '#00b7eb',
  rejected:    '#ef4444',
  dismissed:   '#64748b',
};

function buildRadar(deal) {
  return [
    { subject: 'Match',      value: deal.match_score ?? 0 },
    { subject: 'ROI',        value: Math.min(deal.estimated_roi ?? 0, 100) },
    { subject: 'Low Risk',   value: deal.risk_score != null ? (10 - deal.risk_score) * 10 : 50 },
    { subject: 'Confidence', value: deal.prediction_confidence ?? 50 },
    { subject: 'Value',      value: deal.estimated_value ? Math.min(deal.estimated_value / 10000, 100) : 30 },
  ];
}

function WatchlistCard({ deal }) {
  const alerts = useMemo(() => detectAlerts(deal), [deal]);
  const hasAlerts = alerts.length > 0;

  return (
    <div className={`bg-[#1a0f2e] border rounded-xl p-4 space-y-3 transition-all ${
      hasAlerts ? 'border-yellow-500/40 shadow-[0_0_12px_rgba(251,191,36,0.1)]' : 'border-[#2d1e50]'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-white truncate">{deal.title}</h3>
            {hasAlerts && (
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-[#64748b] mt-0.5">{deal.industry}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Badge
            className="text-[10px] px-1.5 py-0.5"
            style={{
              background: `${STATUS_COLORS[deal.status] ?? '#64748b'}20`,
              color: STATUS_COLORS[deal.status] ?? '#64748b',
              border: `1px solid ${STATUS_COLORS[deal.status] ?? '#64748b'}50`,
            }}
          >
            {deal.status}
          </Badge>
          <WatchButton deal={deal} />
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2">
        <MetricChip
          label="Match"
          value={deal.match_score != null ? `${deal.match_score}` : '—'}
          snap={deal.watch_snapshot?.match_score}
          current={deal.match_score}
          color="#8b85f7"
          higherIsBetter
        />
        <MetricChip
          label="ROI"
          value={deal.estimated_roi != null ? `${deal.estimated_roi}%` : '—'}
          snap={deal.watch_snapshot?.estimated_roi}
          current={deal.estimated_roi}
          color="#10b981"
          higherIsBetter
        />
        <MetricChip
          label="Risk"
          value={deal.risk_score != null ? `${deal.risk_score}/10` : '—'}
          snap={deal.watch_snapshot?.risk_score}
          current={deal.risk_score}
          color="#ff8e42"
          higherIsBetter={false}
        />
      </div>

      {/* Alerts */}
      {hasAlerts && (
        <div className="space-y-1">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={`text-xs px-2 py-1 rounded-md border flex items-center gap-1.5 ${ALERT_STYLES[a.type]}`}
            >
              {a.type === 'positive' ? <TrendingUp className="w-3 h-3" /> :
               a.type === 'danger'   ? <TrendingDown className="w-3 h-3" /> :
                                       <Activity className="w-3 h-3" />}
              {a.label}
            </div>
          ))}
        </div>
      )}

      {/* Mini radar */}
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={buildRadar(deal)} outerRadius="65%">
            <PolarGrid stroke="#2d1e50" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar dataKey="value" stroke="#8b85f7" fill="#8b85f7" fillOpacity={0.3} strokeWidth={1.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Watched since */}
      {deal.watched_at && (
        <p className="text-[10px] text-[#64748b]">
          Watching for {formatDistanceToNow(parseISO(deal.watched_at))}
        </p>
      )}
    </div>
  );
}

function MetricChip({ label, value, snap, current, color, higherIsBetter }) {
  let arrow = null;
  if (snap != null && current != null) {
    const delta = current - snap;
    const improved = higherIsBetter ? delta > 0 : delta < 0;
    if (Math.abs(delta) > 0.5) {
      arrow = improved
        ? <TrendingUp className="w-3 h-3 text-green-400" />
        : <TrendingDown className="w-3 h-3 text-red-400" />;
    }
  }
  return (
    <div className="bg-[#0f0618] rounded-lg p-2 text-center border border-[#2d1e50]">
      <p className="text-[10px] text-[#64748b]">{label}</p>
      <div className="flex items-center justify-center gap-1 mt-0.5">
        <span className="text-sm font-bold" style={{ color }}>{value}</span>
        {arrow}
      </div>
    </div>
  );
}

export default function WatchlistDashboard() {
  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['watchlist-deals'],
    queryFn: () => base44.entities.SourcedDealOpportunity.filter({ is_watched: true }),
  });

  const alertDeals = deals.filter(d => detectAlerts(d).length > 0);
  const cleanDeals = deals.filter(d => detectAlerts(d).length === 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-[#64748b]">
        <Activity className="w-5 h-5 mr-2 animate-pulse" /> Loading watchlist...
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-3 border border-dashed border-[#2d1e50] rounded-xl">
        <Bookmark className="w-10 h-10 text-[#2d1e50]" />
        <p className="text-[#64748b] text-sm">Your watchlist is empty.</p>
        <p className="text-[#64748b] text-xs">Click the <Bookmark className="w-3 h-3 inline" /> icon on any deal to start tracking it.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#1a0f2e] border border-[#2d1e50] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{deals.length}</p>
          <p className="text-xs text-[#64748b] mt-1">Watched Deals</p>
        </div>
        <div className="bg-[#1a0f2e] border border-yellow-500/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{alertDeals.length}</p>
          <p className="text-xs text-[#64748b] mt-1">Profile Changes</p>
        </div>
        <div className="bg-[#1a0f2e] border border-green-500/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{cleanDeals.length}</p>
          <p className="text-xs text-[#64748b] mt-1">Stable Deals</p>
        </div>
      </div>

      {/* Alert section */}
      {alertDeals.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-yellow-400 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" /> Profile Changes Detected ({alertDeals.length})
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {alertDeals.map(d => <WatchlistCard key={d.id} deal={d} />)}
          </div>
        </div>
      )}

      {/* Stable deals */}
      {cleanDeals.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#64748b] flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> Stable ({cleanDeals.length})
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cleanDeals.map(d => <WatchlistCard key={d.id} deal={d} />)}
          </div>
        </div>
      )}
    </div>
  );
}