import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Users, Bell, BellOff, ArrowUpRight } from 'lucide-react';

const CATEGORY_STYLES = {
  opportunity: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  niche: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  shift: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  tool: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }
};

export default function TrendCard({ 
  trend, 
  isFollowed, 
  onFollow, 
  onUnfollow,
  onSetupAlert,
  index = 0 
}) {
  const categoryStyle = CATEGORY_STYLES[trend.category] || CATEGORY_STYLES.opportunity;
  const isPositive = trend.growth_direction === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="h-full bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <Badge className={`${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border} border`}>
              {trend.category}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isFollowed ? 'text-violet-600' : 'text-gray-400'}`}
              onClick={() => isFollowed ? onUnfollow?.(trend) : onFollow?.(trend)}
            >
              {isFollowed ? <Bell className="w-5 h-5 fill-current" /> : <BellOff className="w-5 h-5" />}
            </Button>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {trend.name}
          </h3>
          
          <p className="text-gray-500 text-sm mb-4 line-clamp-3">
            {trend.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4">
            <div className={`flex items-center gap-1.5 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-semibold">{trend.growth_rate}</span>
            </div>
            {trend.market_size && (
              <div className="text-gray-500 text-sm">
                {trend.market_size}
              </div>
            )}
          </div>

          {/* Target Audience */}
          {trend.target_audience && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Users className="w-4 h-4" />
              <span>{trend.target_audience}</span>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => onSetupAlert?.(trend)}
            >
              <Bell className="w-3 h-3 mr-1" />
              Alert
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="group"
            >
              Details
              <ArrowUpRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}