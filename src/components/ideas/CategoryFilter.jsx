import React from 'react';
import { motion } from 'framer-motion';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  FileText, Bot, ShoppingBag, Link, GraduationCap, 
  Code, TrendingUp, Store, Zap, Home, LayoutGrid 
} from 'lucide-react';
import { CATEGORIES } from '../data/ideasCatalog';

const iconMap = {
  FileText, Bot, ShoppingBag, Link, GraduationCap,
  Code, TrendingUp, Store, Zap, Home
};

export default function CategoryFilter({ selectedCategory, onCategoryChange }) {
  return (
    <ScrollArea className="w-full pb-4">
      <div className="flex gap-2 px-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onCategoryChange(null)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
            selectedCategory === null
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200'
              : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="font-medium text-sm">All Ideas</span>
        </motion.button>

        {CATEGORIES.map((category) => {
          const Icon = iconMap[category.icon] || FileText;
          const isSelected = selectedCategory === category.id;
          
          return (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCategoryChange(category.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                isSelected
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium text-sm">{category.name}</span>
            </motion.button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}