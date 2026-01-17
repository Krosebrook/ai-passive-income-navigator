import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, TrendingUp, FolderHeart, Bookmark, MessageSquare, Zap, Target
} from 'lucide-react';

import IdeaCard from '@/components/ideas/IdeaCard';
import CategoryFilter from '@/components/ideas/CategoryFilter';
import SearchBar from '@/components/ideas/SearchBar';
import AdvancedOnboardingWizard from '@/components/onboarding/AdvancedOnboardingWizard';
import AIGuideChat from '@/components/ai/AIGuideChat';
import IdeaGeneratorModal from '@/components/ideas/IdeaGeneratorModal';
import TutorialSystem from '@/components/onboarding/TutorialSystem';
import ActivationGuideWrapper from '@/components/activation/ActivationGuideWrapper';
import RetentionHubWrapper from '@/components/retention/RetentionHubWrapper';
import PowerUserHub from '@/components/poweruser/PowerUserHub';
import LifecycleAdaptiveUI from '@/components/lifecycle/LifecycleAdaptiveUI';
import { IDEAS_CATALOG, CATEGORIES } from '@/components/data/ideasCatalog';

export default function Home() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showIdeaGenerator, setShowIdeaGenerator] = useState(false);
  const [activeTutorial, setActiveTutorial] = useState(null);

  // Fetch onboarding profile
  const { data: onboardingProfile } = useQuery({
    queryKey: ['onboarding-profile'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.UserOnboardingProfile.filter({ 
          user_email: user.email 
        });
        return profiles[0] || null;
      } catch {
        return null;
      }
    }
  });

  const { data: preferences } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.list();
      if (prefs.length === 0) {
        return null;
      }
      return prefs[0];
    }
  });

  // Trigger tutorials contextually
  useEffect(() => {
    if (onboardingProfile?.activation_metrics?.first_portfolio_idea_added_at === undefined) {
      setActiveTutorial('quick_tour');
    }
  }, [onboardingProfile]);

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => base44.entities.Bookmark.list()
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['ratings'],
    queryFn: () => base44.entities.IdeaRating.list()
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (idea) => {
      const existing = bookmarks.find(b => b.idea_id === idea.id);
      if (existing) {
        await base44.entities.Bookmark.delete(existing.id);
      } else {
        await base44.entities.Bookmark.create({
          idea_id: idea.id,
          idea_title: idea.title,
          idea_category: idea.category
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
  });

  const rateMutation = useMutation({
    mutationFn: async ({ ideaId, rating }) => {
      const existing = ratings.find(r => r.idea_id === ideaId);
      if (existing) {
        await base44.entities.IdeaRating.update(existing.id, { rating });
      } else {
        await base44.entities.IdeaRating.create({ idea_id: ideaId, rating });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ratings'] })
  });

  const handleOnboardingComplete = async (prefs) => {
    await base44.entities.UserPreferences.create({
      ...prefs,
      has_completed_onboarding: true
    });
    queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
    setShowOnboarding(false);
  };

  // Filter ideas
  const filteredIdeas = useMemo(() => {
    return IDEAS_CATALOG.filter(idea => {
      const matchesSearch = !searchQuery || 
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || idea.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const navigateToIdeaDetail = (idea) => {
    window.location.href = createPageUrl('IdeaDetail') + `?id=${idea.id}`;
  };

  return (
    <LifecycleAdaptiveUI>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Discover AI-Powered Income Opportunities
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Build Your
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"> Passive Income </span>
            Empire
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8">
            Explore {IDEAS_CATALOG.length}+ curated ideas, get AI-powered insights, and start earning while you sleep.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => setShowAIChat(true)}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 gap-2 h-12 px-6"
            >
              <Sparkles className="w-5 h-5" />
              Ask AI Guide
            </Button>
            <Link to={createPageUrl('Portfolio')}>
              <Button variant="outline" className="gap-2 h-12 px-6">
                <FolderHeart className="w-5 h-5" />
                My Portfolio
              </Button>
            </Link>
            <Link to={createPageUrl('Trends')}>
              <Button variant="outline" className="gap-2 h-12 px-6">
                <TrendingUp className="w-5 h-5" />
                Market Trends
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { label: 'Curated Ideas', value: IDEAS_CATALOG.length + '+', icon: Target, color: 'text-violet-600' },
            { label: 'Categories', value: CATEGORIES.length, icon: FolderHeart, color: 'text-blue-600' },
            { label: 'Saved Ideas', value: bookmarks.length, icon: Bookmark, color: 'text-emerald-600' },
            { label: 'AI Analysis', value: '24/7', icon: Sparkles, color: 'text-amber-600' }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <Icon className={`w-8 h-8 ${stat.color} mb-3`} />
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Search & Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 space-y-4"
        >
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery}
            placeholder="Search passive income ideas..."
          />
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </motion.div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500">
            Showing <span className="font-semibold text-gray-900">{filteredIdeas.length}</span> ideas
            {selectedCategory && (
              <span> in <span className="font-semibold text-violet-600">
                {CATEGORIES.find(c => c.id === selectedCategory)?.name}
              </span></span>
            )}
          </p>
        </div>

        {/* Activation Guide */}
        <ActivationGuideWrapper />

        {/* Retention Habit Loops */}
        <RetentionHubWrapper />

        {/* Power-User System */}
        <PowerUserHub />

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((idea, index) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              index={index}
              isBookmarked={bookmarks.some(b => b.idea_id === idea.id)}
              userRating={ratings.find(r => r.idea_id === idea.id)?.rating}
              onBookmark={(idea) => bookmarkMutation.mutate(idea)}
              onViewDetails={navigateToIdeaDetail}
              onRate={(ideaId, rating) => rateMutation.mutate({ ideaId, rating })}
            />
          ))}
        </div>

        {filteredIdeas.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Target className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No ideas found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Advanced Onboarding Wizard */}
      <AdvancedOnboardingWizard 
        open={showOnboarding || !onboardingProfile} 
        onComplete={handleOnboardingComplete}
      />

      {/* Tutorial System */}
      {activeTutorial && (
        <TutorialSystem
          tutorialId={activeTutorial}
          onComplete={() => setActiveTutorial(null)}
        />
      )}

      {/* AI Chat */}
      <AIGuideChat 
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        userPreferences={preferences}
      />

      {/* Idea Generator */}
      <IdeaGeneratorModal
        open={showIdeaGenerator}
        onClose={() => setShowIdeaGenerator(false)}
        userPreferences={preferences}
      />

      {/* Floating AI Button */}
      {!showAIChat && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAIChat(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200 flex items-center justify-center z-40"
        >
          <MessageSquare className="w-6 h-6" />
        </motion.button>
      )}
    </div>
    </LifecycleAdaptiveUI>
  );
}