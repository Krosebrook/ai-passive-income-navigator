import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock, Target, Users } from 'lucide-react';

/**
 * Displays value metrics to power users
 * Reinforces ROI of engagement and membership
 */
export default function PowerUserValueMetrics({ metrics }) {
  const displayMetrics = [
    {
      id: 'hours_saved',
      label: 'Hours Saved',
      value: metrics?.hours_saved_estimate || 0,
      unit: 'hrs',
      icon: Clock,
      color: 'from-blue-500 to-cyan-600',
      message: 'Deal analysis that used to take days now takes minutes'
    },
    {
      id: 'deals_analyzed',
      label: 'Deals Analyzed',
      value: metrics?.deals_analyzed || 0,
      unit: '',
      icon: TrendingUp,
      color: 'from-violet-500 to-purple-600',
      message: 'Deals evaluated using your strategy'
    },
    {
      id: 'strategy_decisions',
      label: 'Strategy Decisions',
      value: metrics?.portfolio_decisions_supported || 0,
      unit: '',
      icon: Target,
      color: 'from-emerald-500 to-teal-600',
      message: 'Portfolio adjustments informed by insights'
    },
    {
      id: 'expert_connections',
      label: 'Expert Connections',
      value: metrics?.expert_connections || 0,
      unit: '',
      icon: Users,
      color: 'from-orange-500 to-red-600',
      message: 'Verified investors in your network'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {displayMetrics.map((metric, i) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-0 shadow-lg overflow-hidden">
              {/* Gradient accent */}
              <div className={`h-1 bg-gradient-to-r ${metric.color}`} />

              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Icon className={`w-5 h-5 text-transparent bg-gradient-to-br ${metric.color} bg-clip-text`} />
                </div>

                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {metric.value}{metric.unit}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{metric.label}</p>
                </div>

                <p className="text-xs text-gray-500 pt-2">{metric.message}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}