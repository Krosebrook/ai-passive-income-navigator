import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

/**
 * Form for users to submit success stories with metrics and learnings
 */
export default function StorySubmissionForm({ open, onClose, onSubmit, isLoading, ideas: _ideas }) {
  const [formData, setFormData] = useState({
    idea_title: '',
    idea_category: '',
    story_title: '',
    story_summary: '',
    detailed_story: '',
    time_to_profit_months: '',
    initial_investment: '',
    current_monthly_revenue: '',
    roi_percentage: '',
    key_strategies: '',
    challenges_faced: '',
    lessons_learned: '',
    tools_used: '',
    mistakes_to_avoid: '',
    advice_for_beginners: ''
  });

  const handleArrayInput = (value) => value.split('\n').filter(v => v.trim());

  const handleSubmit = () => {
    const submission = {
      ...formData,
      time_to_profit_months: parseInt(formData.time_to_profit_months),
      initial_investment: parseFloat(formData.initial_investment),
      current_monthly_revenue: parseFloat(formData.current_monthly_revenue),
      roi_percentage: parseFloat(formData.roi_percentage),
      key_strategies: handleArrayInput(formData.key_strategies),
      challenges_faced: handleArrayInput(formData.challenges_faced),
      lessons_learned: handleArrayInput(formData.lessons_learned),
      tools_used: handleArrayInput(formData.tools_used),
      mistakes_to_avoid: handleArrayInput(formData.mistakes_to_avoid)
    };
    onSubmit(submission);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Your Success Story</DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Idea Title *</label>
              <Input
                value={formData.idea_title}
                onChange={(e) => setFormData({ ...formData, idea_title: e.target.value })}
                placeholder="e.g., YouTube Channel"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Input
                value={formData.idea_category}
                onChange={(e) => setFormData({ ...formData, idea_category: e.target.value })}
                placeholder="e.g., Digital Products"
              />
            </div>
          </div>

          {/* Story Title */}
          <div>
            <label className="text-sm font-medium mb-1 block">Story Title *</label>
            <Input
              value={formData.story_title}
              onChange={(e) => setFormData({ ...formData, story_title: e.target.value })}
              placeholder="e.g., How I Made $5K/Month with YouTube"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="text-sm font-medium mb-1 block">Quick Summary *</label>
            <Textarea
              value={formData.story_summary}
              onChange={(e) => setFormData({ ...formData, story_summary: e.target.value })}
              placeholder="Brief overview of your success story"
              rows={2}
            />
          </div>

          {/* Full Story */}
          <div>
            <label className="text-sm font-medium mb-1 block">Detailed Story *</label>
            <Textarea
              value={formData.detailed_story}
              onChange={(e) => setFormData({ ...formData, detailed_story: e.target.value })}
              placeholder="Share your journey, challenges, and how you overcame them"
              rows={4}
            />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Months to Profit</label>
              <Input
                type="number"
                value={formData.time_to_profit_months}
                onChange={(e) => setFormData({ ...formData, time_to_profit_months: e.target.value })}
                placeholder="3"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Initial Investment ($)</label>
              <Input
                type="number"
                value={formData.initial_investment}
                onChange={(e) => setFormData({ ...formData, initial_investment: e.target.value })}
                placeholder="500"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Current Monthly Revenue ($) *</label>
              <Input
                type="number"
                value={formData.current_monthly_revenue}
                onChange={(e) => setFormData({ ...formData, current_monthly_revenue: e.target.value })}
                placeholder="5000"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">ROI (%)</label>
              <Input
                type="number"
                value={formData.roi_percentage}
                onChange={(e) => setFormData({ ...formData, roi_percentage: e.target.value })}
                placeholder="400"
              />
            </div>
          </div>

          {/* List Inputs */}
          <div>
            <label className="text-sm font-medium mb-1 block">Key Strategies (one per line)</label>
            <Textarea
              value={formData.key_strategies}
              onChange={(e) => setFormData({ ...formData, key_strategies: e.target.value })}
              placeholder="Strategy 1&#10;Strategy 2&#10;Strategy 3"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Challenges Faced (one per line)</label>
            <Textarea
              value={formData.challenges_faced}
              onChange={(e) => setFormData({ ...formData, challenges_faced: e.target.value })}
              placeholder="Challenge 1&#10;Challenge 2"
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Lessons Learned (one per line)</label>
            <Textarea
              value={formData.lessons_learned}
              onChange={(e) => setFormData({ ...formData, lessons_learned: e.target.value })}
              placeholder="Lesson 1&#10;Lesson 2&#10;Lesson 3"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Tools Used (one per line)</label>
            <Textarea
              value={formData.tools_used}
              onChange={(e) => setFormData({ ...formData, tools_used: e.target.value })}
              placeholder="Tool 1&#10;Tool 2"
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Mistakes to Avoid (one per line)</label>
            <Textarea
              value={formData.mistakes_to_avoid}
              onChange={(e) => setFormData({ ...formData, mistakes_to_avoid: e.target.value })}
              placeholder="Mistake 1&#10;Mistake 2"
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Advice for Beginners</label>
            <Textarea
              value={formData.advice_for_beginners}
              onChange={(e) => setFormData({ ...formData, advice_for_beginners: e.target.value })}
              placeholder="What would you tell someone starting this idea?"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !formData.idea_title || !formData.story_title || !formData.current_monthly_revenue}
            className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Share Your Story'
            )}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}