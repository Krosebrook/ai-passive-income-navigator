import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Reusable Watch toggle button for any SourcedDealOpportunity deal.
 * Invalidates all relevant query keys on toggle.
 */
export default function WatchButton({ deal, size = 'sm', className = '' }) {
  const queryClient = useQueryClient();
  const isWatched = !!deal.is_watched;

  const toggleMutation = useMutation({
    mutationFn: async () => {
      const nowWatching = !isWatched;
      return base44.entities.SourcedDealOpportunity.update(deal.id, {
        is_watched: nowWatching,
        watched_at: nowWatching ? new Date().toISOString() : null,
        watch_snapshot: nowWatching
          ? {
              risk_score: deal.risk_score ?? null,
              estimated_roi: deal.estimated_roi ?? null,
              match_score: deal.match_score ?? null,
              status: deal.status ?? null,
            }
          : null,
      });
    },
    onSuccess: (_, __, ___) => {
      const nowWatching = !isWatched;
      queryClient.invalidateQueries({ queryKey: ['sourced-deals'] });
      queryClient.invalidateQueries({ queryKey: ['sourced-deals-charts'] });
      queryClient.invalidateQueries({ queryKey: ['watchlist-deals'] });
      toast.success(nowWatching ? 'Added to Watchlist' : 'Removed from Watchlist');
    },
  });

  return (
    <Button
      size={size}
      variant="ghost"
      className={`gap-1 ${
        isWatched
          ? 'text-[#8b85f7] hover:text-[#ef4444]'
          : 'text-[#64748b] hover:text-[#8b85f7]'
      } ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        toggleMutation.mutate();
      }}
      disabled={toggleMutation.isPending}
      title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
    >
      {isWatched ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
    </Button>
  );
}