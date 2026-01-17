import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Check, Lock } from 'lucide-react';

/**
 * Soft, contextual monetization prompts
 * Shows value clearly, respects user choice
 */
export default function MonetizationPrompt({ moment, onUpgrade, onDismiss }) {
  const [dismissed, setDismissed] = useState(false);

  const momentConfigs = {
    deal_comparison_limit: {
      type: 'feature_limit',
      headline: 'Unlock Unlimited Comparisons',
      subheading: 'Upgrade to analyze as many deals as you want',
      body: 'You\'ve compared 2 deals this month. Upgrade to compare unlimited.',
      color: 'from-violet-500 to-purple-600',
      value_items: [
        'Compare unlimited deals',
        'Save 10+ deal collections',
        'AI strategy explanations'
      ],
      free_state: 'Your comparison was saved as a free deal',
      cta_primary: 'Upgrade to Pro — $29/mo',
      cta_secondary: 'Continue with free',
      surface: 'modal_soft'
    },

    scenario_modeling_unlock: {
      type: 'feature_interest',
      headline: 'Model Your Strategy',
      subheading: 'See portfolio outcomes before investing',
      body: 'Try scenario modeling to forecast returns. See how different deal mixes affect your goals.',
      color: 'from-emerald-500 to-teal-600',
      value_items: [
        'What-if analysis',
        'Confidence in decisions',
        'Faster portfolio updates'
      ],
      free_state: 'Try 2 free scenarios',
      cta_primary: 'Explore Pro Features',
      cta_secondary: 'Maybe later',
      surface: 'contextual_card'
    },

    expert_network_unlock: {
      type: 'community_engagement',
      headline: 'Go Deeper in Your Network',
      subheading: 'Access premium expert communities',
      body: 'You\'re connecting with experts. Unlock private communities where top investors share real deals and strategies.',
      color: 'from-sky-500 to-blue-600',
      value_items: [
        'Follow unlimited experts',
        'Private deal sharing',
        '1-on-1 mentorship access'
      ],
      free_state: 'You can follow 5 free experts',
      cta_primary: 'Unlock Premium — $199/mo',
      cta_secondary: 'Stay free for now',
      surface: 'community_highlight'
    },

    power_user_celebration: {
      type: 'milestone_achievement',
      headline: 'You\'re Now a Power User 🚀',
      subheading: 'Unlock advanced tools designed for serious investors',
      body: 'Your engagement shows you\'re serious about passive income. Advanced discovery and portfolio intelligence tools are now available.',
      color: 'from-orange-500 to-red-600',
      value_items: [
        'Deal analysis & comparison',
        'Scenario modeling',
        'Expert communities'
      ],
      free_state: 'All free features unlocked',
      cta_primary: 'Explore Pro for $29/mo',
      cta_secondary: 'Dismiss',
      surface: 'celebration_modal'
    },

    hours_saved_moment: {
      type: 'value_reinforcement',
      headline: 'You\'ve Saved 15+ Hours',
      subheading: 'And growing with every comparison',
      body: 'Deal analysis that used to take days now takes minutes. That\'s the power of Pro.',
      color: 'from-pink-500 to-rose-600',
      value_items: [
        'Time saved: 15+ hours',
        'Deals analyzed: 12',
        'Better decisions: immeasurable'
      ],
      free_state: 'Keep using free tools',
      cta_primary: 'See How Pro Saves More',
      cta_secondary: 'Dismiss',
      surface: 'card_in_dashboard'
    }
  };

  const config = momentConfigs[moment?.id] || {};

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={moment?.surface === 'modal_soft' 
          ? 'fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4'
          : 'mb-6'
        }
      >
        <Card className={`border-0 shadow-xl overflow-hidden ${moment?.surface === 'modal_soft' ? 'max-w-md' : ''}`}>
          {/* Gradient header */}
          <div className={`h-2 bg-gradient-to-r ${config.color}`} />

          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">{config.headline}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">{config.subheading}</p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Body message */}
            <p className="text-sm text-gray-700">{config.body}</p>

            {/* Value items */}
            <div className="space-y-2">
              {config.value_items?.map((item, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 text-transparent bg-gradient-to-b ${config.color} bg-clip-text`} />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>

            {/* Free state clarification */}
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-xs text-gray-600 flex items-start gap-2">
                <Lock className="w-3 h-3 flex-shrink-0 mt-0.5" />
                {config.free_state}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <Button
                className={`w-full bg-gradient-to-r ${config.color} text-white`}
                onClick={() => onUpgrade?.()}
              >
                {config.cta_primary}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleDismiss}
              >
                {config.cta_secondary}
              </Button>
            </div>

            {/* Partnership tone footer */}
            <p className="text-xs text-gray-500 text-center pt-2">
              We only show this because we think it'll help you succeed. No pressure.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}