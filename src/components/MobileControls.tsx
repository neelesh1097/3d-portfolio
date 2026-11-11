import React from 'react';
import { useStore } from '../store/useStore';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Zap, ArrowUpCircle, RotateCcw, Hand } from 'lucide-react';
import { soundManager } from '../utils/audio';

export const MobileControls: React.FC = () => {
  const { setControls, resetCar, approachedZone, setActiveModal } = useStore();

  return (
    <div className="fixed inset-x-0 bottom-6 pointer-events-none z-30 flex justify-between items-end px-4 sm:hidden">
      {/* Left D-Pad: Steering & Drive */}
      <div className="pointer-events-auto grid grid-cols-3 gap-1.5 w-36 h-36">
        <div />
        {/* Forward */}
        <button
          onTouchStart={() => setControls({ forward: true })}
          onTouchEnd={() => setControls({ forward: false })}
          onMouseDown={() => setControls({ forward: true })}
          onMouseUp={() => setControls({ forward: false })}
          className="w-11 h-11 rounded-xl bg-slate-900/80 border border-slate-700/80 active:bg-sky-500/40 text-slate-200 flex items-center justify-center backdrop-blur-md cursor-pointer select-none"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <div />

        {/* Left */}
        <button
          onTouchStart={() => setControls({ left: true })}
          onTouchEnd={() => setControls({ left: false })}
          onMouseDown={() => setControls({ left: true })}
          onMouseUp={() => setControls({ left: false })}
          className="w-11 h-11 rounded-xl bg-slate-900/80 border border-slate-700/80 active:bg-sky-500/40 text-slate-200 flex items-center justify-center backdrop-blur-md cursor-pointer select-none"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Reverse / Brake */}
        <button
          onTouchStart={() => setControls({ backward: true })}
          onTouchEnd={() => setControls({ backward: false })}
          onMouseDown={() => setControls({ backward: true })}
          onMouseUp={() => setControls({ backward: false })}
          className="w-11 h-11 rounded-xl bg-slate-900/80 border border-slate-700/80 active:bg-sky-500/40 text-slate-200 flex items-center justify-center backdrop-blur-md cursor-pointer select-none"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* Right */}
        <button
          onTouchStart={() => setControls({ right: true })}
          onTouchEnd={() => setControls({ right: false })}
          onMouseDown={() => setControls({ right: true })}
          onMouseUp={() => setControls({ right: false })}
          className="w-11 h-11 rounded-xl bg-slate-900/80 border border-slate-700/80 active:bg-sky-500/40 text-slate-200 flex items-center justify-center backdrop-blur-md cursor-pointer select-none"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Right Action Cluster: Boost, Jump, Interact */}
      <div className="pointer-events-auto flex flex-col gap-2 items-end">
        {approachedZone && (
          <button
            onClick={() => {
              setActiveModal(approachedZone as any);
              soundManager.playClick();
            }}
            className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-1.5 animate-bounce"
          >
            <Hand className="w-4 h-4" /> Open {approachedZone.toUpperCase()}
          </button>
        )}

        <div className="flex gap-2">
          {/* Reset */}
          <button
            onClick={() => {
              resetCar();
              soundManager.playClick();
            }}
            className="w-12 h-12 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-300 flex items-center justify-center active:bg-slate-700 backdrop-blur-md cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Jump */}
          <button
            onTouchStart={() => {
              setControls({ jump: true });
              soundManager.playJump();
            }}
            onTouchEnd={() => setControls({ jump: false })}
            onMouseDown={() => {
              setControls({ jump: true });
              soundManager.playJump();
            }}
            onMouseUp={() => setControls({ jump: false })}
            className="w-12 h-12 rounded-full bg-slate-900/80 border border-slate-700/80 text-amber-400 flex items-center justify-center active:bg-amber-500/40 backdrop-blur-md cursor-pointer"
          >
            <ArrowUpCircle className="w-6 h-6" />
          </button>

          {/* Nitro Boost */}
          <button
            onTouchStart={() => {
              setControls({ boost: true });
              soundManager.playBoost();
            }}
            onTouchEnd={() => setControls({ boost: false })}
            onMouseDown={() => {
              setControls({ boost: true });
              soundManager.playBoost();
            }}
            onMouseUp={() => setControls({ boost: false })}
            className="w-12 h-12 rounded-full bg-sky-600/90 border border-sky-400 text-white flex items-center justify-center active:scale-95 shadow-lg shadow-sky-500/30 backdrop-blur-md cursor-pointer"
          >
            <Zap className="w-6 h-6 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};

