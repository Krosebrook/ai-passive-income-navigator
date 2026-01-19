import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Rocket, TrendingUp, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WelcomeStep({ onNext }) {
  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
      >
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#8b85f7] via-[#00b7eb] to-[#ff8e42] flex items-center justify-center glow-primary mb-6">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      <div>
        <h1 className="text-4xl font-bold text-white mb-3">
          Welcome to <span className="text-gradient">FlashFusion</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Your AI-powered platform for discovering and managing passive income opportunities
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto py-6">
        <div className="bg-[#1a0f2e] rounded-xl p-4 border border-[#2d1e50]">
          <Brain className="w-8 h-8 text-[#8b85f7] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-white mb-1">AI-Powered Deals</h3>
          <p className="text-xs text-gray-400">Smart recommendations matched to your goals</p>
        </div>
        <div className="bg-[#1a0f2e] rounded-xl p-4 border border-[#2d1e50]">
          <TrendingUp className="w-8 h-8 text-[#00b7eb] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-white mb-1">Portfolio Analytics</h3>
          <p className="text-xs text-gray-400">Track performance and optimize returns</p>
        </div>
        <div className="bg-[#1a0f2e] rounded-xl p-4 border border-[#2d1e50]">
          <Rocket className="w-8 h-8 text-[#ff8e42] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-white mb-1">Fast Setup</h3>
          <p className="text-xs text-gray-400">Get started in under 2 minutes</p>
        </div>
      </div>

      <Button
        onClick={() => onNext({})}
        size="lg"
        className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] hover:from-[#9a95ff] hover:to-[#00d4ff] text-lg px-8"
      >
        Let's Get Started
        <Sparkles className="w-5 h-5 ml-2" />
      </Button>

      <p className="text-sm text-gray-500">
        ⚡ Takes less than 2 minutes • Skip anytime
      </p>
    </div>
  );
}