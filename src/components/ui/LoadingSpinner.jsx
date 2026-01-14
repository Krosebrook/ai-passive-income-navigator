import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'default', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <Loader2 className={`${sizeClasses[size]} text-violet-600 animate-spin`} />
      {text && (
        <p className="mt-4 text-gray-500 text-sm">{text}</p>
      )}
    </motion.div>
  );
}