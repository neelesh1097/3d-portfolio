import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { soundManager } from '../utils/audio';
import { Play, Monitor, VolumeX } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  const { hasStarted, startExperience, toggleSound, toggle2DView } = useStore();
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReady(true);
          return 100;
        }
        const step = Math.random() * 18 + 14;
        return Math.min(100, prev + step);
      });
    }, 85);

    return () => clearInterval(interval);
  }, []);

  if (hasStarted) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1420] text-[#F4F7FA] select-none p-6"
      >
        <div className="relative w-full max-w-md bg-[#14263A]/85 border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          {/* Initials Emblem */}
          <div className="w-14 h-14 mx-auto rounded-xl bg-[#0B1420] border border-[#43D9F5]/40 flex items-center justify-center mb-5">
            <span className="font-mono text-lg font-bold tracking-wider text-[#43D9F5]">NY</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F7FA]">
            Neelesh Yadav
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#43D9F5] mt-1.5 mb-7">
            Full Stack Island • Interactive 3D Portfolio
          </p>

          {!isReady ? (
            <div className="space-y-3">
              <div className="w-full h-1.5 rounded-full bg-[#0B1420] overflow-hidden border border-white/10">
                <div
                  className="h-full rounded-full bg-[#43D9F5] transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center font-mono text-xs text-[#9AAFC2]">
                <span>Initializing environment...</span>
                <span className="text-[#43D9F5]">{Math.round(progress)}%</span>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2.5"
            >
              <button
                type="button"
                onClick={() => {
                  startExperience();
                  toggleSound();
                  soundManager.setMuted(false);
                  soundManager.playAchievement();
                }}
                className="w-full py-3 px-5 rounded-xl bg-[#43D9F5] hover:bg-[#5ce1f8] text-[#0B1420] font-display font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Enter Island (With Sound)
              </button>

              <button
                type="button"
                onClick={() => startExperience()}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1B3045] hover:bg-[#233d57] text-[#F4F7FA] font-medium text-xs border border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <VolumeX className="w-3.5 h-3.5 text-[#9AAFC2]" />
                Enter Muted
              </button>

              <button
                type="button"
                onClick={() => {
                  startExperience();
                  toggle2DView();
                }}
                className="w-full py-2 px-4 text-[#9AAFC2] hover:text-[#43D9F5] text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Monitor className="w-3.5 h-3.5" />
                View Classic 2D Portfolio
              </button>
            </motion.div>
          )}

          {/* Subtle Control Hint */}
          <div className="mt-7 pt-4 border-t border-white/10 text-[11px] text-[#9AAFC2] flex flex-wrap items-center justify-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-[#0B1420] border border-white/10 font-mono text-[10px] text-[#43D9F5]">WASD</kbd>
              Drive
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-[#0B1420] border border-white/10 font-mono text-[10px] text-[#43D9F5]">SHIFT</kbd>
              Nitro
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-[#0B1420] border border-white/10 font-mono text-[10px] text-[#43D9F5]">E</kbd>
              Enter
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-[#0B1420] border border-white/10 font-mono text-[10px] text-[#43D9F5]">M</kbd>
              Map
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
