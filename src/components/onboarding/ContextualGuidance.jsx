import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, X, Lightbulb, Target, TrendingUp } from 'lucide-react';

/**
 * Contextual tooltip with "Why this matters" microcopy
 */
export function WhyThisMatters({ children, explanation, icon: Icon = Info }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center gap-1 text-[#8b85f7] hover:text-[#9a95ff] transition-colors">
            {children}
            <Icon className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs bg-[#1a0f2e] border-[#8b85f7]/30 text-white"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#8b85f7]">Why this matters:</p>
            <p className="text-xs text-[#a0aec0]">{explanation}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Contextual highlight on hover - shows useful info about a feature
 */
export function ContextualHighlight({ 
  children, 
  title, 
  description, 
  action,
  onActionClick 
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 left-0 right-0"
          >
            <div className="bg-[#1a0f2e] border border-[#8b85f7]/30 rounded-lg p-3 shadow-xl shadow-[#8b85f7]/20">
              <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
              <p className="text-xs text-[#a0aec0] mb-2">{description}</p>
              {action && (
                <button
                  onClick={onActionClick}
                  className="text-xs text-[#8b85f7] hover:text-[#9a95ff] font-medium"
                >
                  {action} →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Dismissible inline tip based on user behavior
 */
export function InlineTip({ 
  id,
  message, 
  type = 'info',
  icon: Icon,
  onDismiss,
  dismissible = true
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Check if user has dismissed this tip before
    const dismissed = localStorage.getItem(`tip_dismissed_${id}`);
    if (dismissed) {
      setVisible(false);
    }
  }, [id]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(`tip_dismissed_${id}`, 'true');
    onDismiss?.();
  };

  if (!visible) return null;

  const typeConfig = {
    info: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: Info },
    success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: Target },
    tip: { bg: 'bg-[#8b85f7]/10', border: 'border-[#8b85f7]/20', text: 'text-[#8b85f7]', icon: Lightbulb },
    goal: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', icon: TrendingUp }
  };

  const config = typeConfig[type] || typeConfig.info;
  const TipIcon = Icon || config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className={`${config.bg} border ${config.border} rounded-lg p-3 mb-4`}
      >
        <div className="flex items-start gap-3">
          <TipIcon className={`w-4 h-4 ${config.text} mt-0.5 flex-shrink-0`} />
          <p className="text-sm text-[#a0aec0] flex-1">{message}</p>
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="text-[#64748b] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Progress-based tip that appears when user reaches milestones
 */
export function ProgressTip({ 
  id,
  milestone, 
  nextStep, 
  onDismiss 
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(`progress_tip_${id}`);
    if (dismissed) {
      setVisible(false);
    }
  }, [id]);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(`progress_tip_${id}`, 'true');
    onDismiss?.();
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-gradient-to-r from-[#8b85f7]/10 to-[#583cf0]/10 border border-[#8b85f7]/30 rounded-lg p-4 mb-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-[#8b85f7]" />
            <h4 className="text-sm font-semibold text-white">Great progress!</h4>
          </div>
          <p className="text-sm text-[#a0aec0] mb-2">{milestone}</p>
          <p className="text-xs text-[#8b85f7] font-medium">
            💡 Next: {nextStep}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-[#64748b] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}