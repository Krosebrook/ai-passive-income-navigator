import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Users, MessageCircle, Heart, Share2, Plus,
  Search, User, Send
} from 'lucide-react';

import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { GRADIENT_OPTIONS } from '@/components/data/ideasCatalog';

export default function Community() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareForm, setShareForm] = useState({
    idea_title: '',
    idea_description: '',
    idea_category: 'digital_products'
  });
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: sharedIdeas = [], isLoading } = useQuery({
    queryKey: ['sharedIdeas'],
    queryFn: () => base44.entities.SharedIdea.filter({ is_public: true }, '-created_date')
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['ideaComments', selectedIdea?.id],
    queryFn: () => selectedIdea 
      ? base44.entities.IdeaComment.filter({ shared_idea_id: selectedIdea.id }, '-created_date')
      : [],
    enabled: !!selectedIdea
  });

  const shareMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.SharedIdea.create({
        ...data,
        shared_by_name: user?.full_name || 'Anonymous',
        is_public: true,
        idea_color: GRADIENT_OPTIONS[Math.floor(Math.random() * GRADIENT_OPTIONS.length)],
        likes_count: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedIdeas'] });
      setShowShareModal(false);
      setShareForm({ idea_title: '', idea_description: '', idea_category: 'digital_products' });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.IdeaComment.create({
        shared_idea_id: selectedIdea.id,
        content: newComment,
        author_name: user?.full_name || 'Anonymous',
        author_email: user?.email || ''
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideaComments', selectedIdea?.id] });
      setNewComment('');
    }
  });

  const filteredIdeas = sharedIdeas.filter(idea =>
    !searchQuery ||
    idea.idea_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.idea_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <LoadingSpinner text="Loading community ideas..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Community"
          subtitle="Discover and share passive income ideas"
          gradient="from-pink-600 to-rose-600"
          action={
            <Button
              onClick={() => setShowShareModal(true)}
              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 gap-2"
            >
              <Plus className="w-5 h-5" />
              Share Idea
            </Button>
          }
        />

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search community ideas..."
              className="pl-12 h-12 bg-white rounded-xl"
            />
          </div>
        </motion.div>

        {/* Ideas Grid */}
        {filteredIdeas.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No community ideas yet"
            description="Be the first to share your passive income idea with the community!"
            action={() => setShowShareModal(true)}
            actionLabel="Share Your Idea"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredIdeas.map((idea, index) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="bg-white border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                  onClick={() => setSelectedIdea(idea)}
                >
                  <div className={`h-2 bg-gradient-to-r ${idea.idea_color || 'from-pink-500 to-rose-500'}`} />
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{idea.shared_by_name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(idea.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {idea.idea_title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-3 mb-4">
                      {idea.idea_description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {idea.likes_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        Comments
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-pink-600" />
              Share Your Idea
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Idea Title</label>
              <Input
                value={shareForm.idea_title}
                onChange={(e) => setShareForm({ ...shareForm, idea_title: e.target.value })}
                placeholder="e.g., AI-Powered Newsletter Business"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
              <Textarea
                value={shareForm.idea_description}
                onChange={(e) => setShareForm({ ...shareForm, idea_description: e.target.value })}
                placeholder="Describe your idea in detail..."
                rows={4}
              />
            </div>
            <Button
              onClick={() => shareMutation.mutate(shareForm)}
              disabled={!shareForm.idea_title || !shareForm.idea_description || shareMutation.isPending}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
            >
              Share with Community
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Idea Detail Modal */}
      <Dialog open={!!selectedIdea} onOpenChange={() => setSelectedIdea(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedIdea?.idea_title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-6 mt-4">
            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedIdea?.shared_by_name}</p>
                <p className="text-sm text-gray-500">
                  Shared on {selectedIdea && new Date(selectedIdea.created_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600">{selectedIdea?.idea_description}</p>

            {/* Comments */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Comments ({comments.length})
              </h4>
              <div className="space-y-4 mb-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{comment.author_name}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.created_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{comment.content}</p>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-center text-gray-400 py-4">No comments yet. Be the first!</p>
                )}
              </div>

              {/* Add Comment */}
              <div className="flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newComment.trim()) {
                      commentMutation.mutate();
                    }
                  }}
                />
                <Button
                  onClick={() => commentMutation.mutate()}
                  disabled={!newComment.trim() || commentMutation.isPending}
                  className="bg-gradient-to-r from-pink-600 to-rose-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}