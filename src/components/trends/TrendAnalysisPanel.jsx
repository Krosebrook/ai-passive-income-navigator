import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Zap, Users } from 'lucide-react';

export default function TrendAnalysisPanel({ analysis, category }) {
  if (!analysis) return null;

  const getIconForCategory = () => {
    switch (category) {
      case 'opportunities': return <Target className="w-5 h-5" />;
      case 'niches': return <Zap className="w-5 h-5" />;
      case 'technologies': return <TrendingUp className="w-5 h-5" />;
      case 'consumer': return <Users className="w-5 h-5" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getCompetitionColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-amber-100 text-amber-700';
      case 'high': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-amber-100 text-amber-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      {(analysis.market_summary || analysis.niche_insights || analysis.tech_summary || analysis.consumer_insights) && (
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {getIconForCategory()}
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 leading-relaxed">
              {analysis.market_summary || analysis.niche_insights || analysis.tech_summary || analysis.consumer_insights}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Opportunities */}
      {analysis.opportunities && analysis.opportunities.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-violet-600" />
            Emerging Opportunities
          </h3>
          {analysis.opportunities.map((opp, idx) => (
            <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{opp.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{opp.description}</p>
                  </div>
                  <Badge className={getCompetitionColor(opp.competition)}>
                    {opp.competition} competition
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Growth Rate</p>
                    <p className="font-semibold text-emerald-600">{opp.growth_rate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Market Size</p>
                    <p className="font-semibold text-blue-600">{opp.market_size}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Timeline</p>
                    <p className="font-semibold text-violet-600">{opp.profitability_timeline}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Investment</p>
                    <p className="font-semibold text-amber-600">{opp.investment_required}</p>
                  </div>
                </div>
                {opp.key_insight && (
                  <p className="mt-3 text-xs bg-white rounded p-2 text-gray-600 italic border border-gray-200">
                    💡 {opp.key_insight}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Niches */}
      {analysis.niches && analysis.niches.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            Trending Niches
          </h3>
          {analysis.niches.map((niche, idx) => (
            <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{niche.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{niche.description}</p>
                  </div>
                  <Badge className={getCompetitionColor(niche.competition_level)}>
                    {niche.competition_level}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-500">Market Size</p>
                    <p className="font-semibold">{niche.market_size}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Entry Cost</p>
                    <p className="font-semibold">{niche.entry_cost}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">12-Month Forecast</p>
                    <p className="font-semibold text-emerald-600">{niche.growth_forecast}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600">Revenue Models: <span className="font-medium">{niche.revenue_models?.join(', ')}</span></p>
                  </div>
                  <p className="text-xs text-gray-500">Best for: <span className="font-medium text-gray-700">{niche.best_for}</span></p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Technologies */}
      {analysis.trending_technologies && analysis.trending_technologies.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Trending Technologies
          </h3>
          {analysis.trending_technologies.map((tech, idx) => (
            <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{tech.name}</h4>
                      <Badge variant="outline" className="text-xs">{tech.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Use cases: {tech.use_cases?.join(', ')}</p>
                  </div>
                  <Badge className={getDifficultyColor(tech.learning_difficulty)}>
                    {tech.learning_difficulty} to learn
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-500">Adoption Trend</p>
                    <p className="font-semibold text-emerald-600">{tech.adoption_trend}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Cost to Start</p>
                    <p className="font-semibold">{tech.startup_cost}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Revenue Potential</p>
                    <p className="font-semibold">{tech.revenue_potential}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Market Demand</p>
                    <p className="font-semibold text-violet-600">{tech.market_demand}</p>
                  </div>
                </div>
                <p className="text-xs bg-amber-50 rounded p-2 text-amber-700 border border-amber-200">
                  📌 {tech.recommendation}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Consumer Behavior */}
      {(analysis.behavioral_shifts || analysis.high_value_segments) && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-600" />
            Consumer Insights
          </h3>
          
          {analysis.behavioral_shifts && analysis.behavioral_shifts.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm">Behavioral Shifts</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.behavioral_shifts.map((shift, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-pink-600 font-bold">•</span>
                      {shift}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {analysis.high_value_segments && analysis.high_value_segments.length > 0 && (
            <div className="space-y-2">
              {analysis.high_value_segments.map((segment, idx) => (
                <Card key={idx} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{segment.segment}</h4>
                      <Badge variant="outline">{segment.size}</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Spending Capacity:</span> {segment.spending_capacity}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Preferred Formats:</span> {segment.preferred_formats?.join(', ')}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Pain Points:</span> {segment.pain_points?.join(', ')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}