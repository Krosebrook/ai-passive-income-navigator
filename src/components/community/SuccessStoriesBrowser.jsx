import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Heart, Eye, TrendingUp, DollarSign, Clock } from 'lucide-react';

/**
 * Browse and search success stories from the community
 */
export default function SuccessStoriesBrowser({ onSubmitStory }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStory, setSelectedStory] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const { data: stories = [] } = useQuery({
    queryKey: ['successStories'],
    queryFn: () => base44.entities.SuccessStory.list('-created_date', 50)
  });

  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      const matchesSearch = !searchQuery ||
        story.idea_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.story_title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || story.idea_category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [stories, searchQuery, filterCategory]);

  const categories = [...new Set(stories.map(s => s.idea_category))].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Success Stories</h2>
          <p className="text-gray-600 mt-1">Learn from the community's wins</p>
        </div>
        <Button
          onClick={onSubmitStory}
          className="bg-violet-600 hover:bg-violet-700"
        >
          + Share Your Story
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 flex-wrap">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search stories..."
          className="flex-1 min-w-[250px]"
        />
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Badge
            className={`cursor-pointer whitespace-nowrap ${
              filterCategory === 'all'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setFilterCategory('all')}
          >
            All Categories
          </Badge>
          {categories.map(cat => (
            <Badge
              key={cat}
              className={`cursor-pointer whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredStories.map((story, idx) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow h-full"
                onClick={() => setSelectedStory(story)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-xs text-violet-600 font-medium">{story.idea_title}</p>
                      <CardTitle className="text-lg mt-1">{story.story_title}</CardTitle>
                    </div>
                    {story.is_verified && (
                      <Badge className="bg-emerald-100 text-emerald-700">✓ Verified</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{story.story_summary}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="text-gray-600">Monthly</p>
                        <p className="font-bold text-emerald-600">${story.current_monthly_revenue?.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-gray-600">ROI</p>
                        <p className="font-bold text-blue-600">{story.roi_percentage}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="text-gray-600">Time to Profit</p>
                        <p className="font-bold text-amber-600">{story.time_to_profit_months}mo</p>
                      </div>
                    </div>
                    <div className="text-gray-600">
                      <p className="text-xs">Initial: ${story.initial_investment?.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Engagement */}
                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{story.likes_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">{story.views_count || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Story Detail Modal */}
      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedStory && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedStory.story_title}</DialogTitle>
              </DialogHeader>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Story Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">About This Idea</h3>
                  <p className="text-gray-600">{selectedStory.idea_title}</p>
                  {selectedStory.idea_category && (
                    <Badge className="mt-2">{selectedStory.idea_category}</Badge>
                  )}
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">Current Monthly Revenue</p>
                      <p className="text-2xl font-bold text-emerald-600">${selectedStory.current_monthly_revenue?.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">ROI Achieved</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedStory.roi_percentage}%</p>
                    </CardContent>
                  </Card>
                </div>

                {/* The Story */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">The Journey</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedStory.detailed_story}</p>
                </div>

                {/* Key Strategies */}
                {selectedStory.key_strategies?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Key Strategies</h3>
                    <ul className="space-y-1">
                      {selectedStory.key_strategies.map((strategy, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex gap-2">
                          <span className="text-violet-600">→</span> {strategy}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lessons */}
                {selectedStory.lessons_learned?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Key Lessons</h3>
                    <ul className="space-y-1">
                      {selectedStory.lessons_learned.map((lesson, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex gap-2">
                          <span className="text-emerald-600">✓</span> {lesson}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Challenges */}
                {selectedStory.challenges_faced?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Challenges Overcome</h3>
                    <ul className="space-y-1">
                      {selectedStory.challenges_faced.map((challenge, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex gap-2">
                          <span className="text-amber-600">⚠</span> {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Advice */}
                {selectedStory.advice_for_beginners && (
                  <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                    <h3 className="font-semibold text-violet-900 mb-2">💡 Advice for Beginners</h3>
                    <p className="text-sm text-violet-800">{selectedStory.advice_for_beginners}</p>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}