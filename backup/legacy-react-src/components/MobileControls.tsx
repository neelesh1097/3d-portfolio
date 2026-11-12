import React from 'react';
import { useStore } from '../store/useStore';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  ArrowUp,
  RotateCcw,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

export const MobileControls: React.FC = () => {
  const { setControls, resetCar, unlockAchievement } = useStore();

  const holdControl = (
    key: 'forward' | 'backward' | 'left' | 'right' | 'boost' | 'jump',
    active: boolean
  ) => {
    setControls({ [key]: active });
    if (active && (key === 'forward' || key === 'backward')) {
      unlockAchievement('first_drive');
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-14 pointer-events-none z-20 flex justify-between items-end px-4 sm:hidden">
      {/* Left D-Pad */}
      <div className="pointer-events-auto grid grid-cols-3 gap-1.5 w-36 h-36 touch-none">
        <div />
        <button
          type="button"
          aria-label="Accelerate"
          onPointerDown={() => holdControl('forward', true)}
          onPointerUp={() => holdControl('forward', false)}
          onPointerLeave={() => holdControl('forward', false)}
          onPointerCancel={() => holdControl('forward', false)}
          className="w-11 h-11 rounded-xl hud-surface active:bg-[#43D9F5] active:text-[#0B1420] text-[#F4F7FA] flex items-center justify-center cursor-pointer select-none"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <div />

        <button
          type="button"
          aria-label="Turn Left"
          onPointerDown={() => holdControl('left', true)}
          onPointerUp={() => holdControl('left', false)}
          onPointerLeave={() => holdControl('left', false)}
          onPointerCancel={() => holdControl('left', false)}
          className="w-11 h-11 rounded-xl hud-surface active:bg-[#43D9F5] active:text-[#0B1420] text-[#F4F7FA] flex items-center justify-center cursor-pointer select-none"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          aria-label="Reverse"
          onPointerDown={() => holdControl('backward', true)}
          onPointerUp={() => holdControl('backward', false)}
          onPointerLeave={() => holdControl('backward', false)}
          onPointerCancel={() => holdControl('backward', false)}
          className="w-11 h-11 rounded-xl hud-surface active:bg-[#43D9F5] active:text-[#0B1420] text-[#F4F7FA] flex items-center justify-center cursor-pointer select-none"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <button
          type="button"
          aria-label="Turn Right"
          onPointerDown={() => holdControl('right', true)}
          onPointerUp={() => holdControl('right', false)}
          onPointerLeave={() => holdControl('right', false)}
          onPointerCancel={() => holdControl('right', false)}
          className="w-11 h-11 rounded-xl hud-surface active:bg-[#43D9F5] active:text-[#0B1420] text-[#F4F7FA] flex items-center justify-center cursor-pointer select-none"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Right Action Cluster */}
      <div className="pointer-events-auto flex gap-2 items-end touch-none">
        <button
          type="button"
          aria-label="Respawn vehicle"
          onClick={() => {
            resetCar();
            soundManager.playClick();
          }}
          className="w-11 h-11 rounded-xl hud-surface text-[#9AAFC2] active:text-[#F4F7FA] flex items-center justify-center cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          aria-label="Jump"
          onPointerDown={() => {
            holdControl('jump', true);
            soundManager.playJump();
          }}
          onPointerUp={() => holdControl('jump', false)}
          onPointerLeave={() => holdControl('jump', false)}
          onPointerCancel={() => holdControl('jump', false)}
          className="w-12 h-12 rounded-xl hud-surface border-[#F5B84B]/40 text-[#F5B84B] active:bg-[#F5B84B] active:text-[#0B1420] flex items-center justify-center cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        <button
          type="button"
          aria-label="Nitro Boost"
          onPointerDown={() => {
            holdControl('boost', true);
            soundManager.playBoost();
            unlockAchievement('nitro_boost');
          }}
          onPointerUp={() => holdControl('boost', false)}
          onPointerLeave={() => holdControl('boost', false)}
          onPointerCancel={() => holdControl('boost', false)}
          className="w-12 h-12 rounded-xl bg-[#43D9F5] text-[#0B1420] active:scale-95 flex items-center justify-center cursor-pointer"
        >
          <Zap className="w-5 h-5 fill-current" />
        </button>
      </div>
    </div>
  );
};
