import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Users, Clock, Zap } from 'lucide-react';

export default function UserEngagementMetrics({ analytics }) {
  const engagementData = useMemo(() => {
    const metrics = {
      'Deal Sourcing': Math.floor(Math.random() * 100),
      'Portfolio Management': Math.floor(Math.random() * 100),
      'AI Coach': Math.floor(Math.random() * 100),
      'Community': Math.floor(Math.random() * 100),
      'Analytics': Math.floor(Math.random() * 100)
    };

    return Object.entries(metrics).map(([feature, usage]) => ({
      feature,
      usage,
      fullMark: 100
    }));
  }, []);

  const userStats = useMemo(() => {
    const total = analytics.length;
    const completed = analytics.filter(u => u.has_completed_onboarding).length;
    const avgTimeCommitment = analytics.length > 0 
      ? analytics.reduce((sum, u) => sum + (u.time_commitment || 0), 0) / analytics.length 
      : 0;

    return { total, completed, completionRate: total > 0 ? (completed / total * 100).toFixed(1) : 0, avgTimeCommitment };
  }, [analytics]);

  const activityData = [
    { day: 'Mon', active: 45, sessions: 120 },
    { day: 'Tue', active: 52, sessions: 145 },
    { day: 'Wed', active: 48, sessions: 132 },
    { day: 'Thu', active: 61, sessions: 178 },
    { day: 'Fri', active: 55, sessions: 156 },
    { day: 'Sat', active: 38, sessions: 98 },
    { day: 'Sun', active: 32, sessions: 85 }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{userStats.completed}/{userStats.total}</div>
                <div className="text-sm text-gray-400">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{userStats.completionRate}%</div>
                <div className="text-sm text-gray-400">Completion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {['1-5', '5-10', '10-20', '20-40', '40+'][Math.round(userStats.avgTimeCommitment)]}h
                </div>
                <div className="text-sm text-gray-400">Avg Time/Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Usage */}
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-[#8b85f7]" />
              Feature Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={engagementData}>
                <PolarGrid stroke="#2d1e50" />
                <PolarAngleAxis dataKey="feature" stroke="#64748b" tick={{ fill: '#64748b' }} />
                <PolarRadiusAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                <Radar 
                  name="Usage %" 
                  dataKey="usage" 
                  stroke="#8b85f7" 
                  fill="#8b85f7" 
                  fillOpacity={0.6} 
                />
                <Legend wrapperStyle={{ color: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a0f2e', 
                    border: '1px solid #2d1e50',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#ffffff' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Activity */}
        <Card className="bg-[#1a0f2e] border-[#2d1e50]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="w-5 h-5 text-blue-500" />
              Daily Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d1e50" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a0f2e', 
                    border: '1px solid #2d1e50',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#ffffff' }}
                />
                <Legend wrapperStyle={{ color: '#64748b' }} />
                <Bar dataKey="active" fill="#00b7eb" name="Active Users" radius={[8, 8, 0, 0]} />
                <Bar dataKey="sessions" fill="#8b85f7" name="Sessions" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}