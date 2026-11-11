import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Trophy } from 'lucide-react';
import { soundManager } from '../utils/audio';

export const AchievementToast: React.FC = () => {
  const recentAchievement = useStore((state) => state.recentAchievement);

  if (!recentAchievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.9 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      >
        <div className="px-5 py-3 rounded-2xl bg-slate-900/95 border-2 border-amber-400/80 shadow-2xl shadow-amber-500/25 flex items-center gap-3.5 backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-md shrink-0">
            <Trophy className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
              Achievement Unlocked!
            </div>
            <div className="text-sm font-bold text-white leading-tight">
              {recentAchievement.title}
            </div>
            <div className="text-[11px] text-slate-300">
              {recentAchievement.description} <span className="text-amber-300 font-mono font-bold">(+{recentAchievement.xp} XP)</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

