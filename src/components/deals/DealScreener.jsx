import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SlidersHorizontal, Sparkles, RefreshCw, Filter, TrendingUp } from 'lucide-react';
import DealScreeningCard from './DealScreeningCard';
import { toast } from 'sonner';

const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Real Estate', 'E-commerce', 'SaaS', 'Consumer Goods', 'Energy', 'Education', 'Media'];
const DEAL_STRUCTURES = ['Equity', 'Revenue Share', 'Licensing', 'Convertible Note', 'SAFE', 'Debt'];

export default function DealScreener() {
  const [criteria, setCriteria] = useState({
    target_industries: [],
    preferred_deal_structures: [],
    investment_size_min: 0,
    investment_size_max: 500000,
    risk_tolerance: 'moderate',
    time_horizon: 'medium_term',
    target_return_percentage: null
  });
  const [screenedDeals, setScreenedDeals] = useState([]);
  const [hasRun, setHasRun] = useState(false);
  const [stats, setStats] = useState(null);

  // Pre-fill from user preferences
  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        const prefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
        if (prefs.length > 0) {
          const p = prefs[0];
          setCriteria(prev => ({
            ...prev,
            target_industries: p.target_industries || [],
            preferred_deal_structures: p.preferred_deal_structures || [],
            investment_size_min: p.investment_size_min ?? 0,
            investment_size_max: p.investment_size_max ?? 500000,
            risk_tolerance: p.risk_tolerance || 'moderate',
            time_horizon: p.time_horizon || 'medium_term',
            target_return_percentage: p.target_return_percentage ?? null
          }));
        }
      } catch (_) {}
    };
    load();
  }, []);

  const screenMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('screenAndRankDeals', { criteria });
      return result.data;
    },
    onSuccess: (data) => {
      setScreenedDeals(data.screened_deals || []);
      setStats({ total_candidates: data.total_candidates, total_analyzed: data.total_analyzed });
      setHasRun(true);
      if (data.screened_deals?.length === 0) {
        toast.info('No deals matched your criteria. Try broadening your filters.');
      } else {
        toast.success(`Screened ${data.total_analyzed} deals — ${data.screened_deals.length} ranked!`);
      }
    },
    onError: () => toast.error('Screening failed. Please try again.')
  });

  const toggleItem = (field, value) => {
    setCriteria(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const excellentCount = screenedDeals.filter(d => d.fit_rating === 'excellent').length;
  const goodCount = screenedDeals.filter(d => d.fit_rating === 'good').length;

  return (
    <div className="space-y-6">
      {/* Criteria Panel */}
      <Card className="card-dark border-[#2d1e50]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gradient">
            <SlidersHorizontal className="w-5 h-5" />
            Screening Criteria
          </CardTitle>
          <CardDescription className="text-[#64748b]">
            Define your investment criteria. The AI will screen and rank all available deals against these filters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Industries */}
          <div>
            <Label className="text-sm font-medium text-white mb-2 block">Target Industries</Label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map(ind => (
                <Badge
                  key={ind}
                  variant={criteria.target_industries.includes(ind) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-[#8b85f7]/20 transition-colors"
                  onClick={() => toggleItem('target_industries', ind)}
                >
                  {ind}
                </Badge>
              ))}
            </div>
            {criteria.target_industries.length === 0 && (
              <p className="text-xs text-[#64748b] mt-1">No selection = any industry</p>
            )}
          </div>

          {/* Deal Structures */}
          <div>
            <Label className="text-sm font-medium text-white mb-2 block">Preferred Deal Structures</Label>
            <div className="flex flex-wrap gap-2">
              {DEAL_STRUCTURES.map(s => (
                <Badge
                  key={s}
                  variant={criteria.preferred_deal_structures.includes(s) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-[#8b85f7]/20 transition-colors"
                  onClick={() => toggleItem('preferred_deal_structures', s)}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          {/* Investment Size + Risk + Time Horizon in a grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-white mb-2 block">Min Investment ($)</Label>
              <Input
                type="number"
                value={criteria.investment_size_min}
                onChange={e => setCriteria(p => ({ ...p, investment_size_min: Number(e.target.value) }))}
                className="bg-[#0f0618]"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-white mb-2 block">Max Investment ($)</Label>
              <Input
                type="number"
                value={criteria.investment_size_max}
                onChange={e => setCriteria(p => ({ ...p, investment_size_max: Number(e.target.value) }))}
                className="bg-[#0f0618]"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-white mb-2 block">Target Return (%)</Label>
              <Input
                type="number"
                value={criteria.target_return_percentage ?? ''}
                placeholder="e.g. 25"
                onChange={e => setCriteria(p => ({ ...p, target_return_percentage: e.target.value ? Number(e.target.value) : null }))}
                className="bg-[#0f0618]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-white mb-2 block">Risk Tolerance</Label>
              <Select
                value={criteria.risk_tolerance}
                onValueChange={val => setCriteria(p => ({ ...p, risk_tolerance: val }))}
              >
                <SelectTrigger className="bg-[#0f0618] border-[#2d1e50]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['very_conservative', 'conservative', 'moderate', 'aggressive', 'very_aggressive'].map(r => (
                    <SelectItem key={r} value={r}>{r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-white mb-2 block">Time Horizon</Label>
              <Select
                value={criteria.time_horizon}
                onValueChange={val => setCriteria(p => ({ ...p, time_horizon: val }))}
              >
                <SelectTrigger className="bg-[#0f0618] border-[#2d1e50]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short_term">Short Term (&lt;1 year)</SelectItem>
                  <SelectItem value="medium_term">Medium Term (1–3 years)</SelectItem>
                  <SelectItem value="long_term">Long Term (3+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => screenMutation.mutate()}
            disabled={screenMutation.isPending}
            className="w-full bg-gradient-to-r from-[#8b85f7] to-[#583cf0] gap-2"
          >
            {screenMutation.isPending ? (
              <><RefreshCw className="w-4 h-4 animate-spin" />Screening & Ranking Deals...</>
            ) : (
              <><Sparkles className="w-4 h-4" />Run AI Screener</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {hasRun && (
        <div className="space-y-4">
          {/* Stats bar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#8b85f7]" />
              <span className="text-sm text-white font-medium">
                {screenedDeals.length} deals ranked
              </span>
              {stats && (
                <span className="text-xs text-[#64748b]">
                  (from {stats.total_candidates} candidates, AI analyzed {stats.total_analyzed})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {excellentCount > 0 && (
                <Badge className="bg-emerald-600/20 text-emerald-400 border border-emerald-600/40">
                  {excellentCount} Excellent
                </Badge>
              )}
              {goodCount > 0 && (
                <Badge className="bg-blue-600/20 text-blue-400 border border-blue-600/40">
                  {goodCount} Good
                </Badge>
              )}
            </div>
          </div>

          {screenedDeals.length === 0 ? (
            <Card className="card-dark">
              <CardContent className="py-12 text-center">
                <TrendingUp className="w-10 h-10 text-[#2d1e50] mx-auto mb-3" />
                <p className="text-[#64748b]">No deals matched your criteria.</p>
                <p className="text-xs text-[#64748b] mt-1">Try broadening your industry or investment size filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {screenedDeals.map((deal, i) => (
                <DealScreeningCard key={deal.id || i} deal={deal} rank={i + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}