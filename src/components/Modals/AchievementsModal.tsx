import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { X, Trophy, Lock, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../../utils/audio';

export const AchievementsModal: React.FC = () => {
  const { activeModal, closeModal, achievements, score } = useStore();

  if (activeModal !== 'achievements') return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-amber-950/60 to-slate-900 border-b border-amber-500/20 relative">
            <button
              onClick={() => {
                closeModal();
                soundManager.playClick();
              }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">World Achievements</h2>
                <div className="text-xs text-amber-300 flex items-center gap-2 mt-0.5 font-mono">
                  <span>{unlockedCount} of {achievements.length} Unlocked</span>
                  <span>•</span>
                  <span>{score} Total XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="p-6 overflow-y-auto space-y-3">
            {achievements.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-all ${
                  item.unlocked
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-slate-800/40 border-slate-700/40 opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.unlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {item.unlocked ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-white">{item.title}</div>
                    <span className="text-[10px] font-mono font-bold text-amber-400">+{item.xp} XP</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => {
                closeModal();
                soundManager.playClick();
              }}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Resume Driving
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

