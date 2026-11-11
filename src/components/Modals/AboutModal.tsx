import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { PERSONAL_INFO } from '../../data/portfolio';
import { X, MapPin, Sparkles, Code2, Briefcase, Award } from 'lucide-react';
import { soundManager } from '../../utils/audio';

export const AboutModal: React.FC = () => {
  const { activeModal, closeModal } = useStore();

  if (activeModal !== 'about') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-purple-950/60 to-slate-900 border-b border-purple-500/20 relative">
            <button
              onClick={() => {
                closeModal();
                soundManager.playClick();
              }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 p-0.5 shadow-lg shadow-purple-500/20">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-xl font-bold font-mono text-purple-300">
                  NY
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-400">Personal Studio</div>
                <h2 className="text-2xl font-bold text-white">{PERSONAL_INFO.name}</h2>
                <p className="text-xs text-purple-200 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" /> {PERSONAL_INFO.location}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
            {/* Tagline Box */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 text-purple-200 font-medium italic">
              "{PERSONAL_INFO.tagline}"
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PERSONAL_INFO.stats.map((stat, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                  <div className="text-lg font-bold text-purple-300 font-mono">{stat.value}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Personal Story */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Personal Story & Philosophy
              </h3>
              <p className="whitespace-pre-line leading-relaxed text-slate-200">
                {PERSONAL_INFO.story}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => {
                closeModal();
                soundManager.playClick();
              }}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Resume Driving
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
