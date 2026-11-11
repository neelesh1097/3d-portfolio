import React from 'react';
import { useStore } from '../store/useStore';
import { PERSONAL_INFO } from '../data/portfolio';
import { PROJECTS_DATA } from '../data/projects';
import { SKILL_CATEGORIES_DATA } from '../data/skills';
import { EXPERIENCES_DATA, EDUCATION_DATA } from '../data/experience';
import { Box, Mail, Briefcase, Layers, ArrowRight, GraduationCap } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';
import { soundManager } from '../utils/audio';

export const Fallback2D: React.FC = () => {
  const { is2DView, toggle2DView } = useStore();

  if (!is2DView) return null;

  const skillCategories = Object.values(SKILL_CATEGORIES_DATA);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0B1420] text-[#F4F7FA] select-text">
      {/* Top Banner */}
      <nav className="sticky top-0 z-40 bg-[#0B1420]/95 border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#14263A] border border-[#43D9F5]/40 flex items-center justify-center font-mono font-bold text-xs text-[#43D9F5]">
              NY
            </div>
            <div>
              <div className="font-display text-sm font-bold text-[#F4F7FA]">
                {PERSONAL_INFO.name}
              </div>
              <div className="text-xs text-[#9AAFC2]">{PERSONAL_INFO.role}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              toggle2DView();
              soundManager.playAchievement();
            }}
            className="px-4 py-2 rounded-lg bg-[#43D9F5] hover:bg-[#5ce1f8] text-[#0B1420] font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Box className="w-4 h-4" /> Launch 3D Island
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* Hero */}
        <section className="space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-lg bg-[#14263A] border border-[#43D9F5]/30 font-mono text-xs text-[#43D9F5]">
            {PERSONAL_INFO.role}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#F4F7FA]">
            {PERSONAL_INFO.name}
          </h1>
          <p className="text-base sm:text-lg text-[#9AAFC2] leading-relaxed max-w-2xl">
            {PERSONAL_INFO.bio}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={`mailto:${PERSONAL_INFO.email}`}
              className="px-4 py-2 rounded-lg bg-[#43D9F5] hover:bg-[#5ce1f8] text-[#0B1420] font-semibold text-xs flex items-center gap-2 transition-colors"
            >
              <Mail className="w-4 h-4" /> Get in Touch
            </a>
            <a
              href={PERSONAL_INFO.github}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg bg-[#14263A] hover:bg-[#1B3045] text-[#F4F7FA] font-medium text-xs flex items-center gap-2 transition-colors border border-white/10"
            >
              <GithubIcon className="w-4 h-4" /> GitHub
            </a>
            <a
              href={PERSONAL_INFO.linkedin}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg bg-[#14263A] hover:bg-[#1B3045] text-[#F4F7FA] font-medium text-xs flex items-center gap-2 transition-colors border border-white/10"
            >
              <LinkedinIcon className="w-4 h-4" /> LinkedIn
            </a>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold text-[#F4F7FA] border-b border-white/10 pb-3">
            Featured Projects
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROJECTS_DATA.map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded-xl bg-[#14263A]/65 border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-wider text-[#43D9F5] mb-1">
                    {proj.subtitle}
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#F4F7FA] mb-2">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-[#9AAFC2] leading-relaxed mb-4">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proj.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-[#0B1420] border border-white/10 font-mono text-[11px] text-[#9AAFC2]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-3 border-t border-white/10">
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#9AAFC2] hover:text-[#F4F7FA] flex items-center gap-1"
                    >
                      <GithubIcon className="w-3.5 h-3.5" /> Source
                    </a>
                  )}
                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#43D9F5] hover:underline flex items-center gap-1 font-semibold"
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
          <h2 className="font-display text-2xl font-bold text-[#F4F7FA] border-b border-white/10 pb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#43D9F5]" /> Work Experience
          </h2>
          <div className="space-y-4">
            {EXPERIENCES_DATA.map((exp) => (
              <div
                key={exp.id}
                className="p-5 rounded-xl bg-[#14263A]/65 border border-white/10 space-y-2.5"
              >
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <h3 className="font-display text-base font-bold text-[#F4F7FA]">
                      {exp.company}
                    </h3>
                    <div className="text-xs font-medium text-[#43D9F5] mt-0.5">{exp.role}</div>
                  </div>
                  <span className="font-mono text-xs text-[#F5B84B] bg-[#0B1420] border border-white/10 px-2.5 py-1 rounded-md">
                    {exp.period}
                  </span>
                </div>
                <ul className="space-y-1.5 pt-1 text-xs text-[#9AAFC2]">
                  {exp.description.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#43D9F5]">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Architecture */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold text-[#F4F7FA] border-b border-white/10 pb-3 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#43D9F5]" /> Tech Stack
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skillCategories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-xl bg-[#14263A]/65 border border-white/10 space-y-3"
              >
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#43D9F5]">
                  {cat.title}
                </h3>
                <div className="space-y-2">
                  {cat.skills.map((s) => (
                    <div key={s.name} className="flex justify-between items-center text-xs">
                      <span className="text-[#F4F7FA]">{s.name}</span>
                      <span className="font-mono text-[#9AAFC2]">{s.level}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-[#F4F7FA] border-b border-white/10 pb-3 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#F5B84B]" /> Education
          </h2>
          {EDUCATION_DATA.map((edu) => (
            <div
              key={edu.id}
              className="p-5 rounded-xl bg-[#14263A]/65 border border-white/10"
            >
              <div className="font-display font-bold text-[#F4F7FA] text-base">{edu.degree}</div>
              <div className="text-xs text-[#9AAFC2] mt-1">
                {edu.institution} • {edu.period}
              </div>
            </div>
          ))}
        </section>

        <footer className="pt-8 border-t border-white/10 flex flex-wrap justify-between items-center gap-4 text-xs text-[#9AAFC2]">
          <div>© {new Date().getFullYear()} {PERSONAL_INFO.name} — Full Stack Island.</div>
          <button
            type="button"
            onClick={() => {
              toggle2DView();
              soundManager.playAchievement();
            }}
            className="text-[#43D9F5] hover:underline font-semibold cursor-pointer"
          >
            Launch 3D Island World →
          </button>
        </footer>
      </main>
    </div>
  );
};
