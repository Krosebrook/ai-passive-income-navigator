import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { MessageSquare, Send, ThumbsUp, Pin, Trash2 } from 'lucide-react';

export default function CommentSection({ dealId, portfolioIdeaId }) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const filter = dealId 
    ? { deal_pipeline_id: dealId }
    : { portfolio_idea_id: portfolioIdeaId };

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', dealId || portfolioIdeaId],
    queryFn: () => base44.entities.DealComment.filter(filter, '-created_date')
  });

  const addCommentMutation = useMutation({
    mutationFn: (content) => base44.entities.DealComment.create({
      ...(dealId ? { deal_pipeline_id: dealId } : { portfolio_idea_id: portfolioIdeaId }),
      content,
      author_name: user?.full_name || 'Anonymous',
      author_email: user?.email
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      setNewComment('');
      toast.success('Comment added');
    }
  });

  const upvoteMutation = useMutation({
    mutationFn: ({ id, currentUpvotes }) => 
      base44.entities.DealComment.update(id, { upvotes: currentUpvotes + 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id) => base44.entities.DealComment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Comment deleted');
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Discussion ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Share your insights..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
            className="flex-1"
          />
          <Button
            onClick={() => addCommentMutation.mutate(newComment)}
            disabled={!newComment.trim()}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Comments List */}
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-semibold text-sm">{comment.author_name}</span>
                  {comment.is_pinned && (
                    <Badge className="ml-2 bg-yellow-100 text-yellow-700">
                      <Pin className="w-3 h-3 mr-1" />
                      Pinned
                    </Badge>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(comment.created_date).toLocaleDateString()}
                  </p>
                </div>
                {user?.email === comment.author_email && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCommentMutation.mutate(comment.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => upvoteMutation.mutate({ 
                  id: comment.id, 
                  currentUpvotes: comment.upvotes 
                })}
                className="text-gray-600"
              >
                <ThumbsUp className="w-3 h-3 mr-1" />
                {comment.upvotes || 0}
              </Button>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-gray-500 py-4 text-sm">
              No comments yet. Start the discussion!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}