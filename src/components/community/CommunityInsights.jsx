import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

/**
 * Shows AI-analyzed aggregated insights from community success stories
 */
export default function CommunityInsights({ category }) {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: stories = [] } = useQuery({
    queryKey: ['successStories', category],
    queryFn: () => base44.entities.SuccessStory.filter(
      category ? { idea_category: category } : {},
      '-created_date',
      20
    )
  });

  const handleAnalyze = async () => {
    if (stories.length === 0) {
      alert('No stories found for this category');
      return;
    }

    setIsLoading(true);
    const response = await base44.functions.invoke('analyzeSuccessStories', {
      ideaCategory: category || 'all',
      stories
    });
    setInsights(response.data);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Insights</h2>
          <p className="text-gray-600 mt-1">AI-powered analysis of {stories.length} success stories</p>
        </div>
        <Button
          onClick={handleAnalyze}
          disabled={isLoading || stories.length === 0}
          className="bg-violet-600 hover:bg-violet-700 gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Analyze Stories
            </>
          )}
        </Button>
      </div>

      {!insights && stories.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <p className="text-gray-700">Click "Analyze Stories" to get AI-powered community insights from {stories.length} success stories</p>
          </CardContent>
        </Card>
      )}

      {insights && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Success Probability */}
          <Card className="border-emerald-200 bg-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <CheckCircle className="w-5 h-5" />
                Success Probability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-600 mb-2">{insights.success_probability}</p>
              <Badge className="bg-emerald-200 text-emerald-800">Difficulty: {insights.difficulty_assessment}</Badge>
            </CardContent>
          </Card>

          {/* Average Metrics */}
          {insights.average_metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Community Averages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Time to Profit</p>
                    <p className="text-2xl font-bold text-blue-600">{insights.average_metrics.avg_time_to_profit_months || 0}</p>
                    <p className="text-xs text-gray-500">months</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Initial Investment</p>
                    <p className="text-2xl font-bold text-amber-600">${insights.average_metrics.avg_initial_investment?.toLocaleString() || 0}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-emerald-600">${insights.average_metrics.avg_monthly_revenue?.toLocaleString() || 0}</p>
                  </div>
                  <div className="p-4 bg-violet-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Average ROI</p>
                    <p className="text-2xl font-bold text-violet-600">{insights.average_metrics.avg_roi_percentage || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Patterns */}
          {insights.common_success_patterns?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Common Success Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.common_success_patterns.map((pattern, idx) => (
                    <li key={idx} className="flex gap-2 text-gray-700">
                      <span className="text-emerald-600">✓</span> {pattern}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Most Effective Strategies */}
          {insights.most_effective_strategies?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Most Effective Strategies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.most_effective_strategies.map((strategy, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-gray-900">{strategy.strategy}</p>
                      <Badge className={`${strategy.impact === 'high' ? 'bg-red-100 text-red-700' : strategy.impact === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {strategy.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{strategy.frequency} of success stories use this</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Common Challenges */}
          {insights.most_common_challenges?.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <AlertTriangle className="w-5 h-5" />
                  Common Challenges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.most_common_challenges.map((challenge, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-amber-200">
                    <p className="font-medium text-amber-900">{challenge.challenge}</p>
                    <p className="text-xs text-amber-700 my-1">{challenge.frequency} face this challenge</p>
                    {challenge.solutions?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-medium text-amber-900">Proven Solutions:</p>
                        {challenge.solutions.map((solution, sidx) => (
                          <p key={sidx} className="text-xs text-amber-700">→ {solution}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Key Success Factors */}
          {insights.key_success_factors?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                  Key Success Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.key_success_factors.map((factor, idx) => (
                    <li key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-900">{factor.factor}</span>
                      <Badge className={`${factor.importance === 'critical' ? 'bg-red-100 text-red-700' : factor.importance === 'important' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {factor.importance}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Community Recommendations */}
          {insights.community_recommendations?.length > 0 && (
            <Card className="border-violet-200 bg-violet-50">
              <CardHeader>
                <CardTitle className="text-violet-900">Community Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.community_recommendations.map((rec, idx) => (
                    <li key={idx} className="text-violet-800 flex gap-2">
                      <span className="text-violet-600 font-bold">{idx + 1}.</span> {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Insights Text */}
          {insights.timeline_insights && (
            <Card>
              <CardHeader>
                <CardTitle>Timeline Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{insights.timeline_insights}</p>
              </CardContent>
            </Card>
          )}

          {insights.investment_vs_return_analysis && (
            <Card>
              <CardHeader>
                <CardTitle>Investment vs Return Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{insights.investment_vs_return_analysis}</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}