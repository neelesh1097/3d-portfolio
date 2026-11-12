import React, { useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { SKILL_CATEGORIES_DATA } from '../../data/skills';
import { soundManager } from '../../utils/audio';
import { ModalShell } from '../ui/ModalShell';
import { ZoneIcon } from '../ZoneIcon';

const TECH_KEYS = ['frontend', 'backend', 'database', 'devops'] as const;

export const TechModal: React.FC = () => {
  const { activeModal, setActiveModal, closeModal, unlockAchievement } = useStore();
  const isTechModal = Boolean(activeModal && TECH_KEYS.includes(activeModal as any));

  useEffect(() => {
    if (activeModal === 'frontend') unlockAchievement('frontend_explorer');
    if (activeModal === 'backend') unlockAchievement('backend_explorer');
    if (activeModal === 'database') unlockAchievement('database_master');
  }, [activeModal, unlockAchievement]);

  if (!isTechModal) return null;

  const currentData = SKILL_CATEGORIES_DATA[activeModal as string] || SKILL_CATEGORIES_DATA.frontend;

  return (
    <ModalShell
      title={currentData.title}
      eyebrow="Tech Stack Architecture"
      subtitle={currentData.description}
      maxWidthClass="max-w-2xl"
      onClose={closeModal}
      headerLeftSlot={
        <div className="w-11 h-11 rounded-xl bg-[#0B1420] border border-[#43D9F5]/40 flex items-center justify-center text-[#43D9F5] shrink-0">
          <ZoneIcon name={currentData.icon} size={20} />
        </div>
      }
      subNav={
        <div className="flex gap-1 overflow-x-auto py-2">
          {TECH_KEYS.map((key) => {
            const cat = SKILL_CATEGORIES_DATA[key];
            const active = key === activeModal;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveModal(key as any);
                  soundManager.playClick();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? 'bg-[#1B3045] text-[#43D9F5] border border-[#43D9F5]/30'
                    : 'text-[#9AAFC2] hover:text-[#F4F7FA] hover:bg-[#14263A]/60 border border-transparent'
                }`}
              >
                <ZoneIcon name={cat.icon} size={13} />
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>
      }
      footer={
        <>
          <span className="font-mono text-[11px] text-[#9AAFC2]">
            {currentData.skills.length} Core Technologies
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
      <div className="space-y-3.5">
        {currentData.skills.map((skill) => (
          <div
            key={skill.name}
            className="p-3.5 rounded-xl bg-[#14263A]/55 border border-white/10 space-y-2"
          >
            <div className="flex justify-between items-center text-xs gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-[#F4F7FA] truncate">{skill.name}</span>
                {skill.experience && (
                  <span className="font-mono text-[10px] text-[#9AAFC2] bg-[#0B1420] px-2 py-0.5 rounded border border-white/10 shrink-0">
                    {skill.experience}
                  </span>
                )}
              </div>
              <span className="font-mono font-semibold text-[#43D9F5] shrink-0">
                {skill.level}%
              </span>
            </div>

            <div className="h-1.5 rounded-full bg-[#0B1420] overflow-hidden border border-white/5">
              <div
                className="h-full rounded-full bg-[#43D9F5] transition-all duration-300"
                style={{ width: `${skill.level}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </ModalShell>
  );
};
