import React from 'react';
import { useStore } from '../../store/useStore';
import { DEVELOPER_TOKENS } from '../../data/portfolio';
import { Trophy, Lock, Gem, RotateCcw } from 'lucide-react';
import { soundManager } from '../../utils/audio';
import { ZoneIcon } from '../ZoneIcon';
import { ModalShell } from '../ui/ModalShell';

export const AchievementsModal: React.FC = () => {
  const { activeModal, closeModal, achievements, collectedTokens, score, resetProgress } = useStore();

  if (activeModal !== 'achievements') return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const tokensCount = Object.values(collectedTokens).filter(Boolean).length;
  const progressPct = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <ModalShell
      title="Achievements"
      eyebrow="Island Progression"
      subtitle={`${unlockedCount} of ${achievements.length} unlocked (${progressPct}%)  •  ${tokensCount}/${DEVELOPER_TOKENS.length} Tokens  •  ${score} XP`}
      maxWidthClass="max-w-xl"
      accentHex="#F5B84B"
      onClose={closeModal}
      headerLeftSlot={
        <div className="w-11 h-11 rounded-xl bg-[#0B1420] border border-[#F5B84B]/40 flex items-center justify-center text-[#F5B84B] shrink-0">
          <Trophy className="w-5 h-5" />
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              resetProgress();
              soundManager.playClick();
            }}
            className="px-3.5 py-2 rounded-lg bg-[#1B3045] hover:bg-[#233d57] border border-white/10 text-[#9AAFC2] hover:text-[#F4F7FA] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Progress
          </button>

          <button
            type="button"
            onClick={() => {
              closeModal();
              soundManager.playClick();
            }}
            className="px-4 py-2 rounded-lg bg-[#F5B84B] hover:bg-[#f7c56a] text-[#0B1420] text-xs font-semibold transition-colors cursor-pointer"
          >
            Resume Driving
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Compact Completion Bar */}
        <div className="p-3.5 rounded-xl bg-[#14263A]/60 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[#9AAFC2] flex items-center gap-1.5">
              <Gem className="w-3.5 h-3.5 text-[#F5B84B]" />
              {tokensCount}/{DEVELOPER_TOKENS.length} Tokens Collected
            </span>
            <span className="font-mono font-semibold text-[#F5B84B]">{progressPct}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#0B1420] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#F5B84B] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Achievement List */}
        <div className="space-y-2.5">
          {achievements.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-colors ${
                item.unlocked
                  ? 'bg-[#14263A] border-[#F5B84B]/35'
                  : 'bg-[#14263A]/35 border-white/10 opacity-65'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                  item.unlocked
                    ? 'bg-[#0B1420] border-[#F5B84B]/40 text-[#F5B84B]'
                    : 'bg-[#0B1420] border-white/10 text-[#9AAFC2]'
                }`}
              >
                {item.unlocked ? <ZoneIcon name={item.icon} size={18} /> : <Lock className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-display font-semibold text-xs text-[#F4F7FA] truncate">
                    {item.title}
                  </div>
                  <span className="font-mono text-[10px] font-semibold text-[#F5B84B] shrink-0">
                    +{item.xp} XP
                  </span>
                </div>
                <div className="text-[11px] text-[#9AAFC2] mt-0.5">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ModalShell>
  );
};
