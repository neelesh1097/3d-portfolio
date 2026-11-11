import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { EXPERIENCES } from '../../data/portfolio';
import { X, Briefcase, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../../utils/audio';

export const ExperienceModal: React.FC = () => {
  const { activeModal, closeModal } = useStore();

  if (activeModal !== 'experience') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-emerald-950/60 to-slate-900 border-b border-emerald-500/20 relative">
            <button
              onClick={() => {
                closeModal();
                soundManager.playClick();
              }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Career Runway</div>
            <h2 className="text-2xl font-bold text-white">Work Experience & Milestones</h2>
            <p className="text-xs text-emerald-200 mt-1">
              Building scalable architectures, fintech micro-interactions, and high-performance full-stack web applications.
            </p>
          </div>

          {/* Body Timeline */}
          <div className="p-6 overflow-y-auto space-y-6">
            {EXPERIENCES.map((exp, idx) => (
              <div
                key={exp.id}
                className="relative pl-6 border-l-2 border-emerald-500/40 space-y-2 pb-4 last:pb-0"
              >
                {/* Timeline Dot */}
                <div
                  className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-slate-900 shadow-md"
                  style={{ backgroundColor: exp.color }}
                />

                <div className="flex flex-wrap items-center justify-between gap-1">
                  <h3 className="font-bold text-white text-base">{exp.company}</h3>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    {exp.period}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <span>{exp.role}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 font-normal">{exp.location}</span>
                </div>

                {/* Bullets */}
                <ul className="space-y-1.5 pt-1">
                  {exp.description.map((desc, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>

                {/* Tech Pills */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {exp.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-emerald-300 border border-slate-700/60"
                    >
                      {t}
                    </span>
                  ))}
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Resume Driving
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

