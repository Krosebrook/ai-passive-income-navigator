import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Sparkles } from 'lucide-react';

/**
 * Non-intrusive prompt for deferred setup items
 * Shows when user accesses a feature needing advanced config
 */
export default function DeferredSetupPrompt({ 
  open, 
  onClose, 
  onSetupNow,
  title,
  description,
  benefit,
  setupType 
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-6 right-6 z-50 max-w-md"
      >
        <Card className="bg-gradient-to-br from-[#1a0f2e] to-[#2d1e50] border-[#8b85f7]/30 shadow-2xl shadow-[#8b85f7]/20">
          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#8b85f7]/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#8b85f7]" />
                </div>
                <h3 className="font-semibold text-white">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="text-[#64748b] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <p className="text-sm text-[#a0aec0] mb-2">{description}</p>
            {benefit && (
              <div className="bg-[#8b85f7]/10 border border-[#8b85f7]/20 rounded-lg p-3 mb-4">
                <p className="text-xs text-[#8b85f7] font-medium">
                  💡 {benefit}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={onSetupNow}
                className="flex-1 bg-gradient-to-r from-[#8b85f7] to-[#583cf0] hover:from-[#9a95ff] hover:to-[#6b4fff]"
              >
                Set Up Now (2 min)
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-[#64748b] hover:text-white"
              >
                Later
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}