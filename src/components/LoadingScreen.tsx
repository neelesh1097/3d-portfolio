import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { soundManager } from '../utils/audio';
import { Play, Sparkles, Monitor } from 'lucide-react';

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
        const step = Math.random() * 15 + 10;
        return Math.min(100, prev + step);
      });
    }, 110);

    return () => clearInterval(interval);
  }, []);

  if (hasStarted) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#7dd3fc] to-[#bae6fd] text-slate-900 select-none px-4"
      >
        {/* Soft Fluffy Cloud Background Illustrations */}
        <div className="absolute top-12 left-16 w-32 h-16 rounded-full bg-white/70 blur-sm pointer-events-none" />
        <div className="absolute bottom-20 right-20 w-48 h-24 rounded-full bg-white/80 blur-sm pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center bg-white/85 backdrop-blur-xl p-8 rounded-3xl border-2 border-white shadow-2xl shadow-sky-900/15">
          {/* Logo / Monogram */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-red-500 via-amber-500 to-yellow-400 flex items-center justify-center shadow-xl shadow-amber-500/30 mb-5 p-1 border-2 border-white"
          >
            <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-black tracking-widest text-white font-mono">
                NY
              </span>
            </div>
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-1">
            Neelesh Yadav
          </h1>
          <p className="text-xs sm:text-sm text-amber-600 font-extrabold tracking-wide uppercase mb-6 flex items-center gap-1.5 justify-center">
            <Sparkles className="w-4 h-4" /> 3D Miniature Open World Portfolio
          </p>

          {!isReady ? (
            <div className="w-full space-y-3">
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden border border-slate-300/80 p-0.5 shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-400"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.2 }}
                />
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 font-mono font-bold">
                <span>Assembling miniature island...</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2.5 w-full"
            >
              <button
                onClick={() => {
                  startExperience();
                  toggleSound();
                  soundManager.playAchievement();
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm tracking-wide shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current text-amber-400" />
                START EXPLORING (WITH SOUND)
              </button>

              <button
                onClick={() => {
                  startExperience();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs tracking-wide border border-slate-200 transition-all cursor-pointer"
              >
                Explore Muted
              </button>

              <button
                onClick={() => {
                  startExperience();
                  toggle2DView();
                }}
                className="w-full py-1.5 px-4 text-slate-500 hover:text-slate-800 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-medium"
              >
                <Monitor className="w-3.5 h-3.5" />
                Switch to Standard 2D Portfolio
              </button>
            </motion.div>
          )}

          {/* Quick Controls Tip */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-4 justify-center">
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800 font-mono">W A S D</kbd> Drive</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800 font-mono">Shift</kbd> Boost</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800 font-mono">Space</kbd> Jump</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
