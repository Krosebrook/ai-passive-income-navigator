import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [metric, setMetric] = useState('total_points');
  const [isLoading, setIsLoading] = useState(true);

  async function fetchLeaderboard(selectedMetric) {
    setIsLoading(true);
    try {
      const { data } = await base44.functions.invoke('getLeaderboard', {
        metric: selectedMetric,
        limit: 10
      });
      setLeaderboard(data.leaderboard);
      setUserRank(data.user_rank);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchLeaderboard(metric);
  }, [metric]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-[#ffd700]" />;
      case 2: return <Medal className="w-6 h-6 text-[#c0c0c0]" />;
      case 3: return <Medal className="w-6 h-6 text-[#cd7f32]" />;
      default: return <span className="text-gray-400 font-bold">#{rank}</span>;
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Card className="card-dark">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gradient">
            <Trophy className="w-5 h-5" />
            Leaderboard
          </CardTitle>
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-[180px] bg-[#1a0f2e] border-[#2d1e50]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a0f2e] border-[#2d1e50]">
              <SelectItem value="total_points">Total Points</SelectItem>
              <SelectItem value="deals_closed">Deals Closed</SelectItem>
              <SelectItem value="deals_sourced">Deals Sourced</SelectItem>
              <SelectItem value="badges_earned">Badges Earned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((user, index) => (
            <motion.div
              key={user.email}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                index < 3 
                  ? 'border-[#8b85f7] bg-[#8b85f7]/10' 
                  : 'border-[#2d1e50] bg-[#1a0f2e]'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10">
                  {getRankIcon(index + 1)}
                </div>
                <div>
                  <p className="font-semibold text-white">{user.full_name || user.email}</p>
                  <p className="text-sm text-gray-400">Level {user.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[#00b7eb]">
                  {user[metric]}
                </p>
                <p className="text-xs text-gray-400">
                  {metric.replace('_', ' ')}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {userRank && userRank > 10 && (
          <div className="mt-6 p-4 rounded-xl border border-[#8b85f7] bg-[#8b85f7]/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#8b85f7]" />
                <span className="text-white font-semibold">Your Rank</span>
              </div>
              <span className="text-2xl font-bold text-[#8b85f7]">#{userRank}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}