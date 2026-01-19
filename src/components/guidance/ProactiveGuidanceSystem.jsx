import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Lightbulb, ArrowRight } from 'lucide-react';

const GuidanceContext = createContext();

export const useGuidance = () => {
  const context = useContext(GuidanceContext);
  if (!context) {
    throw new Error('useGuidance must be used within GuidanceProvider');
  }
  return context;
};

export function GuidanceProvider({ children }) {
  const [activeTip, setActiveTip] = useState(null);
  const [pageVisits, setPageVisits] = useState({});
  const queryClient = useQueryClient();

  const { data: dismissedTips = [] } = useQuery({
    queryKey: ['guidance-tips'],
    queryFn: () => base44.entities.GuidanceTip.list()
  });

  const trackVisitMutation = useMutation({
    mutationFn: async ({ tipId }) => {
      const existing = dismissedTips.find(t => t.tip_id === tipId);
      if (existing) {
        return base44.entities.GuidanceTip.update(existing.id, {
          shown_count: (existing.shown_count || 0) + 1
        });
      } else {
        return base44.entities.GuidanceTip.create({
          tip_id: tipId,
          shown_count: 1
        });
      }
    }
  });

  const dismissMutation = useMutation({
    mutationFn: async (tipId) => {
      const existing = dismissedTips.find(t => t.tip_id === tipId);
      if (existing) {
        return base44.entities.GuidanceTip.update(existing.id, {
          dismissed_at: new Date().toISOString()
        });
      } else {
        return base44.entities.GuidanceTip.create({
          tip_id: tipId,
          dismissed_at: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guidance-tips'] });
      setActiveTip(null);
    }
  });

  const interactMutation = useMutation({
    mutationFn: async (tipId) => {
      const existing = dismissedTips.find(t => t.tip_id === tipId);
      if (existing) {
        return base44.entities.GuidanceTip.update(existing.id, {
          interacted: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guidance-tips'] });
    }
  });

  const showTip = (tip) => {
    const dismissed = dismissedTips.find(t => t.tip_id === tip.id && t.dismissed_at);
    if (!dismissed) {
      setActiveTip(tip);
      trackVisitMutation.mutate({ tipId: tip.id });
    }
  };

  const dismissTip = (tipId) => {
    dismissMutation.mutate(tipId);
  };

  const interactWithTip = (tipId, action) => {
    interactMutation.mutate(tipId);
    if (action) action();
    setActiveTip(null);
  };

  const trackPageVisit = (pageName) => {
    setPageVisits(prev => ({
      ...prev,
      [pageName]: (prev[pageName] || 0) + 1
    }));
  };

  return (
    <GuidanceContext.Provider value={{ 
      showTip, 
      dismissTip, 
      interactWithTip,
      trackPageVisit,
      pageVisits,
      dismissedTips
    }}>
      {children}
      <AnimatePresence>
        {activeTip && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 max-w-md"
          >
            <Card className="bg-[#1a0f2e] border-[#8b85f7] shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#8b85f7]/20 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-[#8b85f7]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{activeTip.title}</h4>
                    <p className="text-sm text-gray-300 mb-4">{activeTip.message}</p>
                    <div className="flex gap-2">
                      {activeTip.action && (
                        <Button
                          size="sm"
                          onClick={() => interactWithTip(activeTip.id, activeTip.action.handler)}
                          className="bg-[#8b85f7] hover:bg-[#7a75e8]"
                        >
                          {activeTip.action.label}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissTip(activeTip.id)}
                        className="text-gray-400"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => dismissTip(activeTip.id)}
                    className="text-gray-400 hover:text-white flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </GuidanceContext.Provider>
  );
}