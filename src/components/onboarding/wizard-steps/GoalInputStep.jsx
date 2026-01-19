import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, GraduationCap, Loader2 } from 'lucide-react';

const GOALS = [
  { value: 'passive_income', label: 'Generate Passive Income', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
  { value: 'capital_growth', label: 'Grow My Capital', icon: Target, color: 'from-blue-500 to-cyan-500' },
  { value: 'learn_deals', label: 'Learn About Deals', icon: GraduationCap, color: 'from-purple-500 to-pink-500' }
];

const EXPERIENCE = ['beginner', 'intermediate', 'experienced'];
const TIME_COMMITMENT = ['1-2 hours/week', '3-5 hours/week', '5-10 hours/week', '10+ hours/week'];

export default function GoalInputStep({ onNext, isLoading }) {
  const [userGoal, setUserGoal] = useState('');
  const [experience, setExperience] = useState('');
  const [timeCommitment, setTimeCommitment] = useState('');

  const canProceed = userGoal && experience && timeCommitment;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Let's personalize your experience</h2>
        <p className="text-gray-400">
          Tell us about yourself so we can tailor FlashFusion to your needs
        </p>
      </div>

      {/* Primary Goal */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">What's your primary goal?</Label>
        <div className="grid grid-cols-1 gap-3">
          {GOALS.map(goal => {
            const Icon = goal.icon;
            return (
              <button
                key={goal.value}
                onClick={() => setUserGoal(goal.value)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  userGoal === goal.value
                    ? 'border-[#8b85f7] bg-[#8b85f7]/10'
                    : 'border-[#2d1e50] bg-[#0f0618] hover:border-[#8b85f7]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${goal.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-medium">{goal.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Experience with deals?</Label>
        <div className="flex gap-2 flex-wrap">
          {EXPERIENCE.map(exp => (
            <Badge
              key={exp}
              onClick={() => setExperience(exp)}
              className={`cursor-pointer px-4 py-2 ${
                experience === exp
                  ? 'bg-[#8b85f7] text-white'
                  : 'bg-[#0f0618] text-gray-400 border-[#2d1e50] hover:border-[#8b85f7]/50'
              }`}
            >
              {exp.charAt(0).toUpperCase() + exp.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      {/* Time Commitment */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Time you can dedicate?</Label>
        <div className="flex gap-2 flex-wrap">
          {TIME_COMMITMENT.map(time => (
            <Badge
              key={time}
              onClick={() => setTimeCommitment(time)}
              className={`cursor-pointer px-4 py-2 ${
                timeCommitment === time
                  ? 'bg-[#00b7eb] text-white'
                  : 'bg-[#0f0618] text-gray-400 border-[#2d1e50] hover:border-[#00b7eb]/50'
              }`}
            >
              {time}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={() => onNext({ userGoal, experience, timeCommitment })}
          disabled={!canProceed || isLoading}
          size="lg"
          className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              AI is personalizing...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </div>
  );
}