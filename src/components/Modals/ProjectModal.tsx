import React from 'react';
import { useStore } from '../../store/useStore';
import { PROJECTS_DATA } from '../../data/projects';
import { ExternalLink, CheckCircle2, Terminal, ArrowLeft, ArrowRight } from 'lucide-react';
import { GithubIcon } from '../Icons';
import { soundManager } from '../../utils/audio';
import { ModalShell } from '../ui/ModalShell';

/** Clean procedural SVG preview thumbnail for each featured project. */
const ProjectThumbnail: React.FC<{ id: string }> = ({ id }) => {
  if (id === 'solar-space-3d') {
    return (
      <svg viewBox="0 0 240 100" className="w-full h-24 rounded-lg border border-white/10 bg-[#0B1420]">
        <circle cx="70" cy="50" r="22" fill="#F5B84B" opacity="0.9" />
        <ellipse cx="70" cy="50" rx="54" ry="20" fill="none" stroke="#43D9F5" strokeWidth="1" opacity="0.5" />
        <ellipse cx="70" cy="50" rx="84" ry="34" fill="none" stroke="#9AAFC2" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
        <circle cx="124" cy="50" r="6" fill="#43D9F5" />
        <circle cx="152" cy="40" r="4" fill="#F4F7FA" />
        <text x="175" y="54" fill="#9AAFC2" fontSize="9" fontFamily="JetBrains Mono, monospace">WEBGL 60FPS</text>
      </svg>
    );
  }
  if (id === 'docusense-ai') {
    return (
      <svg viewBox="0 0 240 100" className="w-full h-24 rounded-lg border border-white/10 bg-[#0B1420]">
        <rect x="20" y="20" width="54" height="60" rx="6" fill="#14263A" stroke="#43D9F5" strokeWidth="1" />
        <line x1="28" y1="34" x2="64" y2="34" stroke="#43D9F5" strokeWidth="2" />
        <line x1="28" y1="46" x2="58" y2="46" stroke="#9AAFC2" strokeWidth="1.5" />
        <line x1="28" y1="56" x2="60" y2="56" stroke="#9AAFC2" strokeWidth="1.5" />
        <path d="M84 50 L118 50" stroke="#43D9F5" strokeWidth="1.5" strokeDasharray="3 2" />
        <rect x="126" y="26" width="94" height="48" rx="8" fill="#1B3045" stroke="#F5B84B" strokeWidth="1" />
        <text x="138" y="48" fill="#F4F7FA" fontSize="9" fontFamily="JetBrains Mono, monospace">HYBRID RAG</text>
        <text x="138" y="62" fill="#43D9F5" fontSize="8" fontFamily="JetBrains Mono, monospace">&lt;200ms QUERY</text>
      </svg>
    );
  }
  if (id === 'omnishop-cloud') {
    return (
      <svg viewBox="0 0 240 100" className="w-full h-24 rounded-lg border border-white/10 bg-[#0B1420]">
        <rect x="18" y="18" width="204" height="64" rx="8" fill="#14263A" stroke="rgba(255,255,255,0.1)" />
        <rect x="28" y="28" width="54" height="44" rx="5" fill="#1B3045" stroke="#43D9F5" strokeWidth="1" />
        <rect x="92" y="28" width="120" height="14" rx="4" fill="#0B1420" />
        <rect x="92" y="48" width="76" height="10" rx="3" fill="#43D9F5" opacity="0.7" />
        <rect x="92" y="64" width="52" height="8" rx="3" fill="#F5B84B" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 240 100" className="w-full h-24 rounded-lg border border-white/10 bg-[#0B1420]">
      <polyline
        points="16,74 48,62 80,68 112,40 144,48 176,26 218,32"
        fill="none"
        stroke="#43D9F5"
        strokeWidth="2.2"
      />
      <circle cx="176" cy="26" r="4" fill="#F5B84B" />
      <text x="20" y="28" fill="#9AAFC2" fontSize="9" fontFamily="JetBrains Mono, monospace">WS 8K/SEC</text>
    </svg>
  );
};

export const ProjectModal: React.FC = () => {
  const { activeModal, selectedProject, openProjectModal, closeModal } = useStore();

  if (activeModal !== 'projects') return null;

  if (!selectedProject) {
    return (
      <ModalShell
        title="Featured Projects"
        eyebrow="Project Plaza"
        subtitle="Select any system below to inspect its architecture, engineering challenges, and live links."
        maxWidthClass="max-w-3xl"
        onClose={closeModal}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PROJECTS_DATA.map((proj) => (
            <button
              key={proj.id}
              type="button"
              onClick={() => {
                openProjectModal(proj);
                soundManager.playClick();
              }}
              className="p-4 rounded-xl bg-[#14263A]/65 border border-white/10 hover:border-[#43D9F5]/50 hover:bg-[#14263A] transition-colors cursor-pointer flex flex-col justify-between text-left group"
            >
              <div className="space-y-3 w-full">
                <ProjectThumbnail id={proj.id} />
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#43D9F5]">
                    {proj.subtitle}
                  </div>
                  <h3 className="font-display font-bold text-[#F4F7FA] text-base mt-0.5 group-hover:text-[#43D9F5] transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-[#9AAFC2] mt-1.5 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {proj.tags.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-[#0B1420] border border-white/10 font-mono text-[10px] text-[#9AAFC2]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-between text-xs font-semibold text-[#43D9F5]">
                <span>Inspect Architecture</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      title={selectedProject.title}
      eyebrow="Project Plaza Exhibition"
      subtitle={selectedProject.subtitle}
      maxWidthClass="max-w-2xl"
      onClose={closeModal}
      headerRight={
        <button
          type="button"
          onClick={() => useStore.setState({ selectedProject: null })}
          className="px-2.5 py-1.5 rounded-lg bg-[#1B3045] hover:bg-[#233d57] text-xs text-[#F4F7FA] border border-white/10 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All Projects
        </button>
      }
      footer={
        <>
          <span className="font-mono text-[11px] text-[#9AAFC2] truncate">
            {selectedProject.metrics || 'Full Stack Architecture'}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {selectedProject.githubUrl && (
              <a
                href={selectedProject.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-lg bg-[#1B3045] hover:bg-[#233d57] border border-white/10 text-[#F4F7FA] text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <GithubIcon className="w-3.5 h-3.5" /> GitHub
              </a>
            )}
            {selectedProject.liveUrl && (
              <a
                href={selectedProject.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-lg bg-[#43D9F5] hover:bg-[#5ce1f8] text-[#0B1420] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Live Demo
              </a>
            )}
          </div>
        </>
      }
    >
      <div className="space-y-5 text-sm text-[#9AAFC2]">
        <ProjectThumbnail id={selectedProject.id} />

        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-[#43D9F5] mb-1.5">
            Overview
          </h3>
          <p className="leading-relaxed text-[#F4F7FA]">{selectedProject.description}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#14263A] border border-white/10 space-y-1.5">
          <div className="font-display text-xs font-semibold uppercase tracking-wider text-[#F5B84B] flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" /> Problem Solved
          </div>
          <p className="text-xs text-[#F4F7FA]/90 leading-relaxed">{selectedProject.problemSolved}</p>
        </div>

        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-[#43D9F5] mb-1">
            Role & Contribution
          </h3>
          <p className="text-xs text-[#F4F7FA]/90">{selectedProject.role}</p>
        </div>

        {selectedProject.features && (
          <div>
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-[#43D9F5] mb-2">
              Key Highlights
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedProject.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[#F4F7FA]/90">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#43D9F5] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-[#43D9F5] mb-2">
            Tech Stack
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {selectedProject.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg bg-[#14263A] border border-white/10 font-mono text-xs text-[#F4F7FA]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </ModalShell>
  );
};
