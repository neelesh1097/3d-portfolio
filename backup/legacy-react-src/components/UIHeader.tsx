import React, { useState, useRef, useEffect } from 'react';
import { useStore, QualityLevel } from '../store/useStore';
import type { PaintName } from '../engine/World/VisualVehicle';
import type { DayMode } from '../engine/DayCycles';
import {
  Volume2,
  VolumeX,
  Compass,
  Trophy,
  Settings,
  RotateCcw,
  Activity,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

const QUALITY_OPTIONS: Array<{ id: QualityLevel; label: string }> = [
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Med' },
  { id: 'low', label: 'Low' },
];

const PAINT_OPTIONS: Array<{ id: PaintName; color: string; label: string }> = [
  { id: 'cyan', color: '#43d9f5', label: 'Cyan' },
  { id: 'orange', color: '#ff940d', label: 'Sunset' },
  { id: 'red', color: '#ff3a3a', label: 'Crimson' },
  { id: 'white', color: '#f1f5f9', label: 'Pearl' },
  { id: 'black', color: '#334155', label: 'Stealth' },
  { id: 'flames', color: '#f97316', label: 'Flames' },
  { id: 'abyssal', color: '#6366f1', label: 'Abyss' },
];

const DAY_OPTIONS: Array<{ id: DayMode; label: string }> = [
  { id: 'day', label: 'Day' },
  { id: 'sunset', label: 'Dusk' },
  { id: 'night', label: 'Night' },
  { id: 'auto', label: 'Auto' },
];

export const UIHeader: React.FC = React.memo(() => {
  const isSoundMuted = useStore((s) => s.isSoundMuted);
  const toggleSound = useStore((s) => s.toggleSound);
  const teleportToSpot = useStore((s) => s.teleportToSpot);
  const setActiveModal = useStore((s) => s.setActiveModal);
  const toggleMinimap = useStore((s) => s.toggleMinimap);
  const resetCar = useStore((s) => s.resetCar);
  const achievements = useStore((s) => s.achievements);
  const qualityLevel = useStore((s) => s.qualityLevel);
  const setQualityLevel = useStore((s) => s.setQualityLevel);
  const vehiclePaint = useStore((s) => s.vehiclePaint);
  const setVehiclePaint = useStore((s) => s.setVehiclePaint);
  const dayMode = useStore((s) => s.dayMode);
  const setDayMode = useStore((s) => s.setDayMode);
  const showPerfPanel = useStore((s) => s.showPerfPanel);
  const togglePerfPanel = useStore((s) => s.togglePerfPanel);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <header ref={headerRef} className="pointer-events-auto w-full max-w-7xl mx-auto relative">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            teleportToSpot('landing');
            soundManager.playClick();
          }}
          title="Return to Spawn Hub"
          className="hud-surface rounded-xl px-3.5 py-2 flex items-center gap-3 hover:bg-[#14263A]/90 transition-colors cursor-pointer text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-[#14263A] border border-[#43D9F5]/40 flex items-center justify-center font-mono font-bold text-xs text-[#43D9F5] shrink-0">
            NY
          </div>
          <div className="min-w-0">
            <div className="font-display text-sm font-bold text-[#F4F7FA] leading-tight truncate">
              Neelesh Yadav
            </div>
            <div className="text-[11px] text-[#9AAFC2] leading-tight truncate">
              Full Stack Island
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 ml-1 pl-2.5 border-l border-white/10 font-mono text-xs font-semibold text-[#F5B84B]">
            <Trophy className="w-3.5 h-3.5" />
            <span>
              {unlockedCount}/{achievements.length}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-1 hud-surface rounded-xl p-1 relative">
          <button
            type="button"
            onClick={() => {
              soundManager.setMuted(!isSoundMuted);
              toggleSound();
            }}
            aria-label={isSoundMuted ? 'Unmute audio' : 'Mute audio'}
            title={isSoundMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 rounded-lg text-[#9AAFC2] hover:text-[#F4F7FA] hover:bg-[#14263A] transition-colors cursor-pointer"
          >
            {isSoundMuted ? (
              <VolumeX className="w-4 h-4 text-[#9AAFC2]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#43D9F5]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              toggleMinimap();
              soundManager.playClick();
            }}
            aria-label="Open Island Map"
            title="Island Map [M]"
            className="p-2 rounded-lg text-[#9AAFC2] hover:text-[#43D9F5] hover:bg-[#14263A] transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveModal('achievements');
              soundManager.playClick();
            }}
            aria-label="Open Achievements"
            title="Achievements"
            className="p-2 rounded-lg text-[#F5B84B] hover:bg-[#14263A] transition-colors cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setSettingsOpen((v) => !v);
              soundManager.playClick();
            }}
            aria-label="Open Settings"
            aria-expanded={settingsOpen}
            title="Settings & Vehicle Paint"
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              settingsOpen
                ? 'bg-[#1B3045] text-[#43D9F5]'
                : 'text-[#9AAFC2] hover:text-[#F4F7FA] hover:bg-[#14263A]'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          {settingsOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-[#0B1420]/96 border border-white/10 shadow-2xl p-3 space-y-3 z-40">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AAFC2] mb-1.5">
                  Graphics Quality
                </div>
                <div className="grid grid-cols-3 gap-1 bg-[#14263A] p-1 rounded-lg border border-white/10">
                  {QUALITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setQualityLevel(opt.id);
                        soundManager.playClick();
                      }}
                      className={`py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        qualityLevel === opt.id
                          ? 'bg-[#43D9F5] text-[#0B1420] font-semibold'
                          : 'text-[#9AAFC2] hover:text-[#F4F7FA]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AAFC2] mb-1.5">
                  Atmosphere
                </div>
                <div className="grid grid-cols-4 gap-1 bg-[#14263A] p-1 rounded-lg border border-white/10">
                  {DAY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setDayMode(opt.id);
                        soundManager.playClick();
                      }}
                      className={`py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        dayMode === opt.id
                          ? 'bg-[#43D9F5] text-[#0B1420] font-semibold'
                          : 'text-[#9AAFC2] hover:text-[#F4F7FA]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#9AAFC2] mb-1.5">
                  Vehicle Paint
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PAINT_OPTIONS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      title={p.label}
                      aria-label={`Paint ${p.label}`}
                      onClick={() => {
                        setVehiclePaint(p.id);
                        soundManager.playClick();
                      }}
                      className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                        vehiclePaint === p.id
                          ? 'border-[#F4F7FA] scale-110'
                          : 'border-white/15 hover:scale-105'
                      }`}
                      style={{ backgroundColor: p.color }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    resetCar();
                    setSettingsOpen(false);
                    soundManager.playClick();
                  }}
                  className="w-full px-2.5 py-2 rounded-lg text-xs text-[#F4F7FA] hover:bg-[#14263A] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-[#43D9F5]" /> Respawn Vehicle
                  </span>
                  <kbd className="font-mono text-[10px] text-[#9AAFC2]">R</kbd>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    togglePerfPanel();
                    setSettingsOpen(false);
                  }}
                  className="w-full px-2.5 py-2 rounded-lg text-xs text-[#F4F7FA] hover:bg-[#14263A] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-[#F5B84B]" />
                    {showPerfPanel ? 'Hide Perf Stats' : 'Show Perf Stats'}
                  </span>
                  <kbd className="font-mono text-[10px] text-[#9AAFC2]">P</kbd>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});
