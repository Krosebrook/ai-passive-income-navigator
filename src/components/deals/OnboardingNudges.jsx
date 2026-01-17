import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function OnboardingNudges() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentNudgeIndex, setCurrentNudgeIndex] = useState(0);

  const { data: nudges = [] } = useQuery({
    queryKey: ['onboarding-nudges'],
    queryFn: async () => {
      const all = await base44.entities.OnboardingNudge.list('-priority');
      return all.filter(n => !n.dismissed && !n.actioned);
    }
  });

  const dismissMutation = useMutation({
    mutationFn: (id) => base44.entities.OnboardingNudge.update(id, { 
      dismissed: true,
      shown_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-nudges'] });
      setCurrentNudgeIndex(0);
    }
  });

  const actionMutation = useMutation({
    mutationFn: (id) => base44.entities.OnboardingNudge.update(id, { 
      actioned: true,
      shown_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-nudges'] });
      setCurrentNudgeIndex(0);
    }
  });

  const handleAction = (nudge) => {
    actionMutation.mutate(nudge.id);
    if (nudge.action_url) {
      navigate(nudge.action_url);
    } else if (nudge.target_feature) {
      // Map features to pages
      const featurePages = {
        deal_sourcing: createPageUrl('DealDiscovery'),
        collaboration: createPageUrl('Collaborate'),
        financial_analysis: createPageUrl('Portfolio'),
        pipeline: createPageUrl('DealPipeline'),
        community: createPageUrl('Community')
      };
      const page = featurePages[nudge.target_feature];
      if (page) navigate(page);
    }
  };

  if (nudges.length === 0) return null;

  const currentNudge = nudges[currentNudgeIndex];
  if (!currentNudge) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-6 right-6 z-50 max-w-md"
      >
        <Card className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-300 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-violet-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{currentNudge.title}</h4>
                <button
                  onClick={() => dismissMutation.mutate(currentNudge.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-700 mb-3">{currentNudge.message}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAction(currentNudge)}
                  className="bg-gradient-to-r from-[#8b85f7] to-[#583cf0]"
                >
                  {currentNudge.action_label || 'Explore'}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => dismissMutation.mutate(currentNudge.id)}
                >
                  Maybe Later
                </Button>
              </div>
              {nudges.length > 1 && (
                <p className="text-xs text-gray-500 mt-2">
                  {currentNudgeIndex + 1} of {nudges.length} suggestions
                </p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}