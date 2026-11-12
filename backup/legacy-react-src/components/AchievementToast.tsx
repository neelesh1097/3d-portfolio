import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Trophy } from 'lucide-react';

export const AchievementToast: React.FC = () => {
  const recentAchievement = useStore((state) => state.recentAchievement);

  return (
    <AnimatePresence>
      {recentAchievement && (
        <motion.div
          key={recentAchievement.id}
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none max-w-[calc(100vw-2rem)]"
        >
          <div className="px-4 py-3 rounded-xl bg-[#0B1420]/95 border border-[#F5B84B]/45 shadow-2xl flex items-center gap-3">
            <motion.div
              initial={{ rotate: -15, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className="w-9 h-9 rounded-lg bg-[#14263A] border border-[#F5B84B]/40 flex items-center justify-center text-[#F5B84B] shrink-0"
            >
              <Trophy className="w-4 h-4" />
            </motion.div>
            <div className="min-w-0">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#F5B84B]">
                Achievement Unlocked
              </div>
              <div className="font-display text-sm font-bold text-[#F4F7FA] leading-tight">
                {recentAchievement.title}
              </div>
              <div className="text-xs text-[#9AAFC2] truncate">
                {recentAchievement.description}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
