import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowUp, ArrowDown, CheckCircle, MessageSquare, Eye } from 'lucide-react';
import ForumAnswer from '@/components/forum/ForumAnswer';

export default function ForumPostPage() {
  const queryClient = useQueryClient();
  const [postId, setPostId] = useState(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const params = new URLSearchParams(window.location.search);
    setPostId(params.get('id'));
  }, []);

  const { data: post } = useQuery({
    queryKey: ['forum-post', postId],
    queryFn: async () => {
      if (!postId) return null;
      const posts = await base44.entities.ForumPost.filter({ id: postId });
      const post = posts[0];
      // Increment view count
      await base44.entities.ForumPost.update(postId, {
        view_count: (post.view_count || 0) + 1
      });
      return post;
    },
    enabled: !!postId
  });

  const { data: answers = [] } = useQuery({
    queryKey: ['forum-answers', postId],
    queryFn: () => base44.entities.ForumAnswer.filter({ post_id: postId }),
    enabled: !!postId
  });

  const addAnswerMutation = useMutation({
    mutationFn: async (content) => {
      const answer = await base44.entities.ForumAnswer.create({
        post_id: postId,
        content,
        author_name: user?.full_name || 'Anonymous',
        author_email: user?.email || ''
      });

      await base44.entities.ForumPost.update(postId, {
        answer_count: (post.answer_count || 0) + 1
      });

      return answer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-answers'] });
      queryClient.invalidateQueries({ queryKey: ['forum-post'] });
      setNewAnswer('');
      toast.success('Answer posted!');
    }
  });

  const voteMutation = useMutation({
    mutationFn: async ({ targetId, voteType, targetType }) => {
      await base44.entities.PostRating.create({
        target_type: targetType,
        target_id: targetId,
        vote_type: voteType,
        voter_email: user?.email
      });

      const entity = targetType === 'post' ? base44.entities.ForumPost : base44.entities.ForumAnswer;
      const items = await entity.filter({ id: targetId });
      const item = items[0];

      const updates = {};
      if (voteType === 'upvote') {
        updates.upvote_count = (item.upvote_count || 0) + 1;
      } else if (voteType === 'downvote') {
        updates.downvote_count = (item.downvote_count || 0) + 1;
      }

      await entity.update(targetId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-post'] });
      queryClient.invalidateQueries({ queryKey: ['forum-answers'] });
    }
  });

  if (!post) return <div className="min-h-screen p-6 text-white">Loading...</div>;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-[#1a0f2e] border-[#2d1e50] mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2">
                <button 
                  onClick={() => voteMutation.mutate({ targetId: post.id, voteType: 'upvote', targetType: 'post' })}
                  className="text-gray-400 hover:text-[#8b85f7]"
                >
                  <ArrowUp className="w-6 h-6" />
                </button>
                <span className="text-xl font-bold text-white">{post.upvote_count || 0}</span>
                <button 
                  onClick={() => voteMutation.mutate({ targetId: post.id, voteType: 'downvote', targetType: 'post' })}
                  className="text-gray-400 hover:text-red-500"
                >
                  <ArrowDown className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-2xl font-bold text-white">{post.title}</h1>
                  {post.is_answered && (
                    <Badge className="bg-emerald-500 text-white">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Answered
                    </Badge>
                  )}
                </div>

                <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <Badge variant="outline" className="capitalize">
                    {post.category.replace('_', ' ')}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {post.view_count || 0} views
                  </div>
                  <span>
                    Asked by {post.author_name} • {new Date(post.created_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold text-white mb-4">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        <div className="space-y-4 mb-6">
          {answers.map(answer => (
            <ForumAnswer 
              key={answer.id} 
              answer={answer} 
              onVote={voteMutation.mutate}
              isAccepted={post.accepted_answer_id === answer.id}
            />
          ))}
        </div>

        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Answer</h3>
            <Textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Share your knowledge..."
              rows={6}
              className="bg-[#0f0618] border-[#2d1e50] text-white mb-4"
            />
            <Button 
              onClick={() => addAnswerMutation.mutate(newAnswer)}
              disabled={!newAnswer.trim() || addAnswerMutation.isPending}
              className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
            >
              Post Answer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}