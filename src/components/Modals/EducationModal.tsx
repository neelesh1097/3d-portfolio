import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { EDUCATION_DATA } from '../../data/portfolio';
import { X, GraduationCap, Award, BookOpen } from 'lucide-react';
import { soundManager } from '../../utils/audio';

export const EducationModal: React.FC = () => {
  const { activeModal, closeModal } = useStore();

  if (activeModal !== 'education') return null;

  const edu = EDUCATION_DATA[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
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

            <div className="text-xs font-bold uppercase tracking-wider text-amber-400">Academy Campus</div>
            <h2 className="text-2xl font-bold text-white">Academics & Qualifications</h2>
            <p className="text-xs text-amber-200 mt-1">Computer science foundations, algorithmic problem solving & engineering rigor.</p>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
            {/* Degree Card */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{edu.degree}</h3>
                <div className="text-xs text-amber-300 font-medium">{edu.institution}</div>
                <div className="text-[11px] text-slate-400 mt-1">{edu.period} • {edu.grade}</div>
              </div>
            </div>

            {/* Coursework */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2.5 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> Core Technical Coursework
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {edu.coursework.map((course, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40 text-xs text-slate-300 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{course}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2.5 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Academic Highlights & Leadership
              </h4>
              <ul className="space-y-2">
                {edu.achievements.map((item, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                    <span className="text-amber-400">★</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
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

