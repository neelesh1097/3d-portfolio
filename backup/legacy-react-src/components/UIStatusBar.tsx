import React from 'react';
import { useStore } from '../store/useStore';
import { MapPin, Keyboard, X, Zap } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { CornerRadar } from './CornerRadar';

const DESKTOP_CONTROLS = [
  { keys: 'W A S D', action: 'Drive and steer' },
  { keys: 'SHIFT', action: 'Nitro boost' },
  { keys: 'SPACE', action: 'Jump' },
  { keys: 'E', action: 'Interact' },
  { keys: 'M', action: 'Map' },
  { keys: 'R', action: 'Reset vehicle' },
  { keys: 'H', action: 'Horn' },
  { keys: 'Scroll', action: 'Camera zoom' },
];

const MOBILE_CONTROLS_GUIDE = [
  { keys: 'D-Pad', action: 'Accelerate, reverse & steer' },
  { keys: 'Lightning', action: 'Nitro boost' },
  { keys: 'Up Arrow', action: 'Jump stunt' },
  { keys: 'Radar', action: 'Tap minimap to fast-travel' },
];

const SpeedometerPod: React.FC = () => {
  const carSpeed = useStore((s) => s.carSpeed);
  const isBoosting = useStore((s) => s.isBoosting);
  const activeSegments = Math.min(8, Math.max(isBoosting ? 8 : 2, Math.round((carSpeed / 120) * 8)));

  return (
    <div className="hud-surface rounded-xl px-3.5 py-2.5 flex items-center gap-3.5">
      <div className="min-w-[3.2rem]">
        <div className="font-mono text-2xl font-bold text-[#F4F7FA] leading-none tabular-nums">
          {String(carSpeed).padStart(2, '0')}
        </div>
        <div className="font-mono text-[10px] tracking-wider text-[#9AAFC2] mt-1">KM/H</div>
      </div>

      <div className="border-l border-white/10 pl-3.5 space-y-1.5">
        <div className="flex items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-wider">
          <span className={`flex items-center gap-1 font-semibold ${isBoosting ? 'text-[#F5B84B]' : 'text-[#43D9F5]'}`}>
            <Zap className="w-3 h-3" />
            {isBoosting ? 'Boost Active' : 'Nitro Ready'}
          </span>
        </div>
        <div className="flex items-center gap-1" aria-label="Nitro charge">
          {Array.from({ length: 8 }).map((_, idx) => {
            const lit = idx < activeSegments;
            return (
              <span
                key={idx}
                className={`h-1.5 w-2.5 rounded-sm transition-colors ${
                  lit
                    ? isBoosting
                      ? 'bg-[#F5B84B]'
                      : 'bg-[#43D9F5]'
                    : 'bg-[#14263A]'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const UIStatusBar: React.FC = React.memo(() => {
  const nearestSpot = useStore((s) => s.nearestSpot);
  const controlsOpen = useStore((s) => s.controlsOpen);
  const setControlsOpen = useStore((s) => s.setControlsOpen);

  return (
    <footer className="pointer-events-none w-full max-w-7xl mx-auto relative">
      {controlsOpen && (
        <div className="pointer-events-auto absolute bottom-full right-0 mb-3 w-72 sm:w-80 rounded-xl bg-[#0B1420]/96 border border-white/10 shadow-2xl p-4 z-30">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2 font-display text-sm font-semibold text-[#F4F7FA]">
              <Keyboard className="w-4 h-4 text-[#43D9F5]" />
              <span>Driving Controls</span>
            </div>
            <button
              type="button"
              aria-label="Close controls guide"
              onClick={() => {
                setControlsOpen(false);
                soundManager.playClick();
              }}
              className="p-1 rounded-lg text-[#9AAFC2] hover:text-[#F4F7FA] hover:bg-[#14263A] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden sm:block space-y-1.5">
            {DESKTOP_CONTROLS.map((item) => (
              <div key={item.keys} className="flex items-center justify-between text-xs py-0.5">
                <kbd className="px-2 py-0.5 rounded-md bg-[#14263A] border border-white/10 font-mono text-[11px] font-semibold text-[#43D9F5]">
                  {item.keys}
                </kbd>
                <span className="text-[#9AAFC2]">{item.action}</span>
              </div>
            ))}
          </div>

          <div className="sm:hidden space-y-1.5">
            {MOBILE_CONTROLS_GUIDE.map((item) => (
              <div key={item.keys} className="flex items-center justify-between text-xs py-0.5">
                <span className="px-2 py-0.5 rounded-md bg-[#14263A] border border-white/10 font-mono text-[11px] font-semibold text-[#43D9F5]">
                  {item.keys}
                </span>
                <span className="text-[#9AAFC2] text-right">{item.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="hidden sm:flex items-end justify-between gap-4">
        <div className="pointer-events-auto">
          <SpeedometerPod />
        </div>

        <div className="pointer-events-auto hud-surface rounded-xl px-4 py-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#43D9F5] shrink-0" />
          <span className="font-display text-xs sm:text-sm font-semibold text-[#F4F7FA]">
            {nearestSpot}
          </span>
        </div>

        <div className="pointer-events-auto flex items-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              setControlsOpen(!controlsOpen);
              soundManager.playClick();
            }}
            aria-label="Toggle driving controls guide"
            title="Driving Controls"
            className={`hud-surface rounded-xl p-2.5 transition-colors cursor-pointer ${
              controlsOpen
                ? 'bg-[#1B3045] text-[#43D9F5] border-[#43D9F5]/40'
                : 'text-[#9AAFC2] hover:text-[#F4F7FA] hover:bg-[#14263A]'
            }`}
          >
            <Keyboard className="w-4 h-4" />
          </button>

          <CornerRadar />
        </div>
      </div>

      <div className="sm:hidden flex items-center justify-between gap-2 pointer-events-auto">
        <div className="hud-surface rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-xs">
          <MapPin className="w-3.5 h-3.5 text-[#43D9F5]" />
          <span className="font-display font-semibold text-[#F4F7FA]">{nearestSpot}</span>
        </div>

        <button
          type="button"
          onClick={() => {
            setControlsOpen(!controlsOpen);
            soundManager.playClick();
          }}
          aria-label="Toggle mobile controls guide"
          className="hud-surface rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-xs text-[#9AAFC2]"
        >
          <Keyboard className="w-3.5 h-3.5 text-[#43D9F5]" />
          <span>Help</span>
        </button>
      </div>
    </footer>
  );
});
