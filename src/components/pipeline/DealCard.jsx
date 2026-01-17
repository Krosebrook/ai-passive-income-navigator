import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, DollarSign, Calendar, AlertCircle } from 'lucide-react';

const PRIORITY_COLORS = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
};

export default function DealCard({ deal, onClick, onStageChange }) {
  const isOverdue = deal.expected_close_date && new Date(deal.expected_close_date) < new Date();

  return (
    <Card 
      className="bg-[#0f0618] border-[#2d1e50] hover:border-[#8b85f7] cursor-pointer transition-all"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-white text-sm line-clamp-2">{deal.deal_name}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-white">
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStageChange('research'); }}>
                Move to Research
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStageChange('analysis'); }}>
                Move to Analysis
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStageChange('negotiation'); }}>
                Move to Negotiation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStageChange('launch'); }}>
                Move to Launch
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStageChange('completed'); }}>
                Mark as Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 text-xs">
          <Badge className={PRIORITY_COLORS[deal.priority]} variant="secondary">
            {deal.priority}
          </Badge>

          {deal.estimated_value && (
            <div className="flex items-center gap-1 text-gray-400">
              <DollarSign className="w-3 h-3" />
              <span>${deal.estimated_value.toLocaleString()}</span>
            </div>
          )}

          {deal.expected_close_date && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-gray-400'}`}>
              {isOverdue && <AlertCircle className="w-3 h-3" />}
              <Calendar className="w-3 h-3" />
              <span>{new Date(deal.expected_close_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}