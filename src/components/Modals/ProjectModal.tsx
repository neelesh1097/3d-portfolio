import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { X, ExternalLink, CheckCircle2, Award } from 'lucide-react';
import { GithubIcon } from '../Icons';
import { soundManager } from '../../utils/audio';

export const ProjectModal: React.FC = () => {
  const { activeModal, selectedProject, closeModal } = useStore();

  if (activeModal !== 'projects' || !selectedProject) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        >
          {/* Header Banner */}
          <div
            className="p-6 relative border-b border-slate-800"
            style={{
              background: `linear-gradient(135deg, ${selectedProject.accentColor}25, transparent 70%), #0f172a`,
            }}
          >
            <button
              onClick={() => {
                closeModal();
                soundManager.playClick();
              }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-1">
              Featured 3D Project Exhibition
            </div>
            <h2 className="text-2xl font-bold text-white">{selectedProject.title}</h2>
            <p className="text-sm text-slate-300 mt-1">{selectedProject.subtitle}</p>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm">
            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Overview</h3>
              <p className="leading-relaxed text-slate-200">
                {selectedProject.longDescription || selectedProject.description}
              </p>
            </div>

            {/* Performance / Metrics Badge */}
            {selectedProject.metrics && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <Award className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-xs font-medium text-slate-200">
                  <strong className="text-amber-300">Highlight:</strong> {selectedProject.metrics}
                </span>
              </div>
            )}

            {/* Key Features */}
            {selectedProject.features && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Key Capabilities</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedProject.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tech Stack Pills */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {selectedProject.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-sky-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-end gap-3">
            {selectedProject.githubUrl && (
              <a
                href={selectedProject.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <GithubIcon className="w-4 h-4" /> View Code
              </a>
            )}
            {selectedProject.liveUrl && (
              <a
                href={selectedProject.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Live Demo
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
