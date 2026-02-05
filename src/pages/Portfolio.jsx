import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, Search, SlidersHorizontal, FolderHeart,
  LayoutGrid, List, Sparkles
} from 'lucide-react';

import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import PortfolioCard from '@/components/portfolio/PortfolioCard';
import EnrichmentModal from '@/components/enrichment/EnrichmentModal';
import MonetizationModal from '@/components/monetization/MonetizationModal';
import FinancialEntry from '@/components/finance/FinancialEntry';
import PerformanceCharts from '@/components/finance/PerformanceCharts';
import IdeaGeneratorModal from '@/components/ideas/IdeaGeneratorModal';
import PortfolioAnalyticsDashboard from '@/components/portfolio/PortfolioAnalyticsDashboard';
import IdeaValidator from '@/components/ideas/IdeaValidator';
import MarketingContentGenerator from '@/components/marketing/MarketingContentGenerator';
import RebalancingSuggestions from '@/components/portfolio/RebalancingSuggestions';
import { GRADIENT_OPTIONS } from '@/components/data/ideasCatalog';

const STATUS_OPTIONS = ['all', 'exploring', 'planning', 'in_progress', 'launched', 'paused'];

export default function Portfolio() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [editingIdea, setEditingIdea] = useState(null);
  const [enrichingIdea, setEnrichingIdea] = useState(null);
  const [analyzingIdea, setAnalyzingIdea] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIdeaGenerator, setShowIdeaGenerator] = useState(false);
  const [showValidator, setShowValidator] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showRebalancing, setShowRebalancing] = useState(false);
  const [marketingIdea, setMarketingIdea] = useState(null);
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    category: 'digital_products',
    notes: '',
    status: 'exploring',
    priority: 'medium'
  });

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['portfolioIdeas'],
    queryFn: () => base44.entities.PortfolioIdea.list('-created_date')
  });

  const { data: preferences } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.list();
      return prefs.length > 0 ? prefs[0] : null;
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PortfolioIdea.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolioIdeas'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PortfolioIdea.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolioIdeas'] })
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PortfolioIdea.create({
      ...data,
      color: GRADIENT_OPTIONS[Math.floor(Math.random() * GRADIENT_OPTIONS.length)],
      is_generated: false
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioIdeas'] });
      setShowAddModal(false);
      setNewIdea({
        title: '',
        description: '',
        category: 'digital_products',
        notes: '',
        status: 'exploring',
        priority: 'medium'
      });
    }
  });

  const { data: financialData = [] } = useQuery({
    queryKey: ['financialData', selectedIdea?.id],
    queryFn: () => selectedIdea ? base44.entities.FinancialData.filter({ portfolio_idea_id: selectedIdea.id }, '-date', 100) : Promise.resolve([]),
    enabled: !!selectedIdea
  });

  const financialMutation = useMutation({
    mutationFn: (data) => base44.entities.FinancialData.create({
      ...data,
      portfolio_idea_id: selectedIdea.id,
      date: new Date().toISOString().split('T')[0],
      profit: (data.revenue || 0) - (data.expenses || 0)
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['financialData', selectedIdea?.id] })
  });

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = !searchQuery ||
      idea.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || idea.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: ideas.length,
    exploring: ideas.filter(i => i.status === 'exploring').length,
    in_progress: ideas.filter(i => i.status === 'in_progress').length,
    launched: ideas.filter(i => i.status === 'launched').length
  };

  if (isLoading) return <LoadingSpinner text="Loading portfolio..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="My Portfolio"
          subtitle="Manage and track your passive income ideas"
          action={
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => setShowRebalancing(true)}
                variant="outline"
                className="gap-2 border-[#8b85f7]/50 text-[#8b85f7] hover:bg-[#8b85f7]/10"
              >
                <TrendingUp className="w-4 h-4" />
                AI Rebalancing
              </Button>
              <Button
                onClick={() => setShowAnalytics(true)}
                variant="outline"
                className="gap-2"
              >
                📊 Analytics
              </Button>
              <Button
                onClick={() => setShowValidator(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 gap-2"
              >
                ✓ Validate Idea
              </Button>
              <Button
                onClick={() => setShowIdeaGenerator(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Generate Ideas
              </Button>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Idea
              </Button>
            </div>
          }
        />

        {/* Predictive Rebalancing */}
        {showRebalancing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRebalancing(false)}
              >
                ✕ Close
              </Button>
            </div>
            <Tabs defaultValue="predictive">
              <TabsList>
                <TabsTrigger value="predictive">Predictive Rebalancing</TabsTrigger>
                <TabsTrigger value="current">Current Suggestions</TabsTrigger>
              </TabsList>
              <TabsContent value="predictive" className="mt-6">
                <PredictiveRebalancingPanel />
              </TabsContent>
              <TabsContent value="current" className="mt-6">
                <RebalancingSuggestions />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}

        {/* Analytics Dashboard */}
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnalytics(false)}
              >
                ✕ Close
              </Button>
            </div>
            <PortfolioAnalyticsDashboard />
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Ideas', value: stats.total, color: 'bg-violet-500' },
            { label: 'Exploring', value: stats.exploring, color: 'bg-slate-500' },
            { label: 'In Progress', value: stats.in_progress, color: 'bg-amber-500' },
            { label: 'Launched', value: stats.launched, color: 'bg-emerald-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className={`w-3 h-3 rounded-full ${stat.color} mb-3`} />
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ideas..."
              className="pl-12 h-12 bg-white rounded-xl"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 h-12 bg-white rounded-xl">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 bg-white rounded-xl p-1 border">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="h-10 w-10"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-10 w-10"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Idea Detail Panel */}
        {selectedIdea && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedIdea.title}</h2>
                <p className="text-gray-500 mt-1">{selectedIdea.description}</p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedIdea(null)}>
                Close
              </Button>
            </div>

            {/* Financial Tracking */}
            <div className="space-y-6">
              <FinancialEntry
                idea={selectedIdea}
                onSave={financialMutation.mutate}
                isLoading={financialMutation.isPending}
              />

              {financialData.length > 0 && (
                <PerformanceCharts metrics={financialData} />
              )}
            </div>
          </motion.div>
        )}

        {/* Ideas Grid/List */}
         {filteredIdeas.length === 0 ? (
          <EmptyState
            icon={FolderHeart}
            title="No ideas yet"
            description="Start building your passive income portfolio by adding your first idea."
            action={() => setShowAddModal(true)}
            actionLabel="Add Your First Idea"
          />
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            <AnimatePresence>
              {filteredIdeas.map((idea, index) => (
                <PortfolioCard
                  key={idea.id}
                  idea={idea}
                  index={index}
                  onStatusChange={(id, status) => updateMutation.mutate({ id, data: { status } })}
                  onPriorityChange={(id, priority) => updateMutation.mutate({ id, data: { priority } })}
                  onEdit={(idea) => setEditingIdea(idea)}
                  onDelete={(idea) => deleteMutation.mutate(idea.id)}
                  onEnrich={(idea) => setEnrichingIdea(idea)}
                  onAnalyze={(idea) => setAnalyzingIdea(idea)}
                  onSelectTracking={(idea) => setSelectedIdea(idea)}
                  onGenerateMarketing={(idea) => setMarketingIdea(idea)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Idea Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              Add New Idea
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
              <Input
                value={newIdea.title}
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                placeholder="e.g., AI-Powered Newsletter"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
              <Textarea
                value={newIdea.description}
                onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                placeholder="Describe your idea..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Priority</label>
                <Select 
                  value={newIdea.priority} 
                  onValueChange={(value) => setNewIdea({ ...newIdea, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                <Select 
                  value={newIdea.status} 
                  onValueChange={(value) => setNewIdea({ ...newIdea, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exploring">Exploring</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label>
              <Textarea
                value={newIdea.notes}
                onChange={(e) => setNewIdea({ ...newIdea, notes: e.target.value })}
                placeholder="Add any notes..."
                rows={2}
              />
            </div>
            <Button
              onClick={() => createMutation.mutate(newIdea)}
              disabled={!newIdea.title || createMutation.isPending}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              Add to Portfolio
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Notes Modal */}
      <Dialog open={!!editingIdea} onOpenChange={() => setEditingIdea(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Notes: {editingIdea?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Textarea
              value={editingIdea?.notes || ''}
              onChange={(e) => setEditingIdea({ ...editingIdea, notes: e.target.value })}
              placeholder="Add your notes..."
              rows={6}
            />
            <Button
              onClick={() => {
                updateMutation.mutate({ id: editingIdea.id, data: { notes: editingIdea.notes } });
                setEditingIdea(null);
              }}
              className="w-full mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              Save Notes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enrichment Modal */}
      <EnrichmentModal
        idea={enrichingIdea}
        open={!!enrichingIdea}
        onClose={() => setEnrichingIdea(null)}
      />

      {/* Monetization Modal */}
      <MonetizationModal
        idea={analyzingIdea}
        open={!!analyzingIdea}
        onClose={() => setAnalyzingIdea(null)}
      />

      {/* Idea Generator Modal */}
      <IdeaGeneratorModal
        open={showIdeaGenerator}
        onClose={() => setShowIdeaGenerator(false)}
        userPreferences={preferences}
      />

      {/* Idea Validator Modal */}
      <IdeaValidator
        open={showValidator}
        onClose={() => setShowValidator(false)}
        onAddToPortfolio={(idea) => {
          createMutation.mutate({
            title: idea.title,
            description: idea.description,
            category: 'digital_products',
            status: 'exploring',
            priority: 'medium',
            notes: idea.notes
          });
          setShowValidator(false);
        }}
      />

      {/* Marketing Content Generator */}
      <MarketingContentGenerator
        open={!!marketingIdea}
        onClose={() => setMarketingIdea(null)}
        idea={marketingIdea}
      />
      </div>
      );
      }