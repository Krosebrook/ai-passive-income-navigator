import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Clock, AlertCircle, Bookmark, ExternalLink } from 'lucide-react';

/**
 * Immediate Value Exposure Component
 * Shows 1 personalized deal after quick profile questions
 * Triggers first value action (save/view)
 */
export default function ValueExposureCard({ deal, onSave, onViewAnalysis, outcome }) {
  const matchReasons = [
    outcome === 'passive_income' && 'Cash-flow focused with proven revenue',
    outcome === 'capital_growth' && 'High-growth potential with clear scaling path',
    outcome === 'learn_deals' && 'Well-documented metrics for learning analysis',
    outcome === 'explore_only' && 'Low barrier to entry, flexible structure'
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h3 className="text-2xl font-bold mb-2">Here's a deal matching your profile</h3>
        <p className="text-[#a0aec0]">
          Based on your goals, we found this opportunity. No obligation—just explore.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-[#1a0f2e] to-[#0f0618] border-[#8b85f7]/30 overflow-hidden">
          {/* Deal Image/Header */}
          <div className="h-32 bg-gradient-to-br from-[#8b85f7]/20 via-[#00b7eb]/10 to-[#ff8e42]/10 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl opacity-20">💼</div>
            </div>
            <Badge className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
              AI Match: {deal?.match_score || 85}%
            </Badge>
          </div>

          <CardHeader>
            <CardTitle className="text-2xl">{deal?.title || 'SaaS Revenue Opportunity'}</CardTitle>
            <p className="text-sm text-[#a0aec0]">{deal?.description || 'Profitable SaaS with $50k MRR seeking growth partner'}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs text-[#64748b]">Expected ROI</p>
                <p className="font-bold text-lg">{deal?.roi || '45%'}</p>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <Clock className="w-5 h-5 text-[#8b85f7] mx-auto mb-2" />
                <p className="text-xs text-[#64748b]">Timeline</p>
                <p className="font-bold text-lg">{deal?.timeline || '18 mo'}</p>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                <p className="text-xs text-[#64748b]">Risk</p>
                <p className="font-bold text-lg capitalize">{deal?.risk_level || 'Medium'}</p>
              </div>
            </div>

            {/* Why This Matches */}
            <div className="bg-[#8b85f7]/10 border border-[#8b85f7]/20 rounded-lg p-4">
              <p className="text-sm font-semibold mb-2 text-[#8b85f7]">Why this matches:</p>
              <ul className="space-y-1 text-sm text-[#a0aec0]">
                {matchReasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#8b85f7] mt-0.5">→</span>
                    {reason}
                  </li>
                ))}
                <li className="flex items-start gap-2">
                  <span className="text-[#8b85f7] mt-0.5">→</span>
                  Matches your risk tolerance and time commitment
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-gradient-to-r from-[#8b85f7] to-[#583cf0] hover:shadow-lg"
                onClick={onSave}
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Save to Portfolio
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-[#2d1e50] hover:bg-white/5"
                onClick={onViewAnalysis}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Full Analysis
              </Button>
            </div>

            <p className="text-xs text-center text-[#64748b]">
              💡 Saving triggers AI analysis and adds to your tracking dashboard
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}