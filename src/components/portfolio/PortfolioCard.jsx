import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TaskManager from '@/components/portfolio/TaskManager';
import { 
  MoreVertical, Trash2, Edit2, Sparkles, LineChart, 
  ChevronDown, Clock, DollarSign, Megaphone
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { STATUS_COLORS, PRIORITY_COLORS } from '../data/ideasCatalog';

const STATUS_OPTIONS = [
  { value: 'exploring', label: 'Exploring' },
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'launched', label: 'Launched' },
  { value: 'paused', label: 'Paused' }
];

/**
 * Portfolio Card Component
 * 
 * Displays a portfolio idea with status tracking, task management, and quick actions.
 * Includes dropdown menu for enrichment, monetization analysis, and marketing content generation.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.idea - Portfolio idea object
 * @param {string} props.idea.id - Unique identifier
 * @param {string} props.idea.title - Idea title
 * @param {string} props.idea.status - Current status (exploring|planning|in_progress|launched|paused)
 * @param {Function} props.onStatusChange - Callback for status changes
 * @param {Function} props.onEdit - Callback to edit notes
 * @param {Function} props.onDelete - Callback to remove idea
 * @param {Function} props.onEnrich - Callback for AI enrichment
 * @param {Function} props.onAnalyze - Callback for monetization analysis
 * @param {Function} props.onSelectTracking - Callback for performance tracking
 * @param {Function} props.onGenerateMarketing - Callback for marketing content generation
 * @param {number} [props.index=0] - Card index for staggered animations
 */
export default function PortfolioCard({ 
  idea, 
  onStatusChange,
  onPriorityChange,
  onEdit,
  onDelete,
  onEnrich,
  onAnalyze,
  onSelectTracking,
  onGenerateMarketing,
  index = 0
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const gradient = idea.color || 'from-violet-500 to-purple-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <Card className="overflow-hidden bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Gradient Header */}
        <div className={`h-2 bg-gradient-to-r ${gradient}`} />
        
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                {idea.title}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {idea.category?.replace(/_/g, ' ')}
                </Badge>
                <Badge className={`${PRIORITY_COLORS[idea.priority || 'medium']} text-xs`}>
                  {idea.priority || 'medium'}
                </Badge>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(idea)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Notes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEnrich?.(idea)}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Enrich
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAnalyze?.(idea)}>
                  <LineChart className="w-4 h-4 mr-2" />
                  Monetization
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onGenerateMarketing?.(idea)}>
                  <Megaphone className="w-4 h-4 mr-2" />
                  Marketing Content
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelectTracking?.(idea)}>
                  <LineChart className="w-4 h-4 mr-2" />
                  Track Performance
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete?.(idea)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {/* Status Selector */}
          <div className="mb-4">
            <Select 
              value={idea.status} 
              onValueChange={(value) => onStatusChange?.(idea.id, value)}
            >
              <SelectTrigger className="w-full h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[option.value]?.replace('text-', 'bg-')}`} />
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Stats */}
          {(idea.estimated_income || idea.time_to_profit) && (
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
              {idea.estimated_income && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span>{idea.estimated_income}</span>
                </div>
              )}
              {idea.time_to_profit && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>{idea.time_to_profit}</span>
                </div>
              )}
            </div>
          )}

          {/* Expandable Notes */}
          {idea.notes && (
            <div className="mt-4">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                Notes
              </button>
              {isExpanded && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3"
                >
                  {idea.notes}
                </motion.p>
              )}
            </div>
          )}

          {/* Tools */}
          {idea.tools && idea.tools.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {idea.tools.slice(0, 4).map((tool, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {tool}
                </span>
              ))}
            </div>
          )}

          {/* Task Manager */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <TaskManager ideaId={idea.id} />
          </div>
          </CardContent>
          </Card>
          </motion.div>
          );
          }