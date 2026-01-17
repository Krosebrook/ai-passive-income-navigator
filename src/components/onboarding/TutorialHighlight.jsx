import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Interactive tutorial highlight component
 * Shows a spotlight effect on target elements with contextual guidance
 */
export default function TutorialHighlight({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onSkip,
  onComplete
}) {
  const [targetElement, setTargetElement] = useState(null);
  const [elementPosition, setElementPosition] = useState(null);

  useEffect(() => {
    if (!step.target) return;

    const findElement = () => {
      const el = document.querySelector(`[data-tutorial-target="${step.target}"]`);
      if (el) {
        setTargetElement(el);
        updatePosition(el);
      }
    };

    findElement();
    const observer = new MutationObserver(findElement);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('resize', () => {
      if (targetElement) updatePosition(targetElement);
    });

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', () => {});
    };
  }, [step.target]);

  const updatePosition = (el) => {
    const rect = el.getBoundingClientRect();
    setElementPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height
    });
  };

  if (!elementPosition) return null;

  const positions = {
    bottom: {
      top: elementPosition.top + elementPosition.height + 16,
      left: Math.max(16, Math.min(window.innerWidth - 320, elementPosition.left))
    },
    top: {
      top: elementPosition.top - 200,
      left: Math.max(16, Math.min(window.innerWidth - 320, elementPosition.left))
    },
    right: {
      top: elementPosition.top,
      left: elementPosition.left + elementPosition.width + 16
    }
  };

  const pos = positions[step.position] || positions.bottom;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 pointer-events-none z-50"
      >
        {/* Spotlight overlay */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <mask id="tutorial-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={elementPosition.left - 8}
                y={elementPosition.top - 8}
                width={elementPosition.width + 16}
                height={elementPosition.height + 16}
                rx="12"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.6)"
            mask="url(#tutorial-mask)"
          />
        </svg>

        {/* Highlight glow */}
        <motion.div
          className="absolute border-2 border-[#8b85f7] rounded-xl pointer-events-none"
          style={{
            top: elementPosition.top - 8,
            left: elementPosition.left - 8,
            width: elementPosition.width + 16,
            height: elementPosition.height + 16
          }}
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(139, 133, 247, 0.4)',
              '0 0 0 12px rgba(139, 133, 247, 0)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute bg-white rounded-xl shadow-xl p-4 max-w-xs pointer-events-auto z-50"
          style={{ top: pos.top, left: pos.left }}
        >
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
            </div>

            {/* Step counter */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex gap-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 w-1.5 rounded-full ${
                      i === stepIndex ? 'bg-[#8b85f7]' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span>{stepIndex + 1} of {totalSteps}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={onSkip}
                className="text-xs"
              >
                Skip
              </Button>
              {stepIndex < totalSteps - 1 ? (
                <Button
                  size="sm"
                  className="bg-[#8b85f7] hover:bg-[#7a75e8] text-xs gap-1"
                  onClick={onNext}
                >
                  Next
                  <ChevronRight className="w-3 h-3" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                  onClick={onComplete}
                >
                  Done!
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}