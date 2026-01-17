import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Bookmark, Plus, Eye, Lock, Globe, Share2 } from 'lucide-react';

export default function SharedWatchlists() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [user, setUser] = useState(null);
  const [newWatchlist, setNewWatchlist] = useState({
    name: '',
    description: '',
    is_public: false
  });

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: watchlists = [] } = useQuery({
    queryKey: ['shared-watchlists'],
    queryFn: () => base44.entities.SharedWatchlist.list('-created_date')
  });

  const myWatchlists = watchlists.filter(w => 
    w.owner_email === user?.email || 
    w.collaborators?.some(c => c.email === user?.email)
  );

  const createWatchlistMutation = useMutation({
    mutationFn: (data) => base44.entities.SharedWatchlist.create({
      ...data,
      owner_email: user?.email,
      deal_ids: [],
      portfolio_idea_ids: []
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-watchlists'] });
      setShowCreateModal(false);
      setNewWatchlist({ name: '', description: '', is_public: false });
      toast.success('Watchlist created!');
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Shared Watchlists</h2>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Watchlist
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {myWatchlists.map((watchlist) => (
          <Card key={watchlist.id} className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Bookmark className="w-5 h-5 text-violet-400" />
                {watchlist.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-400 line-clamp-2">
                {watchlist.description || 'No description'}
              </p>
              <div className="flex items-center gap-2">
                {watchlist.is_public ? (
                  <Badge className="bg-green-600 text-white">
                    <Globe className="w-3 h-3 mr-1" />
                    Public
                  </Badge>
                ) : (
                  <Badge className="bg-gray-600 text-white">
                    <Lock className="w-3 h-3 mr-1" />
                    Private
                  </Badge>
                )}
                <Badge variant="outline" className="text-white">
                  <Eye className="w-3 h-3 mr-1" />
                  {watchlist.view_count || 0} views
                </Badge>
              </div>
              <div className="text-sm text-gray-400">
                {(watchlist.deal_ids?.length || 0) + (watchlist.portfolio_idea_ids?.length || 0)} items
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Share2 className="w-3 h-3 mr-2" />
                Share
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Watchlist Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Shared Watchlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Watchlist Name</label>
              <Input
                value={newWatchlist.name}
                onChange={(e) => setNewWatchlist({ ...newWatchlist, name: e.target.value })}
                placeholder="e.g., Top SaaS Opportunities"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                value={newWatchlist.description}
                onChange={(e) => setNewWatchlist({ ...newWatchlist, description: e.target.value })}
                placeholder="What's this watchlist for?"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="public"
                checked={newWatchlist.is_public}
                onChange={(e) => setNewWatchlist({ ...newWatchlist, is_public: e.target.checked })}
              />
              <label htmlFor="public" className="text-sm">
                Make this watchlist public
              </label>
            </div>
            <Button 
              onClick={() => createWatchlistMutation.mutate(newWatchlist)}
              disabled={!newWatchlist.name}
              className="w-full"
            >
              Create Watchlist
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}