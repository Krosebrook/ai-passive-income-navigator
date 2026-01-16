import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader, Plus } from 'lucide-react';
import { GRADIENT_OPTIONS } from '@/components/data/ideasCatalog';

export default function IdeaGeneratorModal({ open, onClose, userPreferences }) {
  const queryClient = useQueryClient();
  const [generatedIdeas, setGeneratedIdeas] = useState(null);
  const [selectedIdeas, setSelectedIdeas] = useState([]);

  const generateMutation = useMutation({
    mutationFn: (prefs) => base44.functions.invoke('generateIdeas', { userPreferences: prefs }),
    onSuccess: (response) => {
      setGeneratedIdeas(response.data);
    }
  });

  const addMutation = useMutation({
    mutationFn: (ideas) => 
      Promise.all(ideas.map(idea =>
        base44.entities.PortfolioIdea.create({
          title: idea.title,
          description: idea.description,
          category: idea.category,
          difficulty: idea.difficulty,
          estimated_income: idea.estimated_income,
          status: 'exploring',
          priority: 'medium',
          color: GRADIENT_OPTIONS[Math.floor(Math.random() * GRADIENT_OPTIONS.length)],
          is_generated: true
        })
      )),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioIdeas'] });
      setGeneratedIdeas(null);
      setSelectedIdeas([]);
      onClose();
    }
  });

  const handleGenerate = () => {
    if (userPreferences) {
      generateMutation.mutate(userPreferences);
    }
  };

  const handleAddIdeas = () => {
    if (selectedIdeas.length > 0 && generatedIdeas) {
      const ideasToAdd = generatedIdeas.ideas.filter((_, i) => selectedIdeas.includes(i));
      addMutation.mutate(ideasToAdd);
    }
  };

  const toggleIdeaSelection = (index) => {
    setSelectedIdeas(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            AI Idea Generator
          </DialogTitle>
        </DialogHeader>

        {!generatedIdeas ? (
          <div className="space-y-6 py-6">
            <div className="text-center space-y-3">
              <p className="text-gray-600">
                Based on your interests and market trends, let AI generate personalized passive income ideas tailored to your profile.
              </p>
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !userPreferences}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 gap-2"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Generating Ideas...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Ideas
                  </>
                )}
              </Button>
            </div>

            {!userPreferences && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-700">
                  💡 Complete your profile in Settings to get better personalized suggestions.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 py-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">{generatedIdeas.summary}</p>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Select ideas to add to your portfolio ({selectedIdeas.length} selected):
              </p>
            </div>

            <AnimatePresence>
              <div className="space-y-3">
                {generatedIdeas.ideas?.map((idea, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onClick={() => toggleIdeaSelection(idx)}
                    className={`cursor-pointer transition-all ${
                      selectedIdeas.includes(idx)
                        ? 'ring-2 ring-violet-500'
                        : ''
                    }`}
                  >
                    <Card className="border-2 hover:border-violet-300">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedIdeas.includes(idx)}
                            onChange={() => toggleIdeaSelection(idx)}
                            className="w-5 h-5 mt-0.5 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900">{idea.title}</h3>
                              <Badge className="text-xs ml-2">
                                {idea.difficulty}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{idea.description}</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {idea.category?.replace(/_/g, ' ')}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {idea.estimated_income}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 italic">
                              Why it fits: {idea.fit_explanation}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedIdeas(null);
                  setSelectedIdeas([]);
                }}
              >
                Generate New
              </Button>
              <Button
                onClick={handleAddIdeas}
                disabled={selectedIdeas.length === 0 || addMutation.isPending}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 gap-2"
              >
                {addMutation.isPending ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Adding to Portfolio...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add {selectedIdeas.length} to Portfolio
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}