import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Users, BarChart3, Zap } from 'lucide-react';

const BENEFITS = [
  { icon: TrendingUp, title: 'AI-Powered Deal Discovery', desc: 'Find opportunities matching your criteria' },
  { icon: BarChart3, title: 'Smart Portfolio Management', desc: 'Track and optimize your investments' },
  { icon: Users, title: 'Collaborative Network', desc: 'Connect with like-minded investors' },
  { icon: Zap, title: 'Automated Insights', desc: 'Get AI-driven recommendations' }
];

export default function WelcomeStep() {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#8b85f7] via-[#00b7eb] to-[#ff8e42] flex items-center justify-center glow-primary"
      >
        <Sparkles className="w-12 h-12 text-white" />
      </motion.div>
      
      <h3 className="text-3xl font-bold text-gradient mb-4">
        Welcome to FlashFusion
      </h3>
      <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
        Let's personalize your experience! We'll ask a few questions to help you discover the best 
        passive income opportunities, build a winning portfolio, and connect with the right community.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {BENEFITS.map((benefit, idx) => {
          const Icon = benefit.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-left"
            >
              <Icon className="w-8 h-8 text-violet-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
              <p className="text-sm text-gray-600">{benefit.desc}</p>
            </motion.div>
          );
        })}
      </div>

      <p className="text-sm text-gray-500">
        ⏱️ Takes about 3-5 minutes • You can skip and complete later
      </p>
    </div>
  );
}