import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';

const FEEDBACK_REASONS = {
  good: [
    'Perfect industry match',
    'Right investment size',
    'Strong ROI potential',
    'Low risk profile',
    'Aligned with my goals',
    'Clear path to execution'
  ],
  bad: [
    'Wrong industry',
    'Too expensive',
    'Too risky',
    'Low ROI potential',
    'Unclear business model',
    'Too competitive'
  ]
};

export default function DealFeedbackModal({ isOpen, onClose, deal, onSubmit, isSubmitting }) {
  const [feedbackType, setFeedbackType] = useState(null);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [customFeedback, setCustomFeedback] = useState('');

  const handleSubmit = () => {
    onSubmit({
      dealId: deal.id,
      dealTitle: deal.title,
      feedbackType,
      reasons: selectedReasons,
      customFeedback,
      matchScore: deal.match_score
    });
    
    // Reset form
    setFeedbackType(null);
    setSelectedReasons([]);
    setCustomFeedback('');
  };

  const toggleReason = (reason) => {
    setSelectedReasons(prev =>
      prev.includes(reason)
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a0f2e] border-[#2d1e50] text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Help AI Learn Your Preferences</DialogTitle>
          <DialogDescription className="text-gray-400">
            Tell us about "{deal?.title}" to improve future deal matches
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Feedback Type */}
          {!feedbackType && (
            <div className="space-y-3">
              <Label className="text-sm text-gray-400">Was this a good match?</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setFeedbackType('good')}
                  className="h-20 bg-green-500/20 border-2 border-green-500/50 hover:bg-green-500/30 text-green-400"
                >
                  <ThumbsUp className="w-6 h-6 mr-2" />
                  Good Match
                </Button>
                <Button
                  onClick={() => setFeedbackType('bad')}
                  className="h-20 bg-red-500/20 border-2 border-red-500/50 hover:bg-red-500/30 text-red-400"
                >
                  <ThumbsDown className="w-6 h-6 mr-2" />
                  Poor Match
                </Button>
              </div>
            </div>
          )}

          {/* Reasons */}
          {feedbackType && (
            <>
              <div className="space-y-3">
                <Label className="text-sm text-gray-400">
                  Why was this a {feedbackType === 'good' ? 'good' : 'poor'} match?
                </Label>
                <div className="flex flex-wrap gap-2">
                  {FEEDBACK_REASONS[feedbackType].map(reason => (
                    <Badge
                      key={reason}
                      onClick={() => toggleReason(reason)}
                      className={`cursor-pointer transition-all ${
                        selectedReasons.includes(reason)
                          ? feedbackType === 'good'
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                          : 'bg-[#0f0618] text-gray-400 border-[#2d1e50] hover:border-[#8b85f7]/50'
                      }`}
                    >
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Custom Feedback */}
              <div className="space-y-3">
                <Label className="text-sm text-gray-400">
                  Additional feedback (optional)
                </Label>
                <Textarea
                  value={customFeedback}
                  onChange={(e) => setCustomFeedback(e.target.value)}
                  placeholder="Tell us more about what you liked or didn't like..."
                  className="bg-[#0f0618] border-[#2d1e50] min-h-[100px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setFeedbackType(null)}
                  className="flex-1 border-[#2d1e50]"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={selectedReasons.length === 0 || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-[#8b85f7] to-[#00b7eb]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}