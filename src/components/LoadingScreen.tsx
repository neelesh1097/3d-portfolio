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
    // Simulated smooth asset preloading curve
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReady(true);
          return 100;
        }
        const step = Math.random() * 15 + 8;
        return Math.min(100, prev + step);
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  if (hasStarted) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white select-none px-4"
      >
        {/* Animated Cyber Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Ambient Glow */}
        <div className="absolute w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">
          {/* Logo / Monogram */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-sky-500/30 mb-6 p-0.5 border border-sky-400/40"
          >
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300 font-mono">
                NY
              </span>
            </div>
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Neelesh Yadav
          </h1>
          <p className="text-xs sm:text-sm text-sky-400 font-medium tracking-wide uppercase mb-8 flex items-center gap-1.5 justify-center">
            <Sparkles className="w-4 h-4" /> 3D Interactive World Experience
          </p>

          {!isReady ? (
            <div className="w-full space-y-3">
              {/* Progress Bar Container */}
              <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/50 p-0.5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-cyan-400"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.2 }}
                />
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                <span>Building 3D world...</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3 w-full"
            >
              <button
                onClick={() => {
                  startExperience();
                  toggleSound(); // Enable audio on user gesture
                  soundManager.playAchievement();
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                START EXPLORING (WITH SOUND)
              </button>

              <button
                onClick={() => {
                  startExperience();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs tracking-wide border border-slate-700/60 transition-all cursor-pointer"
              >
                Explore Muted
              </button>

              <button
                onClick={() => {
                  startExperience();
                  toggle2DView();
                }}
                className="w-full py-2 px-4 text-slate-400 hover:text-slate-200 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Monitor className="w-3.5 h-3.5" />
                Switch to Standard 2D Portfolio
              </button>
            </motion.div>
          )}

          {/* Quick Controls Tip */}
          <div className="mt-10 pt-6 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-4 justify-center">
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">W A S D</kbd> Drive</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">Shift</kbd> Nitro</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">E</kbd> Interact</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
