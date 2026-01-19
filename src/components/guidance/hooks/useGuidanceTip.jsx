import { useEffect } from 'react';
import { useGuidance } from '../ProactiveGuidanceSystem';

/**
 * Custom hook to show a guidance tip based on conditions
 * @param {Object} tip - The tip configuration
 * @param {boolean} shouldShow - Condition to trigger the tip
 * @param {Array} dependencies - Dependencies for re-evaluation
 */
export function useGuidanceTip(tip, shouldShow, dependencies = []) {
  const { showTip, dismissedTips } = useGuidance();

  useEffect(() => {
    if (shouldShow) {
      const alreadyDismissed = dismissedTips.some(
        t => t.tip_id === tip.id && t.dismissed_at
      );
      const viewCount = dismissedTips.find(t => t.tip_id === tip.id)?.shown_count || 0;

      if (!alreadyDismissed && viewCount < 3) {
        const timer = setTimeout(() => showTip(tip), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [shouldShow, ...dependencies]);
}

/**
 * Custom hook to track page visits for guidance
 * @param {string} pageName - Name of the current page
 */
export function usePageTracking(pageName) {
  const { trackPageVisit } = useGuidance();

  useEffect(() => {
    trackPageVisit(pageName);
  }, [pageName]);
}