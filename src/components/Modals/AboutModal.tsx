import React from 'react';
import { useStore } from '../../store/useStore';
import { PERSONAL_INFO } from '../../data/portfolio';
import { MapPin, Sparkles, Compass } from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { ModalShell } from '../ui/ModalShell';

const INTERESTS = [
  'Interactive 3D & WebGL',
  'Distributed Backend Systems',
  'High-Throughput Caching',
  'Developer Tooling & DX',
];

export const AboutModal: React.FC = () => {
  const { activeModal, closeModal } = useStore();

  if (activeModal !== 'about') return null;

  return (
    <ModalShell
      title={PERSONAL_INFO.name}
      eyebrow="About Me • Personal Studio"
      subtitle={`${PERSONAL_INFO.role} • ${PERSONAL_INFO.location}`}
      maxWidthClass="max-w-2xl"
      onClose={closeModal}
      headerLeftSlot={
        /* Stylized Developer Profile Avatar */
        <div className="w-14 h-14 rounded-xl bg-[#0B1420] border border-[#43D9F5]/40 flex items-center justify-center shrink-0 overflow-hidden">
          <svg viewBox="0 0 64 64" className="w-full h-full" aria-label="Neelesh Yadav profile avatar">
            <rect width="64" height="64" fill="#0B1420" />
            <circle cx="32" cy="24" r="10" fill="#43D9F5" opacity="0.9" />
            <path d="M14 54 C14 42, 50 42, 50 54 Z" fill="#1B3045" stroke="#43D9F5" strokeWidth="1.5" />
            <circle cx="48" cy="16" r="4" fill="#F5B84B" />
          </svg>
        </div>
      }
      footer={
        <>
          <span className="flex items-center gap-1.5 text-xs text-[#9AAFC2]">
            <MapPin className="w-3.5 h-3.5 text-[#43D9F5]" /> {PERSONAL_INFO.location}
          </span>
          <button
            type="button"
            onClick={() => {
              closeModal();
              soundManager.playClick();
            }}
            className="px-4 py-2 rounded-lg bg-[#43D9F5] hover:bg-[#5ce1f8] text-[#0B1420] text-xs font-semibold transition-colors cursor-pointer"
          >
            Resume Driving
          </button>
        </>
      }
    >
      <div className="space-y-6 text-sm text-[#9AAFC2]">
        {/* Introduction Quote */}
        <div className="p-4 rounded-xl bg-[#14263A] border border-white/10 text-[#F4F7FA] leading-relaxed">
          {PERSONAL_INFO.bio}
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PERSONAL_INFO.stats.map((stat, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-[#14263A]/60 border border-white/10 text-center"
            >
              <div className="font-mono text-lg font-bold text-[#43D9F5]">{stat.value}</div>
              <div className="text-[11px] text-[#9AAFC2] mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Background */}
        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-[#43D9F5] mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Engineering Background
          </h3>
          <p className="whitespace-pre-line leading-relaxed text-[#F4F7FA]/90 text-sm">
            {PERSONAL_INFO.story}
          </p>
        </div>

        {/* Career Interests */}
        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-[#F5B84B] mb-2.5 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" /> Career Interests
          </h3>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1.5 rounded-lg bg-[#14263A] border border-white/10 text-xs text-[#F4F7FA] font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </ModalShell>
  );
};
