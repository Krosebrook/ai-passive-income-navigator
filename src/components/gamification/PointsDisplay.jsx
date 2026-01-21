import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PointsDisplay({ points, level, className }) {
  const pointsToNextLevel = ((level || 1) * 1000) - (points || 0);
  const progressPercentage = ((points || 0) % 1000) / 10;

  return (
    <Card className={`card-dark ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-400">Your Level</p>
            <p className="text-3xl font-bold text-gradient flex items-center gap-2">
              <Award className="w-8 h-8 text-[#8b85f7]" />
              {level || 1}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Total Points</p>
            <p className="text-3xl font-bold text-[#00b7eb] flex items-center gap-2">
              <Star className="w-8 h-8" />
              {points || 0}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Progress to Level {(level || 1) + 1}</span>
            <span className="text-[#8b85f7] font-medium">{pointsToNextLevel} points needed</span>
          </div>
          <div className="w-full bg-[#2d1e50] rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] glow-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
          <TrendingUp className="w-4 h-4 text-[#00b7eb]" />
          <span>Keep earning points to level up!</span>
        </div>
      </CardContent>
    </Card>
  );
}