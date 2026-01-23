import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Eye, Users, Plus, Star, TrendingUp, 
  Share2, Bookmark, X 
} from 'lucide-react';
import { toast } from 'sonner';

export default function SharedWatchlistManager() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedWatchlist, setSelectedWatchlist] = useState(null);
  const [newWatchlist, setNewWatchlist] = useState({
    name: '',
    description: '',
    is_public: false,
    tags: []
  });

  const { data: watchlists = [] } = useQuery({
    queryKey: ['shared-watchlists'],
    queryFn: async () => {
      const myWatchlists = await base44.entities.SharedWatchlist.filter({});
      return myWatchlists.sort((a, b) => b.subscribers.length - a.subscribers.length);
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => await base44.entities.SharedWatchlist.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-watchlists'] });
      setShowCreateDialog(false);
      setNewWatchlist({ name: '', description: '', is_public: false, tags: [] });
      toast.success('Watchlist created!');
    }
  });

  const subscribeMutation = useMutation({
    mutationFn: async (watchlistId) => {
      const watchlist = await base44.entities.SharedWatchlist.get(watchlistId);
      const user = await base44.auth.me();
      const subscribers = watchlist.subscribers || [];
      
      if (!subscribers.includes(user.email)) {
        subscribers.push(user.email);
        await base44.entities.SharedWatchlist.update(watchlistId, { subscribers });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-watchlists'] });
      toast.success('Subscribed to watchlist');
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] bg-clip-text text-transparent">
            Community Watchlists
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Discover and share investment opportunities
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Watchlist
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchlists.map((watchlist) => (
          <Card key={watchlist.id} className="card-dark hover:border-[#8b85f7]/50 transition-all cursor-pointer"
            onClick={() => setSelectedWatchlist(watchlist)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-white">{watchlist.name}</CardTitle>
                  <p className="text-xs text-gray-400 mt-1">by {watchlist.owner_email}</p>
                </div>
                {watchlist.is_public && (
                  <Badge className="bg-[#00b7eb]/20 text-[#00b7eb]">
                    <Eye className="w-3 h-3 mr-1" />
                    Public
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-300 line-clamp-2">{watchlist.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Bookmark className="w-4 h-4" />
                  {watchlist.deals?.length || 0} deals
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {watchlist.subscribers?.length || 0} followers
                </span>
              </div>

              {watchlist.performance_summary && (
                <div className="p-2 rounded-lg bg-[#0f0618] border border-[#2d1e50]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Avg ROI</span>
                    <span className="text-green-500 font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {watchlist.performance_summary.avg_roi}%
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {watchlist.tags?.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button 
                size="sm"
                className="w-full bg-gradient-to-r from-[#8b85f7] to-[#00b7eb]"
                onClick={(e) => {
                  e.stopPropagation();
                  subscribeMutation.mutate(watchlist.id);
                }}
              >
                <Star className="w-3 h-3 mr-2" />
                Subscribe
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#1a0f2e] border-[#2d1e50]">
          <DialogHeader>
            <DialogTitle className="text-gradient">Create New Watchlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Watchlist Name"
              value={newWatchlist.name}
              onChange={(e) => setNewWatchlist({ ...newWatchlist, name: e.target.value })}
            />
            <Textarea
              placeholder="Description"
              value={newWatchlist.description}
              onChange={(e) => setNewWatchlist({ ...newWatchlist, description: e.target.value })}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Make Public</span>
              <Switch
                checked={newWatchlist.is_public}
                onCheckedChange={(checked) => setNewWatchlist({ ...newWatchlist, is_public: checked })}
              />
            </div>
            <Button 
              className="w-full btn-primary"
              onClick={() => createMutation.mutate(newWatchlist)}
              disabled={!newWatchlist.name}
            >
              Create Watchlist
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}