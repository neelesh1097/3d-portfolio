import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ZONES } from '../data/portfolio';
import {
  Volume2,
  VolumeX,
  Compass,
  Trophy,
  RotateCcw,
  Sparkles,
  Monitor,
  Eye,
  Keyboard,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

export const MainUI: React.FC = () => {
  const {
    isSoundMuted,
    toggleSound,
    teleportTo,
    activeZone,
    approachedZone,
    setActiveModal,
    toggleMinimap,
    resetCar,
    carSpeed,
    isBoosting,
    achievements,
    score,
    toggle2DView,
  } = useStore();

  const [showControls, setShowControls] = useState(true);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* ========================================================
          TOP NAVIGATION BAR
         ======================================================== */}
      <header className="pointer-events-auto flex items-center justify-between gap-3 w-full">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-xs font-mono text-white">
            NY
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-white tracking-wide">Neelesh Yadav</div>
            <div className="text-[10px] text-sky-400 font-medium">Full-Stack & AI</div>
          </div>
        </div>

        {/* Center: Zone Teleport Pills (Desktop & Tablet) */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
          {ZONES.map((zone) => {
            const isCurrent = activeZone === zone.id;
            return (
              <button
                key={zone.id}
                onClick={() => {
                  teleportTo(zone.position, zone.id);
                  soundManager.playClick();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCurrent
                    ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{zone.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
          {/* Audio Toggle */}
          <button
            onClick={() => {
              toggleSound();
              soundManager.setMuted(!isSoundMuted);
            }}
            title={isSoundMuted ? 'Unmute Sound' : 'Mute Sound'}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              !isSoundMuted ? 'text-sky-400 bg-sky-950/60 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {!isSoundMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Map Button */}
          <button
            onClick={() => {
              toggleMinimap();
              soundManager.playClick();
            }}
            title="Open GPS Radar [M]"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Achievements Drawer Trigger */}
          <button
            onClick={() => {
              setActiveModal('achievements');
              soundManager.playClick();
            }}
            title="View Achievements"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-amber-400 hover:bg-amber-950/40 border border-transparent hover:border-amber-500/30 transition-all cursor-pointer text-xs font-bold font-mono"
          >
            <Trophy className="w-4 h-4" />
            <span>{unlockedCount}/{achievements.length}</span>
          </button>

          {/* Reset Car */}
          <button
            onClick={() => {
              resetCar();
              soundManager.playClick();
            }}
            title="Respawn / Reset Car [R]"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* 2D Standard View Toggle */}
          <button
            onClick={() => {
              toggle2DView();
              soundManager.playClick();
            }}
            title="Switch to 2D Portfolio View"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ========================================================
          CENTER: PROXIMITY INTERACTION BANNER
         ======================================================== */}
      {approachedZone && (
        <div className="pointer-events-auto self-center my-auto">
          <div
            onClick={() => {
              setActiveModal(approachedZone as any);
              soundManager.playClick();
            }}
            className="cursor-pointer px-6 py-3 rounded-2xl backdrop-blur-xl bg-slate-900/90 border-2 border-sky-400/80 text-white shadow-2xl shadow-sky-500/30 flex items-center gap-3 animate-pulse hover:scale-105 transition-all"
          >
            <Sparkles className="w-5 h-5 text-sky-400" />
            <div>
              <div className="text-[11px] font-bold text-sky-300 uppercase tracking-wider">
                Approaching Zone
              </div>
              <div className="text-sm font-extrabold flex items-center gap-1.5">
                <span>Inspect {approachedZone.toUpperCase()}</span>
                <span className="text-xs text-slate-400 font-mono">[Press E]</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          BOTTOM HUD: SPEEDOMETER & KEYBOARD CONTROLS HELPER
         ======================================================== */}
      <footer className="pointer-events-auto flex items-end justify-between w-full">
        {/* Speedometer Card */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-xl flex items-center gap-3.5">
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-black font-mono text-white leading-none">
              {carSpeed}
            </div>
            <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">KM/H</div>
          </div>

          {/* Nitro Indicator */}
          <div className="flex flex-col gap-1 border-l border-slate-800 pl-3">
            <div className="text-[9px] font-extrabold uppercase tracking-widest text-sky-400">NITRO</div>
            <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
              <div
                className={`h-full transition-all duration-150 ${
                  isBoosting
                    ? 'w-full bg-gradient-to-r from-cyan-400 to-sky-500 shadow-md shadow-sky-400'
                    : 'w-1/2 bg-sky-600'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Desktop Keyboard Controls Overlay */}
        <div className="hidden lg:flex flex-col items-end">
          <div className="p-3 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-xl text-xs text-slate-300">
            <div className="flex items-center justify-between gap-4 mb-2 border-b border-slate-800 pb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5" /> Driving Controls
              </span>
              <button
                onClick={() => setShowControls(!showControls)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                {showControls ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showControls && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono">W A S D</kbd>
                  <span className="text-slate-400">Steer</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono">Shift</kbd>
                  <span className="text-slate-400">Nitro Boost</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono">Space</kbd>
                  <span className="text-slate-400">Jump Stunt</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono">E / Enter</kbd>
                  <span className="text-slate-400">Interact</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono">R</kbd>
                  <span className="text-slate-400">Respawn</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono">H</kbd>
                  <span className="text-slate-400">Honk Horn</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
