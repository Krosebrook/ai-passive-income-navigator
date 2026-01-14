import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function EmptyState({ 
  icon: Icon,
  title,
  description,
  action,
  actionLabel
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {Icon && (
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-violet-600" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mb-6">{description}</p>
      {action && (
        <Button 
          onClick={action}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}