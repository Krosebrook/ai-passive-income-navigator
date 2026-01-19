import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, TrendingUp, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CompletionStep({ data, onNext }) {
  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="space-y-6 text-center">
      <div>
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-6 animate-pulse">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gradient mb-4">
          You're All Set! 🎉
        </h2>
        <p className="text-lg text-gray-300 max-w-xl mx-auto">
          Your FlashFusion account is configured and ready to help you discover amazing passive income opportunities.
        </p>
      </div>

      <div className="card-dark p-6 max-w-md mx-auto">
        <h3 className="font-semibold mb-4 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-[#8b85f7]" />
          What happens next?
        </h3>
        <div className="space-y-3 text-left">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold">1</span>
            </div>
            <div>
              <p className="text-sm font-medium">AI Starts Working</p>
              <p className="text-xs text-gray-400">Our AI will scan 50+ platforms daily for deals matching your preferences</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00b7eb] to-[#0099cc] flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold">2</span>
            </div>
            <div>
              <p className="text-sm font-medium">Get Daily Matches</p>
              <p className="text-xs text-gray-400">Receive personalized deal recommendations every day</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff8e42] to-[#f0ab65] flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold">3</span>
            </div>
            <div>
              <p className="text-sm font-medium">Build Your Portfolio</p>
              <p className="text-xs text-gray-400">Track deals, perform due diligence, and make informed decisions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <Button
          onClick={() => onNext({})}
          size="lg"
          className="bg-gradient-to-r from-[#8b85f7] via-[#00b7eb] to-[#ff8e42] hover:shadow-lg hover:shadow-[#8b85f7]/50 px-12"
        >
          <Zap className="w-5 h-5 mr-2" />
          Start Discovering Deals
        </Button>
        <p className="text-xs text-gray-500">
          You can always update your preferences in Settings
        </p>
      </div>
    </div>
  );
}