import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Heart, X, TrendingUp, AlertCircle, Check } from 'lucide-react';

export default function AIDealsAdvisor() {
  const queryClient = useQueryClient();
  const [expandedDealId, setExpandedDealId] = useState(null);

  // Fetch AI-sourced deals
  const { data: aiDeals = [], isLoading, error } = useQuery({
    queryKey: ['ai-sourced-deals'],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('aiSourceAndAnalyzeDeals', {});
        return response.data?.deals || [];
      } catch (err) {
        console.error('Error fetching AI deals:', err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 30 // 30 minutes
  });

  // Mutations for user feedback
  const favoriteMutation = useMutation({
    mutationFn: async (deal) => {
      return base44.entities.AIDealsUserFeedback.create({
        deal_id: deal.id,
        deal_title: deal.deal_title,
        action: 'favorite',
        match_score: deal.ai_match_score
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-sourced-deals'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (deal) => {
      return base44.entities.AIDealsUserFeedback.create({
        deal_id: deal.id,
        deal_title: deal.deal_title,
        action: 'rejected',
        match_score: deal.ai_match_score
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-sourced-deals'] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || aiDeals.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-violet-600" />
          AI-Sourced Deals for You
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Personalized deal suggestions based on your portfolio goals and risk profile
        </p>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {aiDeals.map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{deal.deal_title}</CardTitle>
                      <CardDescription className="mt-2">
                        {deal.source_platform} • Industry: {deal.industry}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${
                          deal.ai_match_score >= 80
                            ? 'bg-emerald-100 text-emerald-700'
                            : deal.ai_match_score >= 60
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {deal.ai_match_score}% Match
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Why It Fits */}
                  <div className="bg-violet-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Check className="w-4 h-4 text-violet-600" />
                      Why This Fits Your Strategy
                    </p>
                    <p className="text-sm text-gray-700">{deal.fit_summary}</p>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Investment</p>
                      <p className="font-semibold text-gray-900">
                        ${deal.estimated_investment?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Estimated ROI</p>
                      <p className="font-semibold text-gray-900">
                        {deal.estimated_roi}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Risk Level</p>
                      <p className={`font-semibold ${
                        deal.risk_level === 'low' ? 'text-emerald-600' :
                        deal.risk_level === 'medium' ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {deal.risk_level.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Concerns if expanded */}
                  {expandedDealId === deal.id && deal.potential_concerns?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-amber-50 rounded-lg p-4"
                    >
                      <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Considerations
                      </p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {deal.potential_concerns.map((concern, i) => (
                          <li key={i} className="flex gap-2">
                            <span>•</span>
                            <span>{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => favoriteMutation.mutate(deal)}
                      disabled={favoriteMutation.isPending}
                    >
                      <Heart className="w-4 h-4" />
                      Favorite
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        expandedDealId === deal.id
                          ? setExpandedDealId(null)
                          : setExpandedDealId(deal.id)
                      }
                    >
                      {expandedDealId === deal.id ? 'Hide Details' : 'Details'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
                      onClick={() => rejectMutation.mutate(deal)}
                      disabled={rejectMutation.isPending}
                    >
                      <X className="w-4 h-4" />
                      Skip
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}