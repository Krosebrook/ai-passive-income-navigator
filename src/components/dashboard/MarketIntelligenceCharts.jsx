import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const COLORS = {
  sp500: '#8b85f7',
  nasdaq: '#00b7eb',
  dow: '#ff8e42',
  sentiment: '#10b981',
  volatility: '#ef4444',
};

function StatCard({ label, value, trend }) {
  const isUp = trend >= 0;
  return (
    <div className="bg-[#1a0f2e] border border-[#2d1e50] rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-[#64748b] uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold text-white">{value ?? '—'}</span>
      {trend != null && (
        <span className={`text-xs flex items-center gap-1 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isUp ? '+' : ''}{trend.toFixed(2)}%
        </span>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a0f2e] border border-[#2d1e50] rounded-lg p-3 text-xs shadow-xl">
      <p className="text-[#64748b] mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-bold text-white">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function MarketIntelligenceCharts() {
  const { data: snapshots = [], isLoading } = useQuery({
    queryKey: ['market-snapshots'],
    queryFn: () => base44.entities.MarketDataSnapshot.list('-snapshot_date', 30),
  });

  const chartData = [...snapshots]
    .reverse()
    .map((s) => ({
      date: format(parseISO(s.snapshot_date), 'MMM d'),
      sp500: s.market_indices?.sp500,
      nasdaq: s.market_indices?.nasdaq,
      dow: s.market_indices?.dow,
      vix: s.volatility_index,
      sentiment: s.sentiment_score != null ? +(s.sentiment_score * 100).toFixed(1) : null,
    }));

  const latest = snapshots[0];
  const prev = snapshots[1];

  const pct = (key) => {
    const a = latest?.market_indices?.[key];
    const b = prev?.market_indices?.[key];
    if (a == null || b == null || b === 0) return null;
    return ((a - b) / b) * 100;
  };

  // Industry sentiment bar data
  const industryData = latest?.industry_data
    ? Object.entries(latest.industry_data).map(([name, d]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        change: typeof d.change_percent === 'number' ? +d.change_percent.toFixed(2) : 0,
      }))
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-[#64748b]">
        <Activity className="w-5 h-5 mr-2 animate-pulse" /> Loading market data...
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[#64748b] border border-dashed border-[#2d1e50] rounded-xl">
        No market snapshots yet. Run the Daily Market Intelligence automation to populate data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="S&P 500" value={latest?.market_indices?.sp500?.toLocaleString()} trend={pct('sp500')} />
        <StatCard label="NASDAQ" value={latest?.market_indices?.nasdaq?.toLocaleString()} trend={pct('nasdaq')} />
        <StatCard label="DOW" value={latest?.market_indices?.dow?.toLocaleString()} trend={pct('dow')} />
        <StatCard
          label="Sentiment"
          value={latest?.sentiment_score != null ? `${(latest.sentiment_score * 100).toFixed(0)}` : '—'}
          trend={null}
        />
      </div>

      {/* Index Trend Lines */}
      {chartData.length > 1 && (
        <div className="bg-[#1a0f2e] border border-[#2d1e50] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Market Indices Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              <Line type="monotone" dataKey="sp500" name="S&P 500" stroke={COLORS.sp500} dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="nasdaq" name="NASDAQ" stroke={COLORS.nasdaq} dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="dow" name="DOW" stroke={COLORS.dow} dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sentiment & Volatility */}
      {chartData.length > 1 && (
        <div className="bg-[#1a0f2e] border border-[#2d1e50] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Market Sentiment & Volatility (VIX)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.sentiment} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.sentiment} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="vixGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.volatility} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.volatility} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              <Area type="monotone" dataKey="sentiment" name="Sentiment %" stroke={COLORS.sentiment} fill="url(#sentGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="vix" name="VIX" stroke={COLORS.volatility} fill="url(#vixGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Industry Bar Chart */}
      {industryData.length > 0 && (
        <div className="bg-[#1a0f2e] border border-[#2d1e50] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Sector Performance (Latest Snapshot)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={industryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="change"
                name="Change %"
                radius={[0, 4, 4, 0]}
                fill="#8b85f7"
                label={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}