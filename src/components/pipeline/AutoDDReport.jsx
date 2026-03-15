import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Sparkles, RefreshCw, TrendingUp, ShieldAlert, CheckCircle2,
  AlertTriangle, XCircle, BarChart3, Search, Loader2
} from 'lucide-react';

const RECOMMENDATION_CONFIG = {
  proceed: { label: 'Proceed', color: 'bg-green-500/20 text-green-400 border-green-500/40' },
  proceed_with_caution: { label: 'Proceed w/ Caution', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
  do_not_proceed: { label: 'Do Not Proceed', color: 'bg-red-500/20 text-red-400 border-red-500/40' },
  needs_more_info: { label: 'Needs More Info', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' }
};

const VIABILITY_COLORS = {
  strong: 'text-green-400',
  moderate: 'text-yellow-400',
  weak: 'text-orange-400',
  poor: 'text-red-400'
};

export default function AutoDDReport({ deal }) {
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(deal?.auto_dd_status === 'running');

  const report = deal?.auto_dd_report;
  const status = deal?.auto_dd_status;

  const runMutation = useMutation({
    mutationFn: () => base44.functions.invoke('autoDueDiligencePipeline', { deal_id: deal.id }),
    onMutate: () => setIsRunning(true),
    onSuccess: () => {
      toast.success('Due diligence report generated!');
      queryClient.invalidateQueries({ queryKey: ['deal-pipeline'] });
      setIsRunning(false);
    },
    onError: (err) => {
      toast.error('DD analysis failed: ' + (err.message || 'Unknown error'));
      setIsRunning(false);
    }
  });

  if (isRunning) {
    return (
      <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
        <CardContent className="p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] flex items-center justify-center animate-pulse">
              <Search className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-1">Running AI Due Diligence</h3>
              <p className="text-[#64748b] text-sm">Pulling market data, running SWOT analysis, verifying claims...</p>
            </div>
            <div className="flex items-center gap-2 text-[#8b85f7] text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              This may take 30-60 seconds
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Automated Due Diligence</h3>
          <p className="text-[#64748b] mb-6 max-w-md mx-auto text-sm">
            Run a full AI-powered analysis: market research, SWOT analysis, and claims verification — all in one click.
          </p>
          <Button onClick={() => runMutation.mutate()} className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0]">
            <Sparkles className="w-4 h-4 mr-2" />
            Run Auto Due Diligence
          </Button>
          {status === 'failed' && (
            <p className="text-red-400 text-sm mt-3">Previous run failed. Try again.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  const { executive_summary, market_research, swot_analysis, claims_verification } = report;
  const recConfig = RECOMMENDATION_CONFIG[executive_summary?.recommendation] || RECOMMENDATION_CONFIG.needs_more_info;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className={`border ${recConfig.color}`}>{recConfig.label}</Badge>
          <span className="text-[#64748b] text-xs">
            Generated {new Date(report.generated_at).toLocaleDateString()}
          </span>
        </div>
        <Button size="sm" variant="ghost" onClick={() => runMutation.mutate()} className="text-[#64748b] hover:text-[#8b85f7]">
          <RefreshCw className="w-3 h-3 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Executive Summary Card */}
      <Card className="bg-[#0f0618] border border-[#8b85f7]/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-[#8b85f7] text-base">
            <ShieldAlert className="w-4 h-4" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[#94a3b8] text-sm leading-relaxed">{executive_summary?.summary_paragraph}</p>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#8b85f7]">{executive_summary?.confidence_score || 0}</p>
              <p className="text-xs text-[#64748b]">Confidence</p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-green-400 font-semibold mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Reasons to Invest
                </p>
                <ul className="space-y-1">
                  {executive_summary?.reasons_to_invest?.map((r, i) => (
                    <li key={i} className="text-xs text-[#94a3b8]">• {r}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs text-red-400 font-semibold mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Key Risks
                </p>
                <ul className="space-y-1">
                  {executive_summary?.key_risks?.map((r, i) => (
                    <li key={i} className="text-xs text-[#94a3b8]">• {r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {executive_summary?.next_actions?.length > 0 && (
            <div className="p-3 rounded-lg bg-[#8b85f7]/10 border border-[#8b85f7]/20">
              <p className="text-xs font-semibold text-[#8b85f7] mb-2">Next Actions</p>
              {executive_summary.next_actions.map((a, i) => (
                <p key={i} className="text-xs text-[#94a3b8]">{i + 1}. {a}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="swot" className="space-y-3">
        <TabsList className="bg-[#1a0f2e] border border-[#2d1e50]">
          <TabsTrigger value="swot">SWOT</TabsTrigger>
          <TabsTrigger value="market">Market Data</TabsTrigger>
          <TabsTrigger value="claims">Claims Check</TabsTrigger>
        </TabsList>

        {/* SWOT Tab */}
        <TabsContent value="swot">
          <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-semibold">SWOT Analysis</h4>
                {swot_analysis?.overall_viability && (
                  <span className={`text-sm font-semibold ${VIABILITY_COLORS[swot_analysis.overall_viability] || 'text-white'}`}>
                    Viability: {swot_analysis.overall_viability}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'strengths', label: 'Strengths', color: 'border-green-500/40 bg-green-500/5', textColor: 'text-green-400' },
                  { key: 'weaknesses', label: 'Weaknesses', color: 'border-red-500/40 bg-red-500/5', textColor: 'text-red-400' },
                  { key: 'opportunities', label: 'Opportunities', color: 'border-blue-500/40 bg-blue-500/5', textColor: 'text-blue-400' },
                  { key: 'threats', label: 'Threats', color: 'border-orange-500/40 bg-orange-500/5', textColor: 'text-orange-400' }
                ].map(({ key, label, color, textColor }) => (
                  <div key={key} className={`p-3 rounded-lg border ${color}`}>
                    <p className={`text-xs font-bold mb-2 ${textColor}`}>{label}</p>
                    <ul className="space-y-1">
                      {(swot_analysis?.[key] || []).map((item, i) => (
                        <li key={i} className="text-xs text-[#94a3b8]">• {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {swot_analysis?.swot_summary && (
                <p className="text-xs text-[#64748b] mt-3 italic">{swot_analysis.swot_summary}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Data Tab */}
        <TabsContent value="market">
          <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[#0f0618] border border-[#2d1e50] text-center">
                  <p className="text-xs text-[#64748b] mb-1">Market Size</p>
                  <p className="text-sm font-bold text-white">{market_research?.market_size_usd || 'N/A'}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#0f0618] border border-[#2d1e50] text-center">
                  <p className="text-xs text-[#64748b] mb-1">Growth Rate</p>
                  <p className="text-sm font-bold text-[#8b85f7]">{market_research?.growth_rate || 'N/A'}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#0f0618] border border-[#2d1e50] text-center">
                  <p className="text-xs text-[#64748b] mb-1">Sentiment</p>
                  <p className={`text-sm font-bold capitalize ${
                    market_research?.market_sentiment === 'bullish' ? 'text-green-400' :
                    market_research?.market_sentiment === 'bearish' ? 'text-red-400' : 'text-yellow-400'
                  }`}>{market_research?.market_sentiment || 'N/A'}</p>
                </div>
              </div>

              {market_research?.competitors?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#8b85f7] mb-2">Competitors</p>
                  <div className="space-y-2">
                    {market_research.competitors.map((c, i) => (
                      <div key={i} className="flex items-start justify-between p-2 rounded bg-[#0f0618] border border-[#2d1e50]">
                        <div>
                          <p className="text-xs font-medium text-white">{c.name}</p>
                          <p className="text-xs text-[#64748b]">{c.description}</p>
                        </div>
                        <Badge className={`text-xs ${
                          c.threat_level === 'high' ? 'bg-red-500/20 text-red-400' :
                          c.threat_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                        }`}>{c.threat_level}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {market_research?.key_trends?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#8b85f7] mb-2">Key Trends</p>
                  <ul className="space-y-1">
                    {market_research.key_trends.map((t, i) => (
                      <li key={i} className="text-xs text-[#94a3b8] flex items-start gap-2">
                        <TrendingUp className="w-3 h-3 mt-0.5 text-[#8b85f7] flex-shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {market_research?.regulatory_notes && (
                <div className="p-3 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                  <p className="text-xs font-semibold text-[#8b85f7] mb-1">Regulatory Notes</p>
                  <p className="text-xs text-[#94a3b8]">{market_research.regulatory_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claims Check Tab */}
        <TabsContent value="claims">
          <Card className="bg-[#1a0f2e] border border-[#2d1e50]">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold text-sm">Claims Verification</p>
                <div className="text-center">
                  <span className="text-lg font-bold text-white">{claims_verification?.overall_credibility_score || 0}</span>
                  <span className="text-xs text-[#64748b]">/10 credibility</span>
                </div>
              </div>

              {claims_verification?.trustworthiness_assessment && (
                <p className="text-xs text-[#94a3b8] italic">{claims_verification.trustworthiness_assessment}</p>
              )}

              {claims_verification?.claims?.map((c, i) => (
                <div key={i} className="p-3 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-xs text-white font-medium flex-1 pr-2">{c.claim}</p>
                    <Badge className={`text-xs flex-shrink-0 ${
                      c.verification_status === 'verified' ? 'bg-green-500/20 text-green-400' :
                      c.verification_status === 'plausible' ? 'bg-blue-500/20 text-blue-400' :
                      c.verification_status === 'questionable' ? 'bg-yellow-500/20 text-yellow-400' :
                      c.verification_status === 'false' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>{c.verification_status}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-[#2d1e50] rounded-full">
                      <div
                        className="h-1 rounded-full bg-gradient-to-r from-[#8b85f7] to-[#00b7eb]"
                        style={{ width: `${(c.credibility_score / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#64748b]">{c.credibility_score}/10</span>
                  </div>
                  {c.notes && <p className="text-xs text-[#64748b] mt-1">{c.notes}</p>}
                </div>
              ))}

              {claims_verification?.red_flags?.length > 0 && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Red Flags
                  </p>
                  {claims_verification.red_flags.map((f, i) => (
                    <p key={i} className="text-xs text-red-300">• {f}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}