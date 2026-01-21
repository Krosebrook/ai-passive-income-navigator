import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Award, Target } from 'lucide-react';
import PointsDisplay from '@/components/gamification/PointsDisplay';
import BadgeDisplay from '@/components/gamification/BadgeDisplay';
import Leaderboard from '@/components/gamification/Leaderboard';
import ProgressTracker from '@/components/gamification/ProgressTracker';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Gamification() {
  const [user, setUser] = useState(null);
  const [onboardingProgress, setOnboardingProgress] = useState(null);
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const userData = await base44.auth.me();
        setUser(userData);

        const onboarding = await base44.entities.OnboardingState.filter({
          user_email: userData.email
        });
        setOnboardingProgress(onboarding[0]);

        const userDeals = await base44.entities.SourcedDealOpportunity.filter({
          created_by: userData.email
        });
        setDeals(userDeals);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const closedDeals = deals.filter(d => d.status === 'accepted' || d.status === 'in_progress').length;
  const onboardingSteps = onboardingProgress?.completed_steps?.length || 0;

  const investmentGoals = [
    {
      label: 'Source 10 Deals',
      current: deals.length,
      target: 10,
      reward: '+500 points'
    },
    {
      label: 'Close First Deal',
      current: closedDeals,
      target: 1,
      reward: '+1000 points'
    },
    {
      label: 'Reach Level 5',
      current: user?.level || 1,
      target: 5,
      reward: 'Gold Badge'
    },
    {
      label: 'Earn 5000 Points',
      current: user?.total_points || 0,
      target: 5000,
      reward: 'Elite Status'
    }
  ];

  const onboardingGoals = [
    {
      label: 'Complete Profile',
      current: onboardingProgress?.completed_at ? 1 : 0,
      target: 1,
      reward: '+100 points'
    },
    {
      label: 'Set Preferences',
      current: onboardingSteps >= 3 ? 1 : 0,
      target: 1,
      reward: '+50 points'
    },
    {
      label: 'Explore Features',
      current: onboardingSteps >= 5 ? 1 : 0,
      target: 1,
      reward: '+75 points'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gradient mb-2 flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8" />
          Your Achievements
        </h1>
        <p className="text-gray-400">
          Track your progress, earn rewards, and compete with others
        </p>
      </motion.div>

      {/* Points Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <PointsDisplay 
          points={user?.total_points || 0} 
          level={user?.level || 1}
        />
      </motion.div>

      {/* Progress Trackers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ProgressTracker 
            title="Investment Goals" 
            goals={investmentGoals}
            icon={Target}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ProgressTracker 
            title="Onboarding Progress" 
            goals={onboardingGoals}
            icon={Award}
          />
        </motion.div>
      </div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <BadgeDisplay />
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Leaderboard />
      </motion.div>
    </div>
  );
}