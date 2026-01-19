import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Sparkles, TrendingUp, Brain, Zap, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FEATURES = [
  {
    id: 'ai-deals',
    icon: Sparkles,
    title: 'AI-Generated Deals',
    description: 'Get personalized investment opportunities matched to your goals and risk tolerance.',
    benefits: [
      'Smart matching based on your preferences',
      'Real-time market analysis',
      'Predictive ROI and risk scoring'
    ],
    color: 'from-[#8b85f7] to-[#583cf0]'
  },
  {
    id: 'portfolio',
    icon: TrendingUp,
    title: 'Portfolio Analytics',
    description: 'Track performance, manage ideas, and get AI-powered rebalancing suggestions.',
    benefits: [
      'Real-time performance tracking',
      'Automated rebalancing recommendations',
      'Financial forecasting and insights'
    ],
    color: 'from-[#00b7eb] to-[#0095c7]'
  },
  {
    id: 'ai-assistant',
    icon: Brain,
    title: 'AI Financial Assistant',
    description: 'Ask questions about deals, market conditions, and get instant expert insights.',
    benefits: [
      'Natural language Q&A about your investments',
      'Market trend analysis',
      'Personalized recommendations'
    ],
    color: 'from-[#ff8e42] to-[#f0ab65]'
  }
];

export default function FeatureTourStep({ onNext }) {
  const [currentFeature, setCurrentFeature] = useState(0);

  const feature = FEATURES[currentFeature];
  const Icon = feature.icon;

  const handleNext = () => {
    if (currentFeature < FEATURES.length - 1) {
      setCurrentFeature(currentFeature + 1);
    } else {
      onNext({});
    }
  };

  const handlePrev = () => {
    if (currentFeature > 0) {
      setCurrentFeature(currentFeature - 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Explore Key Features</h2>
        <p className="text-gray-400">Discover what makes FlashFusion powerful</p>
      </div>

      {/* Feature Progress */}
      <div className="flex gap-2 justify-center mb-6">
        {FEATURES.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded-full transition-all ${
              idx === currentFeature
                ? 'w-12 bg-gradient-to-r from-[#8b85f7] to-[#00b7eb]'
                : 'w-8 bg-[#2d1e50]'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentFeature}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-[#1a0f2e] border-[#2d1e50]">
            <CardContent className="p-8">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center glow-primary mb-6`}>
                <Icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 mb-6">{feature.description}</p>

              <div className="space-y-3">
                {feature.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#8b85f7]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="w-3 h-3 text-[#8b85f7]" />
                    </div>
                    <p className="text-sm text-gray-300">{benefit}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3">
        {currentFeature > 0 && (
          <Button
            variant="outline"
            onClick={handlePrev}
            className="border-[#2d1e50] text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>
        )}
        <Button
          onClick={handleNext}
          className="flex-1 bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] hover:from-[#9a95ff] hover:to-[#00d4ff]"
          size="lg"
        >
          {currentFeature < FEATURES.length - 1 ? 'Next Feature' : 'Continue'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      <p className="text-center text-sm text-gray-500">
        {currentFeature + 1} of {FEATURES.length}
      </p>
    </div>
  );
}