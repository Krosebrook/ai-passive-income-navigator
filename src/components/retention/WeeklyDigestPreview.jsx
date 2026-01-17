import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, MessageSquare, Target, X } from 'lucide-react';

/**
 * Preview of weekly digest
 * Customizable frequency and content
 */
export default function WeeklyDigestPreview({ retentionState, onClose }) {
  const digest = retentionState?.weekly_digest || {};

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed bottom-6 right-6 max-w-md z-30"
    >
      <Card className="border-0 shadow-xl">
        <CardHeader className="pb-3 flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-base">Your Weekly Digest</CardTitle>
            <p className="text-xs text-gray-500 mt-1">What changed this week</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* What Changed */}
          <div className="space-y-2">
            <p className="font-medium text-sm text-gray-900">📊 What Changed</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 3 new deals match your criteria</li>
              <li>• 2 community discussions in your interests</li>
            </ul>
          </div>

          {/* Top Insights */}
          <div className="space-y-2">
            <p className="font-medium text-sm text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Key Insights
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Your deal preferences are getting refined</li>
              <li>• You're on track with your goals</li>
            </ul>
          </div>

          {/* Your Progress */}
          <div className="p-3 rounded-lg bg-violet-50 border border-violet-100">
            <p className="text-xs font-medium text-violet-900">
              📈 You're building momentum — 2 weeks active
            </p>
          </div>

          {/* Frequency control */}
          <div className="space-y-2 border-t pt-3">
            <p className="text-xs font-medium text-gray-700">Email Frequency</p>
            <div className="flex gap-2">
              {['weekly', 'bi_weekly', 'disabled'].map(freq => (
                <button
                  key={freq}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    digest.frequency === freq
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {freq === 'bi_weekly' ? 'Bi-weekly' : freq.charAt(0).toUpperCase() + freq.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="flex-1 text-xs"
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-xs"
              onClick={onClose}
            >
              View Full Digest
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}