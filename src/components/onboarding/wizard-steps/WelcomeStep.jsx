import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, TrendingUp, Shield } from 'lucide-react';

export default function WelcomeStep({ onNext }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] mb-6 glow-primary">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gradient mb-4">
          Welcome to FlashFusion
        </h2>
        <p className="text-lg text-gray-300 max-w-xl mx-auto">
          Your AI-powered platform for discovering and validating passive income opportunities in minutes, not months.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="card-dark p-4 text-center">
          <Zap className="w-8 h-8 text-[#8b85f7] mx-auto mb-3" />
          <h3 className="font-semibold mb-2">AI Deal Sourcing</h3>
          <p className="text-sm text-gray-400">
            Scan 50+ platforms daily for perfect opportunities
          </p>
        </div>
        <div className="card-dark p-4 text-center">
          <TrendingUp className="w-8 h-8 text-[#00b7eb] mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Smart Matching</h3>
          <p className="text-sm text-gray-400">
            Get deals matched to your exact preferences
          </p>
        </div>
        <div className="card-dark p-4 text-center">
          <Shield className="w-8 h-8 text-[#ff8e42] mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Due Diligence</h3>
          <p className="text-sm text-gray-400">
            AI-powered risk analysis and validation
          </p>
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <Button
          onClick={() => onNext({})}
          size="lg"
          className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] hover:from-[#9a95ff] hover:to-[#00d4ff] px-12"
        >
          Get Started
          <Sparkles className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}