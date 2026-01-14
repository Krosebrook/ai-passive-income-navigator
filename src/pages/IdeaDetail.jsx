import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, Bookmark, BookmarkCheck, Plus, Star,
  Clock, DollarSign, Zap, Sparkles,
  ChevronRight, LineChart
} from 'lucide-react';

import { IDEAS_CATALOG, CATEGORIES, DIFFICULTY_COLORS, GRADIENT_OPTIONS } from '@/components/data/ideasCatalog';
import EnrichmentModal from '@/components/enrichment/EnrichmentModal';
import MonetizationModal from '@/components/monetization/MonetizationModal';

export default function IdeaDetail() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const ideaId = parseInt(urlParams.get('id'));

  const [showEnrichment, setShowEnrichment] = useState(false);
  const [showMonetization, setShowMonetization] = useState(false);
  const [portfolioIdea, setPortfolioIdea] = useState(null);

  const idea = IDEAS_CATALOG.find(i => i.id === ideaId);
  const category = CATEGORIES.find(c => c.id === idea?.category);

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => base44.entities.Bookmark.list()
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['ratings'],
    queryFn: () => base44.entities.IdeaRating.list()
  });

  const { data: portfolioIdeas = [] } = useQuery({
    queryKey: ['portfolioIdeas'],
    queryFn: () => base44.entities.PortfolioIdea.list()
  });

  const isBookmarked = bookmarks.some(b => b.idea_id === ideaId);
  const userRating = ratings.find(r => r.idea_id === ideaId)?.rating || 0;
  const existingPortfolioIdea = portfolioIdeas.find(p => p.idea_id === ideaId);

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        const bookmark = bookmarks.find(b => b.idea_id === ideaId);
        await base44.entities.Bookmark.delete(bookmark.id);
      } else {
        await base44.entities.Bookmark.create({
          idea_id: ideaId,
          idea_title: idea.title,
          idea_category: idea.category
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
  });

  const rateMutation = useMutation({
    mutationFn: async (rating) => {
      const existing = ratings.find(r => r.idea_id === ideaId);
      if (existing) {
        await base44.entities.IdeaRating.update(existing.id, { rating });
      } else {
        await base44.entities.IdeaRating.create({ idea_id: ideaId, rating });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ratings'] })
  });

  const addToPortfolioMutation = useMutation({
    mutationFn: async () => {
      const newIdea = await base44.entities.PortfolioIdea.create({
        idea_id: ideaId,
        title: idea.title,
        description: idea.description,
        category: idea.category,
        status: 'exploring',
        priority: 'medium',
        tools: idea.tools,
        difficulty: idea.difficulty,
        estimated_income: idea.estimated_income,
        time_to_profit: idea.time_to_profit,
        color: GRADIENT_OPTIONS[Math.floor(Math.random() * GRADIENT_OPTIONS.length)],
        is_generated: false
      });
      setPortfolioIdea(newIdea);
      return newIdea;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioIdeas'] });
    }
  });

  if (!idea) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Idea not found</h2>
          <Link to={createPageUrl('Home')}>
            <Button variant="outline">Go back home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Ideas
          </Button>
        </Link>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-start gap-4 mb-4">
            <Badge className={`${category?.color ? `bg-gradient-to-r ${category.color} text-white` : 'bg-violet-100 text-violet-700'}`}>
              {category?.name || idea.category}
            </Badge>
            <Badge className={`${DIFFICULTY_COLORS[idea.difficulty]} border`}>
              {idea.difficulty}
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {idea.title}
          </h1>

          <p className="text-xl text-gray-600 mb-6">
            {idea.description}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Potential Income</p>
                <p className="font-semibold text-gray-900">{idea.estimated_income}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Time to Profit</p>
                <p className="font-semibold text-gray-900">{idea.time_to_profit}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {existingPortfolioIdea ? (
              <Link to={createPageUrl('Portfolio')}>
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 gap-2">
                  <Zap className="w-4 h-4" />
                  View in Portfolio
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={() => addToPortfolioMutation.mutate()}
                disabled={addToPortfolioMutation.isPending}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                Add to Portfolio
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => bookmarkMutation.mutate()}
              className={`gap-2 ${isBookmarked ? 'text-violet-600 border-violet-600' : ''}`}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEnrichment(true)}
              className="gap-2"
              disabled={!existingPortfolioIdea && !portfolioIdea}
            >
              <Sparkles className="w-4 h-4" />
              AI Enrich
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowMonetization(true)}
              className="gap-2"
              disabled={!existingPortfolioIdea && !portfolioIdea}
            >
              <LineChart className="w-4 h-4" />
              Monetize
            </Button>
          </div>
        </motion.div>

        {/* Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Rate this idea</h3>
                  <p className="text-sm text-gray-500">Help us improve recommendations</p>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => rateMutation.mutate(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          star <= userRating 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-gray-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-violet-600" />
                  Recommended Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {idea.tools?.map((tool, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{tool[0]}</span>
                      </div>
                      <span className="font-medium text-gray-900">{tool}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Getting Started */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-emerald-600" />
                  Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {idea.getting_started?.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-semibold text-sm">
                        {i + 1}
                      </div>
                      <p className="text-gray-700 pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Related Ideas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Ideas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {IDEAS_CATALOG
              .filter(i => i.category === idea.category && i.id !== idea.id)
              .slice(0, 3)
              .map((relatedIdea) => (
                <Link 
                  key={relatedIdea.id} 
                  to={createPageUrl('IdeaDetail') + `?id=${relatedIdea.id}`}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {relatedIdea.title}
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {relatedIdea.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-emerald-600 font-medium">{relatedIdea.estimated_income}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <EnrichmentModal
        idea={existingPortfolioIdea || portfolioIdea || { ...idea, id: 'temp' }}
        open={showEnrichment}
        onClose={() => setShowEnrichment(false)}
      />
      <MonetizationModal
        idea={existingPortfolioIdea || portfolioIdea || { ...idea, id: 'temp' }}
        open={showMonetization}
        onClose={() => setShowMonetization(false)}
      />
    </div>
  );
}