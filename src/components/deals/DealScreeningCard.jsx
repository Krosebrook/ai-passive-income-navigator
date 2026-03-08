import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, DollarSign, TrendingUp, Shield } from 'lucide-react';
import WatchButton from '@/components/deals/WatchButton';
import { motion, AnimatePresence } from 'framer-motion';

const FIT_CONFIG = {
  excellent: { color: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/40', bar: 'bg-emerald-500' },
  good:      { color: 'bg-blue-600/20 text-blue-400 border-blue-600/40',    bar: 'bg-blue-500' },
  fair:      { color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/40', bar: 'bg-yellow-500' },
  poor:      { color: 'bg-red-600/20 text-red-400 border-red-600/40',       bar: 'bg-red-500' }
};

const REC_CONFIG = {
  strong_buy: { label: 'Strong Buy', color: 'bg-emerald-600 text-white' },
  consider:   { label: 'Consider',   color: 'bg-blue-600 text-white' },
  pass:       { label: 'Pass',       color: 'bg-yellow-600 text-black' },
  avoid:      { label: 'Avoid',      color: 'bg-red-600 text-white' }
};

export default function DealScreeningCard({ deal, rank }) {
  const [expanded, setExpanded] = useState(false);

  const fit = FIT_CONFIG[deal.fit_rating] || FIT_CONFIG.fair;
  const rec = REC_CONFIG[deal.recommendation] || REC_CONFIG.pass;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.06 }}
    >
      <Card className="card-dark hover:border-[#8b85f7]/40 transition-all">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            {/* Rank bubble */}
            <div className="w-9 h-9 rounded-full bg-[#1a0f2e] border border-[#2d1e50] flex items-center justify-center flex-shrink-0">
              <span className={`text-sm font-bold ${rank <= 3 ? 'text-[#8b85f7]' : 'text-[#64748b]'}`}>
                #{rank}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="font-semibold text-white text-sm leading-tight">{deal.title}</h3>
                  <p className="text-xs text-[#64748b] mt-0.5">{deal.industry}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${fit.color}`}>
                    {deal.fit_rating}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rec.color}`}>
                    {rec.label}
                  </span>
                </div>
              </div>

              {/* Fit Score Bar */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-[#64748b] w-16 flex-shrink-0">Fit Score</span>
                <div className="flex-1 bg-[#1a0f2e] rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${fit.bar}`}
                    style={{ width: `${deal.fit_score}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-white w-8 text-right">{deal.fit_score}</span>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {deal.estimated_roi != null && (
                  <div className="flex items-center gap-1 text-xs text-[#64748b]">
                    <TrendingUp className="w-3 h-3 text-[#00b7eb]" />
                    {deal.estimated_roi}% ROI
                  </div>
                )}
                {deal.required_investment != null && (
                  <div className="flex items-center gap-1 text-xs text-[#64748b]">
                    <DollarSign className="w-3 h-3 text-[#ff8e42]" />
                    ${deal.required_investment?.toLocaleString()}
                  </div>
                )}
                {deal.risk_score != null && (
                  <div className="flex items-center gap-1 text-xs text-[#64748b]">
                    <Shield className="w-3 h-3 text-[#8b85f7]" />
                    Risk {deal.risk_score}/10
                  </div>
                )}
                {deal.deal_structure && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0">{deal.deal_structure}</Badge>
                )}
              </div>

              {/* Fit summary */}
              <p className="text-xs text-[#a0aec0] mt-2 leading-relaxed">{deal.fit_summary}</p>
            </div>
          </div>

          {/* Expand / Collapse */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 h-7 text-xs text-[#64748b] hover:text-[#8b85f7]"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <><ChevronUp className="w-3 h-3 mr-1" />Hide details</> : <><ChevronDown className="w-3 h-3 mr-1" />Show match details</>}
          </Button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 border-t border-[#2d1e50] grid md:grid-cols-2 gap-3 mt-2">
                  {deal.match_reasons?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-400">Why it fits</span>
                      </div>
                      <ul className="space-y-1">
                        {deal.match_reasons.map((r, i) => (
                          <li key={i} className="text-xs text-[#a0aec0] flex items-start gap-1.5">
                            <span className="text-emerald-400 mt-0.5">•</span>{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {deal.concerns?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-xs font-semibold text-yellow-400">Concerns</span>
                      </div>
                      <ul className="space-y-1">
                        {deal.concerns.map((c, i) => (
                          <li key={i} className="text-xs text-[#a0aec0] flex items-start gap-1.5">
                            <span className="text-yellow-400 mt-0.5">•</span>{c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}