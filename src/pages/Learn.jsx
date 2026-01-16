import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, Search, Clock, TrendingUp, 
  Sparkles, FileText, CheckSquare, BarChart
} from 'lucide-react';
import ResourceCard from '@/components/learn/ResourceCard';
import ResourceModal from '@/components/learn/ResourceModal';

const CATEGORIES = [
  { id: 'all', label: 'All Resources', icon: BookOpen },
  { id: 'getting_started', label: 'Getting Started', icon: Sparkles },
  { id: 'ai_tools', label: 'AI Tools', icon: TrendingUp },
  { id: 'marketing', label: 'Marketing', icon: BarChart },
  { id: 'legal', label: 'Legal', icon: FileText },
  { id: 'finance', label: 'Finance', icon: CheckSquare }
];

const RESOURCE_TYPES = [
  { id: 'tutorial', label: 'Tutorials' },
  { id: 'guide', label: 'Guides' },
  { id: 'best_practice', label: 'Best Practices' },
  { id: 'case_study', label: 'Case Studies' },
  { id: 'checklist', label: 'Checklists' }
];

export default function Learn() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedResource, setSelectedResource] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const queryClient = useQueryClient();

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: () => base44.entities.Resource.list('-created_date')
  });

  // Generate initial resources if none exist
  useEffect(() => {
    if (!isLoading && resources.length === 0 && !isGenerating) {
      generateInitialResources();
    }
  }, [isLoading, resources.length]);

  const generateInitialResources = async () => {
    setIsGenerating(true);
    
    const resourcePrompts = [
      {
        title: "Complete Guide to Passive Income for Beginners",
        category: "getting_started",
        type: "guide",
        difficulty: "beginner",
        tags: ["basics", "introduction", "planning"]
      },
      {
        title: "Top 10 AI Tools Every Passive Income Entrepreneur Needs",
        category: "ai_tools",
        type: "guide",
        difficulty: "intermediate",
        tags: ["ai", "automation", "tools"]
      },
      {
        title: "Legal Checklist: Setting Up Your Online Business",
        category: "legal",
        type: "checklist",
        difficulty: "beginner",
        tags: ["legal", "compliance", "setup"]
      },
      {
        title: "Marketing Automation Best Practices",
        category: "marketing",
        type: "best_practice",
        difficulty: "intermediate",
        tags: ["marketing", "automation", "growth"]
      },
      {
        title: "Financial Planning for Passive Income Streams",
        category: "finance",
        type: "tutorial",
        difficulty: "beginner",
        tags: ["finance", "planning", "budgeting"]
      }
    ];

    for (const prompt of resourcePrompts) {
      try {
        const content = await base44.integrations.Core.InvokeLLM({
          prompt: `Create a comprehensive ${prompt.type} titled "${prompt.title}" for passive income entrepreneurs. 
          Category: ${prompt.category}. Difficulty: ${prompt.difficulty}.
          Include: introduction, key points (5-7), step-by-step instructions or best practices, common mistakes to avoid, and resources.
          Format in markdown with headers, lists, and emphasis. Make it actionable and practical. Length: 800-1200 words.`,
          add_context_from_internet: true
        });

        await base44.entities.Resource.create({
          ...prompt,
          content,
          estimated_time: prompt.type === 'checklist' ? '5 minutes' : '15 minutes',
          is_ai_generated: true
        });
      } catch (error) {
        console.error('Failed to generate resource:', error);
      }
    }

    queryClient.invalidateQueries({ queryKey: ['resources'] });
    setIsGenerating(false);
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  if (isLoading || isGenerating) {
    return <LoadingSpinner text={isGenerating ? "Generating learning resources..." : "Loading resources..."} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Learning Center"
          subtitle="Master passive income strategies with AI-powered guides and tutorials"
          gradient="from-violet-600 to-indigo-600"
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-violet-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{resources.length}</p>
                <p className="text-sm text-gray-500">Resources</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {resources.filter(r => r.is_ai_generated).length}
                </p>
                <p className="text-sm text-gray-500">AI Generated</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {resources.reduce((sum, r) => sum + parseInt(r.estimated_time || '10'), 0)}m
                </p>
                <p className="text-sm text-gray-500">Total Time</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-4 border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {resources.filter(r => r.difficulty === 'beginner').length}
                </p>
                <p className="text-sm text-gray-500">For Beginners</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={generateInitialResources}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate More
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {CATEGORIES.map(cat => (
              <Badge
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </Badge>
            ))}
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge
              variant={selectedType === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedType('all')}
            >
              All Types
            </Badge>
            {RESOURCE_TYPES.map(type => (
              <Badge
                key={type.id}
                variant={selectedType === type.id ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedType(type.id)}
              >
                {type.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onClick={() => setSelectedResource(resource)}
              delay={index * 0.1}
            />
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No resources found. Try adjusting your filters.</p>
          </div>
        )}
      </div>

      {/* Resource Modal */}
      {selectedResource && (
        <ResourceModal
          resource={selectedResource}
          open={!!selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}
    </div>
  );
}