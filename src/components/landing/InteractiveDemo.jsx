import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Sparkles, TrendingUp, Zap, Target, Clock, DollarSign, ArrowRight, Loader2 } from 'lucide-react';

const DEMO_PROMPTS = [
  "AI-powered pet products",
  "Sustainable fashion subscription",
  "Local service marketplace",
  "Educational tech for kids"
];

export default function InteractiveDemo() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState(null);

  const generateScenario = async (userPrompt) => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateDemoScenario', {
        prompt: userPrompt,
        scenario_type: 'deal_discovery'
      });

      setScenario(response.data.scenario);
    } catch (error) {
      console.error('Demo generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      generateScenario(prompt);
    }
  };

  return (
    <div className="w-full">
      {/* Demo Input */}
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Try: 'AI-powered pet products' or 'sustainable fashion'"
            className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12 text-base"
          />
          <Button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="bg-gradient-to-r from-[#ff1cf7] to-[#00e5ff] text-white hover:opacity-90 h-12 px-8 whitespace-nowrap"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Try It Free
              </>
            )}
          </Button>
        </form>

        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-gray-400">Try:</span>
          {DEMO_PROMPTS.map((demoPrompt) => (
            <button
              key={demoPrompt}
              onClick={() => {
                setPrompt(demoPrompt);
                generateScenario(demoPrompt);
              }}
              disabled={loading}
              className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-[#ff1cf7]/50 hover:text-white transition-all disabled:opacity-50"
            >
              {demoPrompt}
            </button>
          ))}
        </div>
      </div>

      {/* Demo Results */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12"
          >
            <div className="inline-block p-4 rounded-full bg-gradient-to-r from-[#ff1cf7]/20 to-[#00e5ff]/20 mb-4">
              <Loader2 className="w-8 h-8 text-[#ff1cf7] animate-spin" />
            </div>
            <p className="text-gray-400">AI analyzing market opportunities...</p>
          </motion.div>
        )}

        {scenario && !loading && (
          <motion.div
            key="scenario"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Main Deal Card */}
            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 mb-4 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#ff1cf7]/20 to-[#00e5ff]/20 rounded-full blur-3xl -z-10" />
              
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-[#ff1cf7]/20 text-[#ff1cf7] border-[#ff1cf7]/30">
                        {scenario.deal.industry}
                      </Badge>
                      <Badge className="bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]/30">
                        ICE Score: {scenario.deal.ice_score}
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {scenario.deal.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {scenario.thought_process}
                    </p>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-black/20 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-gray-400">ROI</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {scenario.deal.roi_projection}
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-[#ff1cf7]" />
                      <span className="text-xs text-gray-400">Risk</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {scenario.deal.risk_score}/10
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-[#00e5ff]" />
                      <span className="text-xs text-gray-400">Timeline</span>
                    </div>
                    <div className="text-sm font-bold text-white">
                      {scenario.deal.time_to_profit}
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-[#ff6b35]" />
                      <span className="text-xs text-gray-400">Investment</span>
                    </div>
                    <div className="text-sm font-bold text-white">
                      {scenario.deal.initial_investment}
                    </div>
                  </div>
                </div>

                {/* Key Highlights */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Key Highlights</h4>
                  <ul className="space-y-2">
                    {scenario.deal.key_highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                        <Zap className="w-4 h-4 text-[#ff1cf7] mt-0.5 flex-shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Why Now */}
                <div className="bg-gradient-to-r from-[#ff1cf7]/10 to-[#00e5ff]/10 border border-[#ff1cf7]/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#ff1cf7]" />
                    <h4 className="text-sm font-semibold text-white">Why Now?</h4>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {scenario.deal.why_now}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#00e5ff]" />
                    Market Insight
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {scenario.analysis.market_trend}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#ff6b35]" />
                    Competitive Edge
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {scenario.analysis.competitive_advantage}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CTA */}
            <div className="mt-6 text-center">
              <Button
                onClick={() => window.location.href = '/'}
                className="bg-gradient-to-r from-[#ff1cf7] to-[#00e5ff] text-white hover:opacity-90"
              >
                Get More Deals Like This
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {!scenario && !loading && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl"
          >
            <div className="inline-block p-4 rounded-full bg-gradient-to-r from-[#ff1cf7]/20 to-[#00e5ff]/20 mb-4">
              <Sparkles className="w-8 h-8 text-[#ff1cf7]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              See FlashFusion in Action
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Enter any business idea above and watch AI find real passive income opportunities in seconds
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}