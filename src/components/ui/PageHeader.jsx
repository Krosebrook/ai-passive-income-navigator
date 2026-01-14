import React from 'react';
import { motion } from 'framer-motion';

export default function PageHeader({ 
  title, 
  subtitle, 
  action,
  gradient = "from-violet-600 to-indigo-600"
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-gray-500 text-lg">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </motion.div>
  );
}