import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, TrendingUp, Users } from 'lucide-react';

export default function CompleteStep() {
  return (
    <div className="text-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center glow-primary"
      >
        <CheckCircle className="w-12 h-12 text-white" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-3xl font-bold text-gradient mb-4"
      >
        You're All Set! 🎉
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
      >
        Your personalized dashboard is ready! We've customized everything based on your preferences.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto"
      >
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4">
          <Sparkles className="w-8 h-8 text-violet-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">AI Deal Discovery</p>
          <p className="text-xs text-gray-600 mt-1">Ready to find opportunities</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
          <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Portfolio Tracking</p>
          <p className="text-xs text-gray-600 mt-1">Start building your portfolio</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
          <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Community Access</p>
          <p className="text-xs text-gray-600 mt-1">Connect with investors</p>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-sm text-gray-500 mt-8"
      >
        Click "Complete Setup" to enter your personalized dashboard
      </motion.p>
    </div>
  );
}