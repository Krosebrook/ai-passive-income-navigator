import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Bookmark, Trash2, ArrowRight, Plus,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';

import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { IDEAS_CATALOG, CATEGORIES, GRADIENT_OPTIONS } from '@/components/data/ideasCatalog';

export default function Bookmarks() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => base44.entities.Bookmark.list('-created_date')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Bookmark.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
  });

  const addToPortfolioMutation = useMutation({
    mutationFn: async (bookmark) => {
      const idea = IDEAS_CATALOG.find(i => i.id === bookmark.idea_id);
      await base44.entities.PortfolioIdea.create({
        idea_id: bookmark.idea_id,
        title: bookmark.idea_title,
        description: idea?.description || '',
        category: bookmark.idea_category,
        status: 'exploring',
        priority: 'medium',
        tools: idea?.tools || [],
        difficulty: idea?.difficulty,
        estimated_income: idea?.estimated_income,
        time_to_profit: idea?.time_to_profit,
        color: GRADIENT_OPTIONS[Math.floor(Math.random() * GRADIENT_OPTIONS.length)],
        is_generated: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioIdeas'] });
    }
  });

  const filteredBookmarks = bookmarks.filter(b =>
    !searchQuery ||
    b.idea_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <LoadingSpinner text="Loading bookmarks..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Bookmarks"
          subtitle={`${bookmarks.length} saved ideas`}
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
              placeholder="Search bookmarks..."
              className="pl-12 h-12 bg-white rounded-xl"
            />
          </div>
        </motion.div>

        {/* Bookmarks List */}
        {filteredBookmarks.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No bookmarks yet"
            description="Save ideas you're interested in to review later."
            action={() => window.location.href = createPageUrl('Home')}
            actionLabel="Browse Ideas"
          />
        ) : (
          <div className="space-y-4">
            {filteredBookmarks.map((bookmark, index) => {
              const idea = IDEAS_CATALOG.find(i => i.id === bookmark.idea_id);
              const category = CATEGORIES.find(c => c.id === bookmark.idea_category);

              return (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Bookmark className="w-5 h-5 text-violet-600 fill-violet-600" />
                            <span className={`text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r ${category?.color || 'from-gray-100 to-gray-100'} text-white`}>
                              {category?.name || bookmark.idea_category}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {bookmark.idea_title}
                          </h3>
                          {idea && (
                            <p className="text-gray-500 text-sm line-clamp-2">
                              {idea.description}
                            </p>
                          )}
                          {bookmark.notes && (
                            <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                              {bookmark.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToPortfolioMutation.mutate(bookmark)}
                            disabled={addToPortfolioMutation.isPending}
                            className="gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add to Portfolio
                          </Button>
                          <Link to={createPageUrl('IdeaDetail') + `?id=${bookmark.idea_id}`}>
                            <Button variant="outline" size="sm" className="gap-2">
                              View
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(bookmark.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}