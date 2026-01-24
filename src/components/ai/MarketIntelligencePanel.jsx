import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { TrendingUp, TrendingDown, AlertTriangle, Sparkles, RefreshCw, ExternalLink, Target, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketIntelligencePanel({ userPreferences }) {
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [arbitrage, setArbitrage] = useState(null);
  const [activeView, setActiveView] = useState('overview');

  const fetchMarketIntel = async () => {
    setLoading(true);
    try {
      const industries = userPreferences?.target_industries || ['Technology', 'Real Estate'];
      
      const [marketRes, sentimentRes, arbitrageRes] = await Promise.all([
        base44.functions.invoke('fetchRealTimeMarketData', { 
          industries,
          keywords: userPreferences?.existing_skills 
        }),
        base44.functions.invoke('analyzeNewsSentiment', { 
          topic: industries.join(', '),
          timeframe: '7d' 
        }),
        base44.functions.invoke('detectArbitrageOpportunities', { 
          industries,
          user_preferences: userPreferences 
        })
      ]);

      setMarketData(marketRes.data);
      setSentiment(sentimentRes.data);
      setArbitrage(arbitrageRes.data);
    } catch (error) {
      console.error('Market intel fetch failed:', error);
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
    return <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Real-Time Market Intelligence</h2>
          <p className="text-[#64748b] mt-1">Live data, sentiment analysis, and arbitrage detection</p>
        </div>
        <Button
          onClick={fetchMarketIntel}
          disabled={loading}
          className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze Markets
            </>
          )}
        </Button>
      </div>

      {/* View Tabs */}
      {(marketData || sentiment || arbitrage) && (
        <div className="flex gap-2">
          <Button
            variant={activeView === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveView('overview')}
            size="sm"
          >
            Overview
          </Button>
          <Button
            variant={activeView === 'trends' ? 'default' : 'ghost'}
            onClick={() => setActiveView('trends')}
            size="sm"
          >
            Trends
          </Button>
          <Button
            variant={activeView === 'sentiment' ? 'default' : 'ghost'}
            onClick={() => setActiveView('sentiment')}
            size="sm"
          >
            Sentiment
          </Button>
          <Button
            variant={activeView === 'arbitrage' ? 'default' : 'ghost'}
            onClick={() => setActiveView('arbitrage')}
            size="sm"
          >
            Opportunities
          </Button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Overview */}
        {activeView === 'overview' && marketData && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Card className="card-dark">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-[#8b85f7]" />
                  Market Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gradient">
                  {marketData.structured?.trends?.length || 0}
                </div>
                <p className="text-[#64748b] text-sm">Active trends detected</p>
              </CardContent>
            </Card>

            <Card className="card-dark">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-[#00b7eb]" />
                  Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#00b7eb]">
                  {arbitrage?.top_opportunities?.length || 0}
                </div>
                <p className="text-[#64748b] text-sm">Arbitrage opportunities</p>
              </CardContent>
            </Card>

            <Card className="card-dark">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  {sentiment && getSentimentIcon(sentiment.analysis?.overall_sentiment)}
                  Market Sentiment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getSentimentColor(sentiment?.analysis?.overall_sentiment)}`}>
                  {sentiment?.analysis?.sentiment_label || 'N/A'}
                </div>
                <p className="text-[#64748b] text-sm">
                  {Math.round((sentiment?.analysis?.confidence || 0) * 100)}% confidence
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Trends View */}
        {activeView === 'trends' && marketData && (
          <motion.div
            key="trends"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="card-dark">
              <CardHeader>
                <CardTitle>Key Market Trends</CardTitle>
                <CardDescription>Real-time trend analysis with impact scoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {marketData.structured?.trends?.map((trend, idx) => (
                  <div key={idx} className="flex items-start justify-between p-3 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                    <div className="flex-1">
                      <h4 className="font-medium">{trend.trend}</h4>
                      <p className="text-sm text-[#64748b] mt-1">{trend.timeline}</p>
                    </div>
                    <Badge className={`${
                      trend.impact_score >= 8 ? 'bg-green-500/20 text-green-500' :
                      trend.impact_score >= 5 ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      Impact: {trend.impact_score}/10
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {marketData.structured?.demand_signals && (
              <Card className="card-dark">
                <CardHeader>
                  <CardTitle>Demand Signals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {marketData.structured.demand_signals.map((signal, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-[#0f0618]">
                      <div>
                        <span className="font-medium">{signal.signal}</span>
                        <span className="text-xs text-[#64748b] ml-2">from {signal.source}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-4 rounded ${
                              i < signal.strength ? 'bg-[#8b85f7]' : 'bg-[#2d1e50]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Sentiment View */}
        {activeView === 'sentiment' && sentiment && (
          <motion.div
            key="sentiment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="card-dark">
              <CardHeader>
                <CardTitle>Sentiment Analysis</CardTitle>
                <CardDescription>News sentiment and market implications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-[#8b85f7]/10 to-[#00b7eb]/10 border border-[#8b85f7]/20">
                  <div>
                    <div className="text-sm text-[#64748b] mb-1">Overall Sentiment</div>
                    <div className={`text-2xl font-bold ${getSentimentColor(sentiment.analysis.overall_sentiment)}`}>
                      {sentiment.analysis.sentiment_label}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[#64748b] mb-1">Confidence</div>
                    <div className="text-2xl font-bold text-[#8b85f7]">
                      {Math.round(sentiment.analysis.confidence * 100)}%
                    </div>
                  </div>
                </div>

                {sentiment.analysis.key_events?.map((event, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{event.event}</h4>
                      <Badge className={
                        event.sentiment === 'positive' ? 'bg-green-500/20 text-green-500' :
                        event.sentiment === 'negative' ? 'bg-red-500/20 text-red-500' :
                        'bg-yellow-500/20 text-yellow-500'
                      }>
                        {event.sentiment}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#64748b]">
                      <span>{event.date}</span>
                      <span>•</span>
                      <span>Impact: {event.impact_score}/10</span>
                    </div>
                  </div>
                ))}

                {sentiment.analysis.market_implications && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-[#8b85f7]">Market Implications</h4>
                    {sentiment.analysis.market_implications.map((impl, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 rounded bg-[#0f0618]">
                        <Zap className="w-4 h-4 text-[#00b7eb] mt-0.5" />
                        <div>
                          <p className="text-sm">{impl.implication}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#64748b]">
                            <span>{impl.timeframe}</span>
                            <span>•</span>
                            <span>{Math.round(impl.probability * 100)}% probability</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Arbitrage Opportunities */}
        {activeView === 'arbitrage' && arbitrage && (
          <motion.div
            key="arbitrage"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="card-dark">
              <CardHeader>
                <CardTitle>Arbitrage Opportunities</CardTitle>
                <CardDescription>
                  Found {arbitrage.total_found} opportunities, showing top {arbitrage.top_opportunities.length}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {arbitrage.top_opportunities.map((opp, idx) => (
                  <div 
                    key={opp.id} 
                    className="p-4 rounded-lg bg-gradient-to-br from-[#8b85f7]/5 to-[#00b7eb]/5 border border-[#8b85f7]/20 hover:border-[#8b85f7]/40 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-[#8b85f7]/20 text-[#8b85f7]">#{idx + 1}</Badge>
                          <Badge variant="outline">{opp.type}</Badge>
                        </div>
                        <h4 className="text-lg font-bold">{opp.title}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gradient">{opp.opportunity_score}</div>
                        <div className="text-xs text-[#64748b]">Score</div>
                      </div>
                    </div>

                    <p className="text-[#64748b] mb-3">{opp.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-[#64748b]">Expected Return</div>
                        <div className="font-medium text-green-500">{opp.expected_return}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#64748b]">Risk Level</div>
                        <div className={`font-medium ${
                          opp.risk_level === 'low' ? 'text-green-500' :
                          opp.risk_level === 'medium' ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>
                          {opp.risk_level}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#64748b]">Time Horizon</div>
                        <div className="font-medium">{opp.time_horizon}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#64748b]">Confidence</div>
                        <div className="font-medium text-[#8b85f7]">{opp.confidence}%</div>
                      </div>
                    </div>

                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-[#8b85f7] hover:text-[#a89eff]">
                        View Execution Strategy
                      </summary>
                      <div className="mt-3 space-y-3">
                        <div>
                          <h5 className="text-xs font-medium text-[#64748b] mb-2">Entry Strategy</h5>
                          <ol className="space-y-1">
                            {opp.entry_strategy.map((step, i) => (
                              <li key={i} className="text-sm flex gap-2">
                                <span className="text-[#8b85f7]">{i + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                        <div>
                          <h5 className="text-xs font-medium text-[#64748b] mb-2">Exit Criteria</h5>
                          <ul className="space-y-1">
                            {opp.exit_criteria.map((criterion, i) => (
                              <li key={i} className="text-sm flex gap-2">
                                <span className="text-green-500">✓</span>
                                <span>{criterion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </details>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sources */}
      {marketData?.sources && marketData.sources.length > 0 && (
        <Card className="card-dark">
          <CardHeader>
            <CardTitle className="text-sm">Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {marketData.sources.slice(0, 5).map((source, idx) => (
                <a
                  key={idx}
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#8b85f7] hover:text-[#a89eff] flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Source {idx + 1}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}