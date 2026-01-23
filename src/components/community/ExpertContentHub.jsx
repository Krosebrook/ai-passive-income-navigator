import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactMarkdown from 'react-markdown';
import { 
  BookOpen, Star, Eye, TrendingUp, 
  PenTool, ThumbsUp, Share2
} from 'lucide-react';
import { toast } from 'sonner';

export default function ExpertContentHub() {
  const queryClient = useQueryClient();
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [newContent, setNewContent] = useState({
    title: '',
    content: '',
    content_type: 'market_analysis',
    tags: []
  });

  const { data: expertContent = [] } = useQuery({
    queryKey: ['expert-content'],
    queryFn: async () => {
      const content = await base44.entities.ExpertContent.filter({ status: 'published' });
      return content.sort((a, b) => b.views - a.views);
    }
  });

  const publishMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return await base44.entities.ExpertContent.create({
        ...data,
        author_email: user.email,
        status: 'published'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-content'] });
      setShowPublishDialog(false);
      setNewContent({ title: '', content: '', content_type: 'market_analysis', tags: [] });
      toast.success('Content published!');
    }
  });

  const rateMutation = useMutation({
    mutationFn: async ({ contentId, rating }) => {
      const user = await base44.auth.me();
      await base44.entities.ContentRating.create({
        user_email: user.email,
        content_id: contentId,
        content_type: 'expert_content',
        rating
      });

      // Update content average rating
      const content = await base44.entities.ExpertContent.get(contentId);
      const newTotal = content.total_ratings + 1;
      const newAverage = ((content.average_rating * content.total_ratings) + rating) / newTotal;
      
      await base44.entities.ExpertContent.update(contentId, {
        average_rating: newAverage,
        total_ratings: newTotal
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-content'] });
      toast.success('Rating submitted');
    }
  });

  const getContentTypeColor = (type) => {
    const colors = {
      market_analysis: 'bg-blue-500/20 text-blue-500',
      deal_review: 'bg-green-500/20 text-green-500',
      educational: 'bg-purple-500/20 text-purple-500',
      strategy_guide: 'bg-orange-500/20 text-orange-500'
    };
    return colors[type] || colors.market_analysis;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] bg-clip-text text-transparent">
            Expert Analysis
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            In-depth market commentary and investment insights
          </p>
        </div>
        <Button onClick={() => setShowPublishDialog(true)} className="btn-primary">
          <PenTool className="w-4 h-4 mr-2" />
          Publish Content
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {expertContent.map((content) => (
          <Card key={content.id} className="card-dark hover:border-[#8b85f7]/50 transition-all cursor-pointer"
            onClick={() => setSelectedContent(content)}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg text-white line-clamp-2">{content.title}</CardTitle>
                <Badge className={getContentTypeColor(content.content_type)}>
                  {content.content_type.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-xs text-gray-400">by {content.author_email}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {content.views}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {content.average_rating?.toFixed(1) || 0} ({content.total_ratings})
                </span>
              </div>

              {content.tags && content.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {content.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  Read Full Article
                </Button>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb]"
                  onClick={(e) => {
                    e.stopPropagation();
                    rateMutation.mutate({ contentId: content.id, rating: 5 });
                  }}
                >
                  <ThumbsUp className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="max-w-3xl bg-[#1a0f2e] border-[#2d1e50] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gradient">Publish Expert Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Content Title"
              value={newContent.title}
              onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
            />
            <Select
              value={newContent.content_type}
              onValueChange={(value) => setNewContent({ ...newContent, content_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market_analysis">Market Analysis</SelectItem>
                <SelectItem value="deal_review">Deal Review</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="strategy_guide">Strategy Guide</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Content (Markdown supported)"
              value={newContent.content}
              onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
              rows={15}
            />
            <Button 
              className="w-full btn-primary"
              onClick={() => publishMutation.mutate(newContent)}
              disabled={!newContent.title || !newContent.content}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Publish Content
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content Detail Dialog */}
      {selectedContent && (
        <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
          <DialogContent className="max-w-4xl bg-[#1a0f2e] border-[#2d1e50] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-gradient">{selectedContent.title}</DialogTitle>
              <p className="text-sm text-gray-400">by {selectedContent.author_email}</p>
            </DialogHeader>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{selectedContent.content}</ReactMarkdown>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}