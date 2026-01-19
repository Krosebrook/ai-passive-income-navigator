import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Rocket, Sparkles, TrendingUp, Brain } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CompletionStep({ onComplete, userData }) {
  const handleComplete = () => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    setTimeout(() => onComplete(), 500);
  };

  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
      >
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center glow-primary mb-6">
          <Rocket className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      <div>
        <h2 className="text-4xl font-bold text-white mb-3">You're All Set!</h2>
        <p className="text-xl text-gray-400">
          Your FlashFusion account is ready to help you build passive income
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto py-6">
        <div className="bg-[#1a0f2e] rounded-xl p-4 border border-[#2d1e50]">
          <Sparkles className="w-8 h-8 text-[#8b85f7] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-white mb-1">AI Deals Ready</h3>
          <p className="text-xs text-gray-400">Personalized opportunities waiting</p>
        </div>
        <div className="bg-[#1a0f2e] rounded-xl p-4 border border-[#2d1e50]">
          <TrendingUp className="w-8 h-8 text-[#00b7eb] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-white mb-1">Portfolio Set</h3>
          <p className="text-xs text-gray-400">
            {userData.first_goal_created ? 'First idea added' : 'Ready to track ideas'}
          </p>
        </div>
        <div className="bg-[#1a0f2e] rounded-xl p-4 border border-[#2d1e50]">
          <Brain className="w-8 h-8 text-[#ff8e42] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-white mb-1">AI Assistant</h3>
          <p className="text-xs text-gray-400">Available for questions</p>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleComplete}
          size="lg"
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-lg px-8"
        >
          Start Exploring
          <Sparkles className="w-5 h-5 ml-2" />
        </Button>

        <p className="text-sm text-gray-400">
          🎉 Welcome to your passive income journey!
        </p>
      </div>
    </div>
  );
}