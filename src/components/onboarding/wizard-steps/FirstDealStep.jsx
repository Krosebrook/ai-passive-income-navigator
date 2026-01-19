import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookmarkPlus, TrendingUp, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function FirstDealStep({ data, onNext }) {
  const [savedDealId, setSavedDealId] = useState(null);
  const queryClient = useQueryClient();

  const { data: deals, isLoading } = useQuery({
    queryKey: ['onboarding-deals'],
    queryFn: async () => {
      const allDeals = await base44.entities.SourcedDealOpportunity.filter(
        { status: 'pending' },
        '-match_score',
        3
      );
      return allDeals;
    }
  });

  const saveDealMutation = useMutation({
    mutationFn: async (dealId) => {
      await base44.entities.SourcedDealOpportunity.update(dealId, {
        status: 'accepted'
      });
      return dealId;
    },
    onSuccess: (dealId) => {
      setSavedDealId(dealId);
      toast.success('Deal saved to your pipeline!');
    }
  });

  const handleComplete = () => {
    if (savedDealId) {
      onNext({ firstDealSaved: savedDealId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#8b85f7]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Save Your First Deal</h2>
        <p className="text-gray-400">
          Here are some top-matched opportunities based on your preferences
        </p>
      </div>

      {deals && deals.length > 0 ? (
        <div className="space-y-4">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className={`card-dark p-4 border-2 transition-all ${
                savedDealId === deal.id
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-[#2d1e50]'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{deal.title}</h3>
                  <p className="text-sm text-gray-400">{deal.industry}</p>
                </div>
                {deal.match_score && (
                  <Badge className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] text-white">
                    {deal.match_score}% Match
                  </Badge>
                )}
              </div>

              <p className="text-sm text-gray-300 mb-4 line-clamp-2">{deal.summary}</p>

              <div className="flex gap-4 mb-4 text-sm">
                {deal.estimated_roi && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-gray-400">ROI:</span>
                    <span className="font-semibold text-green-400">{deal.estimated_roi}%</span>
                  </div>
                )}
                {deal.risk_score && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-400">Risk:</span>
                    <span className="font-semibold text-orange-400">{deal.risk_score}/10</span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => saveDealMutation.mutate(deal.id)}
                disabled={savedDealId === deal.id || saveDealMutation.isPending}
                className={`w-full ${
                  savedDealId === deal.id
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gradient-to-r from-[#8b85f7] to-[#00b7eb]'
                }`}
              >
                {savedDealId === deal.id ? (
                  <>
                    <BookmarkPlus className="w-4 h-4 mr-2" />
                    Saved!
                  </>
                ) : saveDealMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4 mr-2" />
                    Save to Pipeline
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-dark p-8 text-center">
          <Sparkles className="w-12 h-12 text-[#8b85f7] mx-auto mb-4" />
          <p className="text-gray-400">
            No deals available yet. Our AI is sourcing opportunities for you!
          </p>
        </div>
      )}

      {savedDealId && (
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleComplete}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-emerald-500"
          >
            Complete Setup
            <Sparkles className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}