import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { EXPERIENCES_DATA, EDUCATION_DATA, CERTIFICATIONS_DATA } from '../../data/experience';
import { CheckCircle2, GraduationCap, Award, Briefcase, BookOpen } from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { ModalShell } from '../ui/ModalShell';

export const ExperienceModal: React.FC = () => {
  const { activeModal, closeModal } = useStore();
  const [tab, setTab] = useState<'work' | 'education' | 'certs'>('work');

  if (activeModal !== 'experience') return null;

  const edu = EDUCATION_DATA[0];

  return (
    <ModalShell
      title="Career, Education & Certs"
      eyebrow="Experience Center"
      subtitle="Engineering milestones, software internships, computer science fundamentals, and certifications."
      maxWidthClass="max-w-2xl"
      onClose={closeModal}
      subNav={
        <div className="flex gap-1 py-2 overflow-x-auto">
          {[
            { id: 'work', label: 'Experience', icon: Briefcase },
            { id: 'education', label: 'Education', icon: GraduationCap },
            { id: 'certs', label: 'Certifications', icon: Award },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id as any);
                  soundManager.playClick();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#1B3045] text-[#43D9F5] border border-[#43D9F5]/30'
                    : 'text-[#9AAFC2] hover:text-[#F4F7FA] hover:bg-[#14263A]/60 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      }
      footer={
        <>
          <span className="font-mono text-[11px] text-[#9AAFC2]">
            {EXPERIENCES_DATA.length} Roles • {CERTIFICATIONS_DATA.length} Certifications
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
      {tab === 'work' && (
        <div className="space-y-5">
          {EXPERIENCES_DATA.map((exp) => (
            <div
              key={exp.id}
              className="relative pl-6 border-l border-[#43D9F5]/35 space-y-2 pb-2"
            >
              <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#43D9F5] ring-4 ring-[#0B1420]" />
              <div className="p-4 rounded-xl bg-[#14263A]/55 border border-white/10 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-[#F4F7FA] text-base">
                      {exp.company}
                    </h3>
                    <div className="text-xs font-medium text-[#43D9F5] mt-0.5">
                      {exp.role} <span className="text-[#9AAFC2]">• {exp.location}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-[#F5B84B] bg-[#0B1420] border border-white/10 px-2.5 py-0.5 rounded-md">
                    {exp.period}
                  </span>
                </div>

                <ul className="space-y-1.5 pt-1">
                  {exp.description.map((desc, i) => (
                    <li key={i} className="text-xs text-[#F4F7FA]/90 flex items-start gap-2 leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#43D9F5] shrink-0 mt-0.5" />
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {exp.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-[#0B1420] border border-white/10 font-mono text-[10px] text-[#9AAFC2]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'education' && (
        <div className="space-y-5 text-sm text-[#9AAFC2]">
          <div className="p-4 rounded-xl bg-[#14263A] border border-white/10 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#0B1420] border border-[#43D9F5]/40 flex items-center justify-center text-[#43D9F5] shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-[#F4F7FA] text-base">{edu.degree}</h3>
              <div className="text-xs text-[#43D9F5] font-medium mt-0.5">{edu.institution}</div>
              <div className="font-mono text-[11px] text-[#9AAFC2] mt-1">
                {edu.period} • {edu.grade}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-[#43D9F5] mb-2.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Core Coursework
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {edu.coursework.map((course, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-[#14263A]/50 border border-white/10 text-xs text-[#F4F7FA]/90 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#43D9F5] shrink-0" />
                  <span>{course}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'certs' && (
        <div className="space-y-3">
          {CERTIFICATIONS_DATA.map((cert) => (
            <div
              key={cert.id}
              className="p-4 rounded-xl bg-[#14263A]/60 border border-white/10 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0B1420] border border-[#F5B84B]/35 flex items-center justify-center text-[#F5B84B] shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-display font-semibold text-[#F4F7FA] text-sm">
                    {cert.title}
                  </div>
                  <div className="text-xs text-[#9AAFC2]">{cert.issuer}</div>
                </div>
              </div>
              <span className="font-mono text-xs text-[#F5B84B] bg-[#0B1420] border border-white/10 px-2.5 py-1 rounded-md shrink-0">
                {cert.year}
              </span>
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  );
};
