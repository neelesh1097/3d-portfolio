import React from 'react';
import { useStore } from '../store/useStore';
import {
  PERSONAL_INFO,
  PROJECTS,
  SKILL_CATEGORIES,
  EXPERIENCES,
  EDUCATION_DATA,
} from '../data/portfolio';
import {
  Box,
  Mail,
  ExternalLink,
  Download,
  Sparkles,
  MapPin,
  Briefcase,
  GraduationCap,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';
import { soundManager } from '../utils/audio';

export const Fallback2D: React.FC = () => {
  const { is2DView, toggle2DView } = useStore();

  if (!is2DView) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950 text-white select-text">
      {/* Top Banner */}
      <nav className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-sm font-mono">
            NY
          </div>
          <div>
            <div className="text-sm font-bold text-white">{PERSONAL_INFO.name}</div>
            <div className="text-xs text-sky-400">Standard 2D Portfolio</div>
          </div>
        </div>

        <button
          onClick={() => {
            toggle2DView();
            soundManager.playAchievement();
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
        >
          <Box className="w-4 h-4" /> Switch to 3D Game World
        </button>
      </nav>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Hero Section */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Full-Stack & Creative AI Engineer
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            {PERSONAL_INFO.name}
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
            {PERSONAL_INFO.bio}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={`mailto:${PERSONAL_INFO.email}`}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <Mail className="w-4 h-4" /> Get in Touch
            </a>
            <a
              href={PERSONAL_INFO.github}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-colors border border-slate-700"
            >
              <GithubIcon className="w-4 h-4" /> GitHub
            </a>
            <a
              href={PERSONAL_INFO.linkedin}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-colors border border-slate-700"
            >
              <LinkedinIcon className="w-4 h-4" /> LinkedIn
            </a>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <span className="text-sky-400">#</span> Featured Projects
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROJECTS.map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1 font-mono">
                    {proj.subtitle}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{proj.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">{proj.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proj.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-sky-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <GithubIcon className="w-3.5 h-3.5" /> Source
                    </a>
                  )}
                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold transition-colors"
                    >
                      Live Demo <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Work Experience */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-400" /> Work Experience
          </h2>

          <div className="space-y-6">
            {EXPERIENCES.map((exp) => (
              <div key={exp.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white">{exp.company}</h3>
                    <div className="text-xs font-semibold text-emerald-400 mt-0.5">{exp.role}</div>
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
                    {exp.period}
                  </span>
                </div>

                <ul className="space-y-1.5 pt-1 text-xs text-slate-300">
                  {exp.description.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {exp.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-slate-800/80 text-[10px] font-mono text-slate-300 border border-slate-700/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" /> Technical Skills
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SKILL_CATEGORIES.map((cat) => (
              <div key={cat.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{cat.name}</h3>
                <div className="space-y-2">
                  {cat.skills.map((s) => (
                    <div key={s.name} className="flex justify-between items-center text-xs">
                      <span className="text-slate-300">{s.name}</span>
                      <span className="font-mono text-slate-400">{s.level}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-12 border-t border-slate-800 flex flex-wrap justify-between items-center gap-4 text-xs text-slate-400">
          <div>© {new Date().getFullYear()} Neelesh Yadav. All rights reserved.</div>
          <button
            onClick={() => {
              toggle2DView();
              soundManager.playAchievement();
            }}
            className="text-sky-400 hover:text-sky-300 font-bold transition-colors cursor-pointer"
          >
            Launch 3D Game World ➔
          </button>
        </footer>
      </main>
    </div>
  );
};
