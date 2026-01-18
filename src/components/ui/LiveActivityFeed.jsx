import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const activities = [
  { name: 'Sarah M.', action: 'found a deal', location: 'Austin, TX', avatar: '👩' },
  { name: 'Mike R.', action: 'joined Pro plan', location: 'New York, NY', avatar: '👨' },
  { name: 'Lisa K.', action: 'validated an opportunity', location: 'San Francisco, CA', avatar: '👩‍💼' },
  { name: 'James T.', action: 'found a deal', location: 'Miami, FL', avatar: '👨‍💼' },
  { name: 'Emma W.', action: 'started free trial', location: 'Seattle, WA', avatar: '👩‍🦰' },
  { name: 'David L.', action: 'found a deal', location: 'Boston, MA', avatar: '🧑' },
];

export default function LiveActivityFeed() {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentActivity((prev) => (prev + 1) % activities.length);
        setVisible(true);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const activity = activities[currentActivity];

  return (
    <div className="fixed bottom-6 left-6 z-50 hidden lg:block">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={currentActivity}
            initial={{ x: -100, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -100, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/10 min-w-[300px]"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-xl">
                  {activity.avatar}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0f0618] animate-pulse" />
              </div>
              
              <div className="flex-1">
                <p className="text-sm text-white font-medium">
                  <span className="font-semibold">{activity.name}</span> {activity.action}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  📍 {activity.location}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-xs text-gray-400">
                {Math.floor(Math.random() * 5) + 1} minutes ago
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}