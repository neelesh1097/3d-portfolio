import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { SKILL_CATEGORIES } from '../../data/portfolio';
import { X, Cpu, Layers, Server, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/audio';

export const SkillsModal: React.FC = () => {
  const { activeModal, closeModal, unlockAchievement } = useStore();
  const [selectedCat, setSelectedCat] = useState(SKILL_CATEGORIES[0].id);

  if (activeModal !== 'skills') return null;

  unlockAchievement('skill_specialist');

  const currentCategory = SKILL_CATEGORIES.find((c) => c.id === selectedCat) || SKILL_CATEGORIES[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-cyan-950/60 to-slate-900 border-b border-cyan-500/20 relative">
            <button
              onClick={() => {
                closeModal();
                soundManager.playClick();
              }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">Tech Laboratory</div>
            <h2 className="text-2xl font-bold text-white">Interactive Skill Matrix</h2>
            <p className="text-xs text-cyan-200 mt-1">
              Battle-tested tools, frontend 3D graphics libraries, distributed databases, and modern AI pipelines.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex border-b border-slate-800 px-6 pt-3 gap-2 bg-slate-950/50">
            {SKILL_CATEGORIES.map((cat) => {
              const active = cat.id === selectedCat;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCat(cat.id);
                    soundManager.playClick();
                  }}
                  className={`pb-3 px-3 text-xs font-bold transition-all relative cursor-pointer ${
                    active ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.name}
                  {active && (
                    <motion.div
                      layoutId="activeSkillTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            <p className="text-xs text-slate-400">{currentCategory.description}</p>

            <div className="space-y-3.5">
              {currentCategory.skills.map((skill) => (
                <div key={skill.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200">{skill.name}</span>
                    <span className="font-mono text-cyan-400 font-bold">{skill.level}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/50 p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => {
                closeModal();
                soundManager.playClick();
              }}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Resume Driving
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

