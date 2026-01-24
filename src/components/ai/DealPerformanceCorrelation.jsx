import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, AlertCircle, RefreshCw, ExternalLink, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DealPerformanceCorrelation() {
  const [loading, setLoading] = useState(false);
  const [correlationData, setCorrelationData] = useState(null);
  const [selectedDeals, setSelectedDeals] = useState([]);

  const { data: deals } = useQuery({
    queryKey: ['sourced-deals'],
    queryFn: () => base44.entities.SourcedDealOpportunity.filter({ status: 'accepted' }),
    initialData: []
  });

  const { data: investments } = useQuery({
    queryKey: ['investments'],
    queryFn: () => base44.entities.Investment.list(),
    initialData: []
  });

  useEffect(() => {
    // Auto-select deals with investments
    if (investments.length > 0 && deals.length > 0) {
      const dealIds = investments.map(inv => inv.deal_id).filter(Boolean);
      setSelectedDeals(dealIds);
    }
  }, [investments, deals]);

  const analyzeCorrelations = async () => {
    if (selectedDeals.length === 0) return;

    setLoading(true);
    try {
      const response = await base44.functions.invoke('correlateNewsWithPerformance', {
        deal_ids: selectedDeals,
        timeframe: '30d'
      });

      setCorrelationData(response.data);
    } catch (error) {
      console.error('Correlation analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (score) => {
    if (score > 0.3) return 'text-green-500';
    if (score < -0.3) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getSentimentIcon = (score) => {
    if (score > 0.3) return <TrendingUp className="w-4 h-4" />;
    if (score < -0.3) return <TrendingDown className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">News-Performance Correlation</h2>
          <p className="text-[#64748b] mt-1">Analyze how recent news impacts your deal performance</p>
        </div>
        <Button
          onClick={analyzeCorrelations}
          disabled={loading || selectedDeals.length === 0}
          className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Target className="w-4 h-4 mr-2" />
              Analyze {selectedDeals.length} Deal{selectedDeals.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </div>

      {!correlationData && selectedDeals.length > 0 && (
        <Card className="card-dark border-[#8b85f7]/20">
          <CardContent className="p-6 text-center">
            <Target className="w-12 h-12 text-[#8b85f7] mx-auto mb-3" />
            <h3 className="font-medium mb-2">Ready to Analyze</h3>
            <p className="text-[#64748b] text-sm mb-4">
              Click "Analyze" to correlate recent news with your {selectedDeals.length} deal{selectedDeals.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      )}

      {correlationData && (
        <>
          {/* Portfolio Overview */}
          <Card className="card-dark">
            <CardHeader>
              <CardTitle>Portfolio Impact Summary</CardTitle>
              <CardDescription>Overall sentiment and risk assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                  <div className="flex items-center gap-2 mb-2">
                    {getSentimentIcon(correlationData.portfolio_analysis.overall_sentiment)}
                    <span className="text-sm text-[#64748b]">Overall Sentiment</span>
                  </div>
                  <div className={`text-2xl font-bold ${getSentimentColor(correlationData.portfolio_analysis.overall_sentiment)}`}>
                    {correlationData.portfolio_analysis.overall_sentiment > 0 ? 'Positive' :
                     correlationData.portfolio_analysis.overall_sentiment < 0 ? 'Negative' : 'Neutral'}
                  </div>
                  <div className="text-xs text-[#64748b] mt-1">
                    {Math.abs(correlationData.portfolio_analysis.overall_sentiment * 100).toFixed(0)}% strength
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm text-[#64748b]">Risk Score</span>
                  </div>
                  <div className={`text-2xl font-bold ${
                    correlationData.portfolio_analysis.portfolio_risk_score > 70 ? 'text-red-500' :
                    correlationData.portfolio_analysis.portfolio_risk_score > 40 ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {correlationData.portfolio_analysis.portfolio_risk_score}/100
                  </div>
                  <div className="text-xs text-[#64748b] mt-1">
                    {correlationData.portfolio_analysis.portfolio_risk_score > 70 ? 'High risk' :
                     correlationData.portfolio_analysis.portfolio_risk_score > 40 ? 'Moderate risk' : 'Low risk'}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-[#8b85f7]" />
                    <span className="text-sm text-[#64748b]">Diversification</span>
                  </div>
                  <div className="text-2xl font-bold text-[#8b85f7]">
                    {correlationData.portfolio_analysis.diversification_score}/100
                  </div>
                  <div className="text-xs text-[#64748b] mt-1">
                    {correlationData.portfolio_analysis.diversification_score > 70 ? 'Well diversified' :
                     correlationData.portfolio_analysis.diversification_score > 40 ? 'Moderately diversified' : 'Concentrated'}
                  </div>
                </div>
              </div>

              {correlationData.portfolio_analysis.recommendations && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-[#8b85f7]">Recommendations</h4>
                  {correlationData.portfolio_analysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded bg-[#0f0618] text-sm">
                      <span className="text-[#8b85f7] mt-0.5">•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* High-Impact Items */}
          {correlationData.portfolio_analysis.high_impact_items?.length > 0 && (
            <Card className="card-dark border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="w-5 h-5" />
                  High-Impact Alerts
                </CardTitle>
                <CardDescription>Deals requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {correlationData.portfolio_analysis.high_impact_items.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{item.deal_id}</h4>
                      <Badge className="bg-red-500/20 text-red-500">{item.urgency}</Badge>
                    </div>
                    <p className="text-sm text-[#64748b]">{item.impact}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Individual Deal Correlations */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Deal-by-Deal Analysis</h3>
            {correlationData.correlations.map((correlation, idx) => (
              <motion.div
                key={correlation.deal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="card-dark">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{correlation.deal.title}</CardTitle>
                        <CardDescription>{correlation.deal.industry}</CardDescription>
                      </div>
                      <Badge className={
                        correlation.correlation.correlation_strength > 70 ? 'bg-green-500/20 text-green-500' :
                        correlation.correlation.correlation_strength > 40 ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-gray-500/20 text-gray-500'
                      }>
                        {correlation.correlation.correlation_strength}% correlation
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Sentiment Impact */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f0618]">
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(correlation.correlation.sentiment_impact)}
                        <span className="font-medium">News Sentiment Impact</span>
                      </div>
                      <span className={`font-bold ${getSentimentColor(correlation.correlation.sentiment_impact)}`}>
                        {(correlation.correlation.sentiment_impact * 100).toFixed(0)}%
                      </span>
                    </div>

                    {/* Key Events */}
                    {correlation.correlation.key_events?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-[#8b85f7] mb-2">Key Events</h4>
                        <div className="space-y-2">
                          {correlation.correlation.key_events.map((event, i) => (
                            <div key={i} className="flex items-start gap-2 p-2 rounded bg-[#0f0618] text-sm">
                              <span className="text-[#8b85f7]">•</span>
                              <div className="flex-1">
                                <div className="font-medium">{event.event}</div>
                                <div className="text-xs text-[#64748b] mt-0.5">
                                  {event.date} • Impact: {event.impact}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Predicted Impact */}
                    {correlation.correlation.predicted_impact && (
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="p-2 rounded bg-[#0f0618]">
                          <div className="text-xs text-[#64748b] mb-1">Short-term</div>
                          <div>{correlation.correlation.predicted_impact.short_term}</div>
                        </div>
                        <div className="p-2 rounded bg-[#0f0618]">
                          <div className="text-xs text-[#64748b] mb-1">Medium-term</div>
                          <div>{correlation.correlation.predicted_impact.medium_term}</div>
                        </div>
                        <div className="p-2 rounded bg-[#0f0618]">
                          <div className="text-xs text-[#64748b] mb-1">Long-term</div>
                          <div>{correlation.correlation.predicted_impact.long_term}</div>
                        </div>
                      </div>
                    )}

                    {/* Recommended Actions */}
                    {correlation.correlation.recommended_actions?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-green-500 mb-2">Recommended Actions</h4>
                        <ul className="space-y-1">
                          {correlation.correlation.recommended_actions.map((action, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-green-500">✓</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}