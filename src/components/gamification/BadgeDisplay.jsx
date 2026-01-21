import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, Medal, Star, Target, Zap, Crown, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const iconMap = {
  Trophy, Award, Medal, Star, Target, Zap, Crown, Shield
};

const tierColors = {
  bronze: 'from-[#cd7f32] to-[#8b5a3c]',
  silver: 'from-[#c0c0c0] to-[#808080]',
  gold: 'from-[#ffd700] to-[#ffaa00]',
  platinum: 'from-[#e5e4e2] to-[#a8a8a8]'
};

export default function BadgeDisplay() {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBadges() {
      try {
        const user = await base44.auth.me();
        const earned = await base44.entities.UserAchievement.filter({ user_email: user.email });
        const all = await base44.entities.Badge.list();
        
        setEarnedBadges(earned);
        setAllBadges(all);
      } catch (error) {
        console.error('Error fetching badges:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBadges();
  }, []);

  if (isLoading) return <LoadingSpinner />;

  const earnedBadgeIds = new Set(earnedBadges.map(b => b.badge_id));

  return (
    <Card className="card-dark">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gradient">
          <Trophy className="w-5 h-5" />
          Your Badges ({earnedBadges.length}/{allBadges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {allBadges.map((badge, index) => {
            const isEarned = earnedBadgeIds.has(badge.badge_id);
            const Icon = iconMap[badge.icon] || Trophy;
            
            return (
              <motion.div
                key={badge.badge_id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-4 rounded-xl border text-center ${
                  isEarned 
                    ? 'border-[#8b85f7] bg-gradient-to-br ' + tierColors[badge.tier] 
                    : 'border-[#2d1e50] bg-[#1a0f2e] opacity-50'
                }`}
              >
                <Icon className={`w-12 h-12 mx-auto mb-2 ${isEarned ? 'text-white' : 'text-gray-600'}`} />
                <p className={`text-sm font-semibold ${isEarned ? 'text-white' : 'text-gray-500'}`}>
                  {badge.name}
                </p>
                <p className={`text-xs mt-1 ${isEarned ? 'text-gray-200' : 'text-gray-600'}`}>
                  {badge.description}
                </p>
                {isEarned && (
                  <Badge className="absolute -top-2 -right-2 badge-success">
                    ✓
                  </Badge>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}