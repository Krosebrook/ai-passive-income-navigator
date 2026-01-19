import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Info } from 'lucide-react';

export default function ContextualTooltip({ 
  children, 
  title, 
  description, 
  whyItMatters,
  icon = 'help',
  side = 'top'
}) {
  const Icon = icon === 'info' ? Info : HelpCircle;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {children || (
            <button className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-gray-700/50 transition-colors">
              <Icon className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className="max-w-xs bg-[#0f0618] border-[#2d1e50] p-4"
        >
          {title && (
            <div className="font-semibold text-white mb-2 flex items-center gap-2">
              <Icon className="w-4 h-4 text-[#8b85f7]" />
              {title}
            </div>
          )}
          {description && (
            <p className="text-sm text-gray-300 mb-2">{description}</p>
          )}
          {whyItMatters && (
            <div className="mt-3 pt-3 border-t border-[#2d1e50]">
              <p className="text-xs font-semibold text-[#8b85f7] mb-1">💡 Why this matters</p>
              <p className="text-xs text-gray-400">{whyItMatters}</p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}