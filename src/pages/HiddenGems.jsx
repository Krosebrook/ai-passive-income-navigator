import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Gem, Sparkles, TrendingUp, AlertTriangle, Clock, DollarSign,
  Target, Zap, RefreshCw, Loader2, ChevronDown, ChevronUp,
  Plus, Star, Globe, ArrowRight
} from 'lucide-react';

const RISK_CONFIG = {
  low: { color: 'bg-green-500/20 text-green-400 border-green-500/40', label: 'Low Risk' },
  medium: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40', label: 'Medium Risk' },
  high: { color: 'bg-red-500/20 text-red-400 border-red-500/40', label: 'Higher Risk' }
};

const CATEGORIES = [
  'All', 'SaaS', 'E-commerce', 'Real Estate', 'Content', 'Services',
  'Fintech', 'Healthcare', 'Climate', 'Education', 'AI & Automation'
];

function GemCard({ gem, index, onAddToPipeline }) {
  const [expanded, setExpanded] = useState(false);
  const risk = RISK_CONFIG[gem.risk_level] || RISK_CONFIG.medium;
  const urgency = gem.urgency_score || 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="bg-[#1a0f2e] border border-[#2d1e50] hover:border-[#8b85f7]/40 transition-all overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 pb-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Gem className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-sm leading-tight">{gem.name}</h3>
                  <p className="text-[#64748b] text-xs mt-0.5 line-clamp-1">{gem.tagline}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <Badge className={`text-xs border ${risk.color}`}>{risk.label}</Badge>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-2 my-3">
              <div className="text-center p-2 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                <p className="text-xs text-[#64748b]">ROI</p>
                <p className="text-sm font-bold text-[#8b85f7]">~{gem.estimated_roi_pct}%</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                <p className="text-xs text-[#64748b]">Timeline</p>
                <p className="text-sm font-bold text-white">{gem.roi_timeframe}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                <p className="text-xs text-[#64748b]">Min Entry</p>
                <p className="text-sm font-bold text-[#00b7eb]">${(gem.investment_range_low || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Urgency Bar */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-[#64748b]">Urgency</span>
              <div className="flex-1 h-1.5 bg-[#2d1e50] rounded-full overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${urgency >= 80 ? 'bg-red-500' : urgency >= 60 ? 'bg-yellow-500' : 'bg-[#8b85f7]'}`}
                  style={{ width: `${urgency}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-white">{urgency}/100</span>
            </div>

            {/* Why Now - always visible */}
            <div className="p-2.5 rounded-lg bg-[#8b85f7]/10 border border-[#8b85f7]/20 mb-3">
              <p className="text-xs font-semibold text-[#8b85f7] mb-1 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Why Now
              </p>
              <p className="text-xs text-[#94a3b8]">{gem.why_now}</p>
            </div>

            {/* Contrarian Thesis (collapsed by default) */}
            <button
              className="w-full flex items-center justify-between text-xs text-[#64748b] hover:text-white transition-colors"
              onClick={() => setExpanded(!expanded)}
            >
              <span>Full analysis</span>
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3 border-t border-[#2d1e50] pt-3">
                  <div>
                    <p className="text-xs font-semibold text-white mb-1">Contrarian Thesis</p>
                    <p className="text-xs text-[#94a3b8]">{gem.contrarian_thesis}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white mb-1">Why It's Overlooked</p>
                    <p className="text-xs text-[#94a3b8]">{gem.why_overlooked}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white mb-1">Entry Strategy</p>
                    <p className="text-xs text-[#94a3b8]">{gem.entry_strategy}</p>
                  </div>
                  {gem.key_risks?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-400 mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Risks to Watch
                      </p>
                      {gem.key_risks.map((r, i) => (
                        <p key={i} className="text-xs text-[#94a3b8]">• {r}</p>
                      ))}
                    </div>
                  )}
                  {gem.real_world_comp && (
                    <div className="p-2 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                      <p className="text-xs font-semibold text-[#64748b] mb-0.5">Real-world comp</p>
                      <p className="text-xs text-[#94a3b8]">{gem.real_world_comp}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-[#64748b]">
                    <span>Market: {gem.market_size}</span>
                    <span>Range: ${(gem.investment_range_low || 0).toLocaleString()} – ${(gem.investment_range_high || 0).toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Footer */}
          <div className="px-4 pb-4 pt-2 border-t border-[#2d1e50] flex gap-2">
            <Button
              size="sm"
              onClick={() => onAddToPipeline(gem)}
              className="flex-1 bg-gradient-to-r from-[#8b85f7] to-[#583cf0] text-xs h-8"
            >
              <Plus className="w-3 h-3 mr-1" /> Add to Pipeline
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
              className="text-[#64748b] hover:text-white text-xs h-8"
            >
              {expanded ? 'Less' : 'More'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function HiddenGems() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [gems, setGems] = useState([]);
  const [marketContext, setMarketContext] = useState('');
  const [personalization, setPersonalization] = useState('');

  const discoverMutation = useMutation({
    mutationFn: () => base44.functions.invoke('discoverHiddenGems', {
      category: selectedCategory === 'All' ? undefined : selectedCategory
    }),
    onSuccess: (res) => {
      setGems(res.data?.gems || []);
      setMarketContext(res.data?.market_context || '');
      setPersonalization(res.data?.personalization_notes || '');
      toast.success(`${res.data?.gems?.length || 0} hidden gems discovered!`);
    },
    onError: () => toast.error('Discovery failed. Try again.')
  });

  const addToPipelineMutation = useMutation({
    mutationFn: (gem) => base44.entities.DealPipeline.create({
      deal_name: gem.name,
      deal_description: `${gem.contrarian_thesis}\n\nEntry Strategy: ${gem.entry_strategy}`,
      industry: gem.category,
      stage: 'research',
      priority: gem.urgency_score >= 80 ? 'high' : gem.urgency_score >= 60 ? 'medium' : 'low',
      estimated_value: gem.investment_range_high || 0,
      notes: `Hidden Gem Discovery\nROI: ~${gem.estimated_roi_pct}% in ${gem.roi_timeframe}\nMarket: ${gem.market_size}\nComp: ${gem.real_world_comp}`,
      stage_history: [{ stage: 'research', entered_at: new Date().toISOString(), notes: 'Added from Hidden Gems' }]
    }),
    onSuccess: () => {
      toast.success('Added to pipeline! Auto DD will run shortly.');
      queryClient.invalidateQueries({ queryKey: ['deal-pipeline'] });
    }
  });

  const filteredGems = selectedCategory === 'All'
    ? gems
    : gems.filter(g => g.category?.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] flex items-center justify-center glow-primary">
              <Gem className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">Hidden Gems</h1>
              <p className="text-[#64748b] text-sm">AI-discovered contrarian opportunities most investors overlook</p>
            </div>
          </div>

          {/* Market Context */}
          {marketContext && (
            <div className="mt-4 p-3 rounded-xl bg-[#1a0f2e] border border-[#2d1e50]">
              <p className="text-xs text-[#64748b] flex items-start gap-2">
                <Globe className="w-3 h-3 text-[#8b85f7] mt-0.5 flex-shrink-0" />
                {marketContext}
              </p>
            </div>
          )}
          {personalization && (
            <div className="mt-2 p-3 rounded-xl bg-[#8b85f7]/10 border border-[#8b85f7]/20">
              <p className="text-xs text-[#8b85f7] flex items-start gap-2">
                <Star className="w-3 h-3 mt-0.5 flex-shrink-0" />
                {personalization}
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button
            onClick={() => discoverMutation.mutate()}
            disabled={discoverMutation.isPending}
            className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0] gap-2"
          >
            {discoverMutation.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Discovering...</>
              : <><Sparkles className="w-4 h-4" /> Discover Hidden Gems</>
            }
          </Button>
          {gems.length > 0 && (
            <Button variant="ghost" onClick={() => discoverMutation.mutate()} disabled={discoverMutation.isPending} className="text-[#64748b]">
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          )}
        </div>

        {/* Category Filter */}
        {gems.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                  selectedCategory === cat
                    ? 'bg-[#8b85f7] text-white border-[#8b85f7]'
                    : 'bg-[#1a0f2e] text-[#64748b] border-[#2d1e50] hover:border-[#8b85f7]/40 hover:text-[#8b85f7]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {gems.length === 0 && !discoverMutation.isPending && (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8b85f7]/20 to-[#00b7eb]/20 flex items-center justify-center mx-auto mb-6 border border-[#8b85f7]/30">
              <Gem className="w-12 h-12 text-[#8b85f7]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Find Your Next Hidden Gem</h2>
            <p className="text-[#64748b] mb-6 max-w-lg mx-auto">
              AI analyzes your portfolio, market trends, and contrarian signals to surface 10 overlooked investment opportunities personalized to you.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8 text-xs">
              {[
                { icon: TrendingUp, text: 'Market trend analysis' },
                { icon: Target, text: 'Portfolio gap detection' },
                { icon: Globe, text: 'Live web research' },
                { icon: Zap, text: 'Contrarian signals' }
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#1a0f2e] border border-[#2d1e50] text-center">
                  <Icon className="w-5 h-5 text-[#8b85f7] mx-auto mb-1" />
                  <p className="text-[#64748b]">{text}</p>
                </div>
              ))}
            </div>
            <Button
              size="lg"
              onClick={() => discoverMutation.mutate()}
              className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0] gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Discover My Hidden Gems
            </Button>
          </div>
        )}

        {/* Loading */}
        {discoverMutation.isPending && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Gem className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Hunting for Hidden Gems...</h3>
            <p className="text-[#64748b] text-sm">Analyzing market blind spots, portfolio gaps, and contrarian signals</p>
            <div className="flex flex-col items-center gap-1 mt-4">
              {['Scanning 100+ markets for overlooked niches...', 'Cross-referencing your portfolio for gaps...', 'Finding contrarian plays with momentum...'].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#64748b]">
                  <Loader2 className="w-3 h-3 animate-spin text-[#8b85f7]" />
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gems Grid */}
        {filteredGems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGems.map((gem, i) => (
              <GemCard
                key={i}
                gem={gem}
                index={i}
                onAddToPipeline={(g) => addToPipelineMutation.mutate(g)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}