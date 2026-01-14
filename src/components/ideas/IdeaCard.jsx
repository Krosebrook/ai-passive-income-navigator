import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, Star, ArrowRight, Clock, DollarSign } from 'lucide-react';
import { DIFFICULTY_COLORS } from '../data/ideasCatalog';

export default function IdeaCard({ 
  idea, 
  isBookmarked, 
  userRating,
  onBookmark, 
  onViewDetails,
  onRate,
  index = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group h-full bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
        <CardContent className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <Badge className={`${DIFFICULTY_COLORS[idea.difficulty]} border text-xs font-medium`}>
              {idea.difficulty}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isBookmarked ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'}`}
              onClick={(e) => {
                e.stopPropagation();
                onBookmark?.(idea);
              }}
            >
              {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </Button>
          </div>

          {/* Title & Description */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-violet-700 transition-colors line-clamp-2">
            {idea.title}
          </h3>
          <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-grow">
            {idea.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">{idea.estimated_income}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{idea.time_to_profit}</span>
            </div>
          </div>

          {/* Tools */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {idea.tools?.slice(0, 3).map((tool, i) => (
              <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {tool}
              </span>
            ))}
            {idea.tools?.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{idea.tools.length - 3}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={(e) => {
                  e.stopPropagation();
                  onRate?.(idea.id, star);
                }}
                className="p-0.5 hover:scale-110 transition-transform"
              >
                <Star 
                  className={`w-4 h-4 ${
                    star <= (userRating || 0) 
                      ? 'text-amber-400 fill-amber-400' 
                      : 'text-gray-300'
                  }`} 
                />
              </button>
            ))}
          </div>

          {/* Action */}
          <Button 
            onClick={() => onViewDetails?.(idea)}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white group/btn"
          >
            View Details
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}