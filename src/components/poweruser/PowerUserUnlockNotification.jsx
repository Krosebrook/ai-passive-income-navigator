import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Sparkles, TrendingUp, Users } from 'lucide-react';

/**
 * Displays capability tier unlock notifications
 * Non-blocking, celebratory, partnership-oriented tone
 */
export default function PowerUserUnlockNotification({ unlock, onDismiss, onExplore }) {
  const tierConfigs = {
    advanced_discovery: {
      title: 'Advanced Deal Discovery Unlocked',
      message: "You've unlocked deeper deal analysis based on how you work.",
      icon: Sparkles,
      color: 'from-violet-500 to-purple-600',
      features: [
        'Compare unlimited deals side-by-side',
        'Create organized deal collections',
        'AI explains why deals match your strategy'
      ],
      cta: 'Explore Analysis Tools'
    },
    portfolio_intelligence: {
      title: 'Portfolio Intelligence Unlocked',
      message: 'Your portfolio activity unlocked forecasting tools.',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      features: [
        'Model what-if scenarios for your strategy',
        'Forecast portfolio returns',
        'Map deals to your goals'
      ],
      cta: 'Try Scenario Modeling'
    },
    network_amplification: {
      title: 'Expert Network Access Unlocked',
      message: 'You now have access to higher-signal conversations.',
      icon: Users,
      color: 'from-sky-500 to-blue-600',
      features: [
        'Follow unlimited verified experts',
        'Boost your insights in the community',
        'Access private expert communities'
      ],
      cta: 'Build Your Network'
    }
  };

  const config = tierConfigs[unlock?.id] || {};
  const Icon = config.icon || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', damping: 15 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
    >
      <Card className="border-0 shadow-2xl overflow-hidden">
        {/* Gradient header */}
        <div className={`h-2 bg-gradient-to-r ${config.color}`} />

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${config.color} text-white flex-shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-gray-900">{config.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{config.message}</p>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Features list */}
          <div className="space-y-2">
            {config.features?.map((feature, i) => (
              <div key={i} className="flex gap-2">
                <div className={`w-1 rounded-full flex-shrink-0 bg-gradient-to-b ${config.color}`} />
                <p className="text-sm text-gray-700">{feature}</p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDismiss}
              className="flex-1 text-xs"
            >
              Got it
            </Button>
            <Button
              size="sm"
              className={`flex-1 bg-gradient-to-r ${config.color} text-white text-xs`}
              onClick={onExplore}
            >
              {config.cta}
            </Button>
          </div>

          {/* Partnership tone */}
          <p className="text-xs text-gray-500 text-center pt-1">
            Your engagement unlocked these tools. They're yours to use. 🎉
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}