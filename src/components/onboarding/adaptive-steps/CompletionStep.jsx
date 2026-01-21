import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CompletionStep({ onComplete }) {
  useEffect(() => {
    // Trigger confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="space-y-6 py-8 text-center">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] mx-auto flex items-center justify-center glow-primary">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 left-0 right-0 mx-auto w-fit">
          <Sparkles className="w-8 h-8 text-[#ff8e42] animate-pulse" />
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-gradient mb-2">
          Welcome to FlashFusion!
        </h2>
        <p className="text-gray-400">
          Your account is set up and ready to go
        </p>
      </div>

      <div className="p-6 rounded-xl border border-[#8b85f7]/30 bg-[#8b85f7]/5">
        <Trophy className="w-8 h-8 text-[#8b85f7] mx-auto mb-2" />
        <p className="text-white font-semibold mb-1">Achievement Unlocked!</p>
        <p className="text-sm text-gray-400">You've earned +200 points for completing onboarding</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 text-left p-3 rounded-lg bg-[#1a0f2e]">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-medium">Personalized preferences saved</p>
            <p className="text-sm text-gray-400">AI will match deals to your profile</p>
          </div>
        </div>
        <div className="flex items-start gap-3 text-left p-3 rounded-lg bg-[#1a0f2e]">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-medium">Risk profile configured</p>
            <p className="text-sm text-gray-400">Recommendations tailored to your tolerance</p>
          </div>
        </div>
        <div className="flex items-start gap-3 text-left p-3 rounded-lg bg-[#1a0f2e]">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-medium">Quick-start guides ready</p>
            <p className="text-sm text-gray-400">Contextual help available throughout the app</p>
          </div>
        </div>
      </div>

      <Button onClick={() => onComplete({})} className="w-full btn-primary text-lg py-6">
        Start Exploring
        <Sparkles className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}