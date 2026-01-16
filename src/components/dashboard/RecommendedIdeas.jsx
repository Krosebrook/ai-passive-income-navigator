import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function RecommendedIdeas() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const { data: preferences } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.list();
      return prefs.length > 0 ? prefs[0] : null;
    }
  });

  const { data: portfolio = [] } = useQuery({
    queryKey: ['portfolioIdeas'],
    queryFn: () => base44.entities.PortfolioIdea.list()
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => base44.entities.Bookmark.list()
  });

  const generateRecommendations = async () => {
    setIsLoading(true);
    const response = await base44.functions.invoke('generateRecommendations', {
      preferences,
      currentPortfolio: portfolio,
      bookmarkedIdeas: bookmarks
    });
    setRecommendations(response.data);
    setIsLoading(false);
  };

  const addToPortfolioMutation = useMutation({
    mutationFn: (idea) => base44.entities.PortfolioIdea.create({
      title: idea.idea_name,
      description: idea.description,
      category: 'digital_products',
      status: 'exploring',
      priority: 'medium',
      notes: `AI Recommendation - Fit Score: ${idea.fit_score}%\nWhy: ${idea.why_recommended}`
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioIdeas'] });
    }
  });

  if (!preferences) {
    return (
      <Card className="border-violet-200 bg-violet-50">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-gray-600">Complete your preferences to get personalized recommendations</p>
          <Link to={createPageUrl('ProfileSettings')}>
            <Button size="sm" className="mt-3">Go to Settings</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            Recommended For You
          </h3>
          <p className="text-sm text-gray-500 mt-1">AI-powered ideas tailored to your profile</p>
        </div>
        <Button
          onClick={generateRecommendations}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Generate
            </>
          )}
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mb-2" />
          <p className="text-sm text-gray-600">Analyzing your profile...</p>
        </div>
      )}

      {recommendations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Summary */}
          <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50">
            <CardContent className="p-4">
              <p className="text-sm text-gray-700">{recommendations.personalization_summary}</p>
              {recommendations.portfolio_gaps && recommendations.portfolio_gaps.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">Portfolio Gaps:</p>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.portfolio_gaps.map((gap, idx) => (
                      <Badge key={idx} variant="outline">{gap}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <div className="space-y-3">
            {recommendations.recommendations?.map((idea, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{idea.idea_name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{idea.description}</p>
                      </div>
                      <Badge className="bg-violet-100 text-violet-700 flex-shrink-0">
                        {idea.fit_score}% match
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-700 italic mb-3">
                      💡 {idea.why_recommended}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                      <div>
                        <p className="text-gray-500">Difficulty</p>
                        <Badge variant="outline">{idea.difficulty}</Badge>
                      </div>
                      <div>
                        <p className="text-gray-500">Time/Week</p>
                        <p className="font-medium">{idea.time_commitment}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Startup</p>
                        <p className="font-medium">{idea.startup_cost}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">ROI</p>
                        <p className="font-medium text-emerald-600">{idea.estimated_roi}</p>
                      </div>
                    </div>

                    <div className="mb-3 text-xs">
                      <p className="text-gray-600">Timeline: {idea.timeline_to_profit}</p>
                    </div>

                    <Button
                      onClick={() => addToPortfolioMutation.mutate(idea)}
                      disabled={addToPortfolioMutation.isPending}
                      size="sm"
                      className="w-full gap-2 bg-violet-600 hover:bg-violet-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add to Portfolio
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}