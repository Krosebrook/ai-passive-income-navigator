import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  MessageSquare, Search, Plus, TrendingUp, 
  CheckCircle, Eye, ArrowUp 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ForumPostModal from '@/components/forum/ForumPostModal';

const CATEGORIES = [
  { id: 'all', label: 'All Topics' },
  { id: 'general', label: 'General' },
  { id: 'getting_started', label: 'Getting Started' },
  { id: 'monetization', label: 'Monetization' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'legal', label: 'Legal' },
  { id: 'tech_tools', label: 'Tech & Tools' },
  { id: 'success_stories', label: 'Success Stories' }
];

export default function ForumPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['forum-posts', selectedCategory, sortBy],
    queryFn: async () => {
      const allPosts = await base44.entities.ForumPost.list('-created_date');
      return allPosts;
    }
  });

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.created_date) - new Date(a.created_date);
    if (sortBy === 'popular') return (b.upvote_count || 0) - (a.upvote_count || 0);
    if (sortBy === 'unanswered') return (a.is_answered ? 1 : -1) - (b.is_answered ? 1 : -1);
    return 0;
  });

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Community Forum</h1>
            <p className="text-gray-400">Ask questions, share knowledge, get help from experts</p>
          </div>
          <Button onClick={() => setShowNewPostModal(true)} className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0]">
            <Plus className="w-4 h-4 mr-2" />
            Ask Question
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="pl-10 bg-[#1a0f2e] border-[#2d1e50]"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-[#1a0f2e] border border-[#2d1e50] rounded-lg text-white"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="unanswered">Unanswered</option>
          </select>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#8b85f7] text-white'
                  : 'bg-[#1a0f2e] text-gray-400 hover:bg-[#2d1e50]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {sortedPosts.map(post => (
            <Link key={post.id} to={createPageUrl('ForumPost') + `?id=${post.id}`}>
              <Card className="bg-[#1a0f2e] border-[#2d1e50] hover:border-[#8b85f7] transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <div className="flex flex-col items-center">
                        <ArrowUp className="w-5 h-5" />
                        <span className="text-sm font-semibold">{post.upvote_count || 0}</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white hover:text-[#8b85f7]">
                          {post.title}
                        </h3>
                        {post.is_answered && (
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 ml-2" />
                        )}
                      </div>

                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.content}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <Badge variant="outline" className="capitalize">
                          {post.category.replace('_', ' ')}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {post.answer_count || 0} answers
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.view_count || 0} views
                        </div>
                        <span className="text-xs">
                          by {post.author_name} • {new Date(post.created_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {sortedPosts.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No posts found</p>
            </div>
          )}
        </div>

        <ForumPostModal 
          open={showNewPostModal} 
          onClose={() => setShowNewPostModal(false)}
          user={user}
        />
      </div>
    </div>
  );
}