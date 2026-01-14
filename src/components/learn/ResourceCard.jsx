import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Sparkles, TrendingUp } from 'lucide-react';

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700'
};

export default function ResourceCard({ resource, onClick, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
    >
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all duration-300 border-gray-200 h-full"
        onClick={onClick}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge className={DIFFICULTY_COLORS[resource.difficulty]}>
              {resource.difficulty}
            </Badge>
            {resource.is_ai_generated && (
              <Sparkles className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
            {resource.title}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {resource.estimated_time || '10 minutes'}
            </div>
            {resource.views_count > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {resource.views_count} views
              </div>
            )}
          </div>
          
          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {resource.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <Badge variant="secondary" className="mt-3">
            {resource.type.replace('_', ' ')}
          </Badge>
        </CardContent>
      </Card>
    </motion.div>
  );
}