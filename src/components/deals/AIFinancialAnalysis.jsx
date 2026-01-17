import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  Brain, Loader2, TrendingUp, AlertTriangle, CheckCircle2, 
  Target, DollarSign, Calendar, BarChart3 
} from 'lucide-react';

export default function AIFinancialAnalysis({ entityType, entityId, entityTitle }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await base44.functions.invoke('analyzeFinancials', {
        entityType,
        entityId
      });
      setAnalysis(response.data.analysis);
      toast.success('Financial analysis complete!');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze financials');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (score) => {
    if (score < 30) return 'text-green-500';
    if (score < 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRecommendationColor = (rec) => {
    if (rec === 'strong_buy') return 'bg-green-600';
    if (rec === 'buy') return 'bg-emerald-600';
    if (rec === 'hold') return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <Card className="bg-[#1a0f2e] border-[#2d1e50]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="w-5 h-5 text-violet-500" />
            AI Financial Analysis
          </CardTitle>
          <Button 
            onClick={runAnalysis}
            disabled={isAnalyzing}
            size="sm"
            className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!analysis && !isAnalyzing && (
          <div className="text-center py-8 text-gray-400">
            Click "Run Analysis" for AI-powered risk assessment, ROI projections, and due diligence
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-400">AI is researching market data and analyzing financials...</p>
            <p className="text-xs text-gray-500 mt-2">This may take 30-60 seconds</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Risk Assessment */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Risk Assessment
              </h3>
              <div className="bg-[#0f0618] border border-[#2d1e50] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400">Risk Score</span>
                  <span className={`text-2xl font-bold ${getRiskColor(analysis.risk_assessment?.risk_score)}`}>
                    {analysis.risk_assessment?.risk_score}/100
                  </span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">Key Risk Factors:</h4>
                  {analysis.risk_assessment?.key_risk_factors?.map((factor, i) => (
                    <div key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      {factor}
                    </div>
                  ))}
                </div>
                {analysis.risk_assessment?.mitigation_strategies?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <h4 className="text-sm font-semibold text-white">Mitigation Strategies:</h4>
                    {analysis.risk_assessment.mitigation_strategies.map((strategy, i) => (
                      <div key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        {strategy}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ROI Projection */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                ROI Projection
              </h3>
              <div className="bg-[#0f0618] border border-[#2d1e50] rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-xs text-gray-400">12-Month ROI</span>
                    <p className="text-xl font-bold text-emerald-400">
                      {analysis.roi_projection?.projected_12mo_roi}%
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">24-Month ROI</span>
                    <p className="text-xl font-bold text-emerald-400">
                      {analysis.roi_projection?.projected_24mo_roi}%
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center">
                    <span className="text-xs text-gray-400">Best Case</span>
                    <p className="text-sm font-semibold text-green-400">
                      {analysis.roi_projection?.best_case_return}%
                    </p>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-400">Most Likely</span>
                    <p className="text-sm font-semibold text-white">
                      {analysis.roi_projection?.most_likely_return}%
                    </p>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-400">Worst Case</span>
                    <p className="text-sm font-semibold text-red-400">
                      {analysis.roi_projection?.worst_case_return}%
                    </p>
                  </div>
                </div>
                {analysis.roi_projection?.key_assumptions?.length > 0 && (
                  <div className="text-xs text-gray-400 mt-3">
                    <strong>Assumptions:</strong> {analysis.roi_projection.key_assumptions.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Due Diligence */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                Due Diligence Checklist
              </h3>
              <div className="bg-[#0f0618] border border-[#2d1e50] rounded-lg p-4 space-y-3">
                {analysis.due_diligence?.verification_items?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Items to Verify:</h4>
                    {analysis.due_diligence.verification_items.map((item, i) => (
                      <div key={i} className="text-sm text-gray-300 flex items-start gap-2 mb-1">
                        <input type="checkbox" className="mt-1" />
                        {item}
                      </div>
                    ))}
                  </div>
                )}
                {analysis.due_diligence?.red_flags?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Red Flags:</h4>
                    {analysis.due_diligence.red_flags.map((flag, i) => (
                      <div key={i} className="text-sm text-red-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                        {flag}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Financial Viability */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-500" />
                Financial Viability
              </h3>
              <div className="bg-[#0f0618] border border-[#2d1e50] rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-xs text-gray-400">Break-even Timeline</span>
                    <p className="text-lg font-semibold text-white">
                      {analysis.financial_viability?.breakeven_months} months
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Scalability</span>
                    <p className="text-lg font-semibold text-white capitalize">
                      {analysis.financial_viability?.scalability}
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <span className="text-xs text-gray-400">Cash Flow Assessment</span>
                  <p className="text-sm text-gray-300 mt-1">
                    {analysis.financial_viability?.cash_flow_assessment}
                  </p>
                </div>
                {analysis.financial_viability?.exit_strategies?.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-400">Exit Strategies:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analysis.financial_viability.exit_strategies.map((strategy, i) => (
                        <Badge key={i} variant="outline" className="text-xs text-cyan-400">
                          {strategy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendation */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-500" />
                AI Recommendation
              </h3>
              <div className="bg-[#0f0618] border border-[#2d1e50] rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={`${getRecommendationColor(analysis.recommendation?.overall)} text-white uppercase`}>
                    {analysis.recommendation?.overall?.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="text-white capitalize">
                    {analysis.recommendation?.confidence} confidence
                  </Badge>
                </div>
                <p className="text-sm text-gray-300">
                  {analysis.recommendation?.reasoning}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}