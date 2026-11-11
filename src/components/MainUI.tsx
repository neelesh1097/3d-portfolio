import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ZONES } from '../data/portfolio';
import { ArrowRight } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { UIHeader } from './UIHeader';
import { UIStatusBar } from './UIStatusBar';
import { ZoneIcon } from './ZoneIcon';
import { CornerRadar } from './CornerRadar';

const MobileSpeedReadout: React.FC = () => {
  const carSpeed = useStore((s) => s.carSpeed);
  return (
    <div className="pointer-events-auto hud-surface rounded-xl px-3 py-1.5 font-mono text-xs font-bold text-[#F4F7FA] tabular-nums">
      {carSpeed} <span className="text-[10px] text-[#9AAFC2]">KM/H</span>
    </div>
  );
};

export const MainUI: React.FC = React.memo(() => {
  const approachedZone = useStore((s) => s.approachedZone);
  const setActiveModal = useStore((s) => s.setActiveModal);

  const approachedInfo =
    approachedZone && approachedZone !== 'spawn'
      ? ZONES.find((z) => z.id === approachedZone)
      : null;

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* Top Floating Portfolio Navigation */}
      <UIHeader />

      {/* Mobile Compact Telemetry + Corner Minimap */}
      <div className="sm:hidden flex items-start justify-between mt-2">
        <MobileSpeedReadout />
        <div className="pointer-events-auto">
          <CornerRadar />
        </div>
      </div>

      {/* Bottom Stack: Floating Interaction Prompt (low-center, non-obstructive) + Player HUD */}
      <div className="flex flex-col items-center gap-3 w-full">
        <AnimatePresence>
          {approachedInfo && (
            <motion.div
              key={approachedInfo.id}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="pointer-events-auto max-w-[calc(100vw-2rem)]"
            >
              <button
                type="button"
                onClick={() => {
                  setActiveModal(approachedInfo.id as any);
                  soundManager.playClick();
                }}
                className="group hud-surface-elevated rounded-xl px-4 py-2.5 border border-[#43D9F5]/40 shadow-xl flex items-center gap-3 hover:border-[#43D9F5] transition-colors cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-[#0B1420] border border-white/10 flex items-center justify-center text-[#43D9F5] shrink-0">
                  <ZoneIcon name={approachedInfo.icon} size={18} />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-xs font-bold uppercase tracking-wider text-[#F4F7FA] truncate">
                    {approachedInfo.name}
                  </div>
                  <div className="text-[11px] text-[#9AAFC2] truncate">
                    {approachedInfo.tagline}
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 pl-3 ml-1 border-l border-white/10 text-xs text-[#9AAFC2]">
                  <span>Press</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-[#0B1420] border border-[#43D9F5]/40 font-mono text-[11px] font-semibold text-[#43D9F5]">
                    E
                  </kbd>
                  <span>to enter</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#43D9F5] sm:hidden shrink-0" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <UIStatusBar />
      </div>
    </div>
  );
});
