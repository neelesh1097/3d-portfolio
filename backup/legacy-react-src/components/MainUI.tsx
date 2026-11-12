import React from 'react';
import { useStore } from '../store/useStore';
import { UIHeader } from './UIHeader';
import { UIStatusBar } from './UIStatusBar';
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
  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-5 select-none">
      <UIHeader />

      <div className="sm:hidden flex items-start justify-between mt-2">
        <MobileSpeedReadout />
        <div className="pointer-events-auto">
          <CornerRadar />
        </div>
      </div>

      <UIStatusBar />
    </div>
  );
});
