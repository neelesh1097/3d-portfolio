import React, { useState, useRef, useEffect } from 'react';
import { useStore, QualityLevel } from '../store/useStore';
import { ZONES } from '../data/portfolio';
import { ZoneId } from '../types';
import {
  Volume2,
  VolumeX,
  Compass,
  Trophy,
  Settings,
  RotateCcw,
  Monitor,
  ChevronDown,
  Menu,
  X,
  Activity,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { ZoneIcon } from './ZoneIcon';

const TECH_SUBMENU: Array<{ id: ZoneId; label: string; desc: string }> = [
  { id: 'frontend', label: 'Frontend City', desc: 'React, TypeScript & WebGL' },
  { id: 'backend', label: 'Backend Lab', desc: 'Node.js, APIs & Auth' },
  { id: 'database', label: 'Database Hub', desc: 'PostgreSQL, Mongo & Redis' },
  { id: 'devops', label: 'Cloud & DevOps', desc: 'Docker, CI/CD & AWS' },
];

const QUALITY_OPTIONS: Array<{ id: QualityLevel; label: string }> = [
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];

export const UIHeader: React.FC = React.memo(() => {
  const isSoundMuted = useStore((s) => s.isSoundMuted);
  const toggleSound = useStore((s) => s.toggleSound);
  const teleportTo = useStore((s) => s.teleportTo);
  const activeZone = useStore((s) => s.activeZone);
  const approachedZone = useStore((s) => s.approachedZone);
  const activeModal = useStore((s) => s.activeModal);
  const setActiveModal = useStore((s) => s.setActiveModal);
  const toggleMinimap = useStore((s) => s.toggleMinimap);
  const resetCar = useStore((s) => s.resetCar);
  const achievements = useStore((s) => s.achievements);
  const toggle2DView = useStore((s) => s.toggle2DView);
  const qualityLevel = useStore((s) => s.qualityLevel);
  const setQualityLevel = useStore((s) => s.setQualityLevel);
  const showPerfPanel = useStore((s) => s.showPerfPanel);
  const togglePerfPanel = useStore((s) => s.togglePerfPanel);

  const [techOpen, setTechOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setTechOpen(false);
        setSettingsOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const currentZone = activeModal || approachedZone || activeZone;
  const isTechActive = ['frontend', 'backend', 'database', 'devops'].includes(currentZone || '');

  const navigateToZone = (zoneId: ZoneId) => {
    const zone = ZONES.find((z) => z.id === zoneId);
    if (zone) {
      teleportTo(zone.position, zone.id);
    }
    if (zoneId !== 'spawn') {
      setActiveModal(zoneId as any);
    }
    setTechOpen(false);
    setMobileMenuOpen(false);
    soundManager.playClick();
  };

  return (
    <header ref={headerRef} className="pointer-events-auto w-full max-w-7xl mx-auto relative">
      <div className="flex items-center justify-between gap-3">
        {/* LEFT: Monogram, Name, Title & Achievement Level Indicator */}
        <button
          type="button"
          onClick={() => {
            teleportTo([0, 0, 0], 'spawn');
            soundManager.playClick();
          }}
          title="Return to Central Hub"
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
              Full Stack Developer
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 ml-1 pl-2.5 border-l border-white/10 font-mono text-xs font-semibold text-[#F5B84B]">
            <Trophy className="w-3.5 h-3.5" />
            <span>
              {unlockedCount}/{achievements.length}
            </span>
          </div>
        </button>

        {/* CENTER: Floating Portfolio Navigation (Desktop >= lg) */}
        <nav
          aria-label="Primary portfolio navigation"
          className="hidden lg:flex items-center gap-1 hud-surface rounded-xl p-1 relative"
        >
          <button
            type="button"
            onClick={() => navigateToZone('about')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              currentZone === 'about'
                ? 'bg-[#1B3045] text-[#43D9F5] border border-[#43D9F5]/30'
                : 'text-[#9AAFC2] hover:text-[#F4F7FA] hover:bg-[#14263A]/60 border border-transparent'
            }`}
          >
            About Me
          </button>

          {/* Tech Stack Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setTechOpen((v) => !v);
                setSettingsOpen(false);
                soundManager.playClick();
              }}
              aria-expanded={techOpen}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                isTechActive || techOpen
                  ? 'bg-[#1B3045] text-[#43D9F5] border border-[#43D9F5]/30'
                  : 'text-[#9AAFC2] hover:text-[#F4F7FA] hover:bg-[#14263A]/60 border border-transparent'
              }`}
            >
              <span>Tech Stack</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${techOpen ? 'rotate-180' : ''}`} />
            </button>

            {techOpen && (
              <div className="absolute left-0 top-full mt-2 w-60 rounded-xl bg-[#0B1420]/96 border border-white/10 shadow-2xl p-1.5 z-40">
                {TECH_SUBMENU.map((item) => {
                  const zone = ZONES.find((z) => z.id === item.id);
                  const active = currentZone === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigateToZone(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#1B3045] text-[#43D9F5]'
                          : 'text-[#F4F7FA] hover:bg-[#14263A]'
                      }`}
                    >
                      <span className="w-7 h-7 rounded-lg bg-[#14263A] border border-white/10 flex items-center justify-center text-[#43D9F5] shrink-0">
                        <ZoneIcon name={zone?.icon || 'Layout'} size={14} />
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold leading-tight">{item.label}</div>
                        <div className="text-[11px] text-[#9AAFC2] truncate">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigateToZone('projects')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              currentZone === 'projects'
                ? 'bg-[#1B3045] text-[#43D9F5] border border-[#43D9F5]/30'
                : 'text-[#9AAFC2] hover:text-[#F4F7FA] hover:bg-[#14263A]/60 border border-transparent'
            }`}
          >
            Projects
          </button>

          <button
            type="button"
            onClick={() => navigateToZone('experience')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              currentZone === 'experience'
                ? 'bg-[#1B3045] text-[#43D9F5] border border-[#43D9F5]/30'
                : 'text-[#9AAFC2] hover:text-[#F4F7FA] hover:bg-[#14263A]/60 border border-transparent'
            }`}
          >
            Experience
          </button>

          <button
            type="button"
            onClick={() => navigateToZone('contact')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              currentZone === 'contact'
                ? 'bg-[#1B3045] text-[#43D9F5] border border-[#43D9F5]/30'
                : 'text-[#9AAFC2] hover:text-[#F4F7FA] hover:bg-[#14263A]/60 border border-transparent'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* RIGHT: Sound, Map, Achievements, Settings, Mobile Menu */}
        <div className="hud-surface rounded-xl p-1 flex items-center gap-1 relative">
          <button
            type="button"
            onClick={() => {
              toggleSound();
              soundManager.setMuted(!isSoundMuted);
            }}
            aria-label={isSoundMuted ? 'Unmute sound' : 'Mute sound'}
            title={isSoundMuted ? 'Unmute Sound' : 'Mute Sound'}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              !isSoundMuted
                ? 'bg-[#1B3045] text-[#43D9F5]'
                : 'text-[#9AAFC2] hover:text-[#F4F7FA] hover:bg-[#14263A]'
            }`}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => {
              toggleMinimap();
              setTechOpen(false);
              setSettingsOpen(false);
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
              setTechOpen(false);
              setSettingsOpen(false);
              soundManager.playClick();
            }}
            aria-label="Open Achievements"
            title="Achievements"
            className="p-2 rounded-lg text-[#F5B84B] hover:bg-[#14263A] transition-colors cursor-pointer relative"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setSettingsOpen((v) => !v);
              setTechOpen(false);
              soundManager.playClick();
            }}
            aria-label="Open Settings"
            aria-expanded={settingsOpen}
            title="Settings & Quality"
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              settingsOpen
                ? 'bg-[#1B3045] text-[#43D9F5]'
                : 'text-[#9AAFC2] hover:text-[#F4F7FA] hover:bg-[#14263A]'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen((v) => !v);
              setSettingsOpen(false);
              soundManager.playClick();
            }}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 rounded-lg text-[#F4F7FA] hover:bg-[#14263A] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Settings Popover */}
          {settingsOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-xl bg-[#0B1420]/96 border border-white/10 shadow-2xl p-3 space-y-3 z-40">
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
                    toggle2DView();
                    setSettingsOpen(false);
                    soundManager.playClick();
                  }}
                  className="w-full px-2.5 py-2 rounded-lg text-xs text-[#F4F7FA] hover:bg-[#14263A] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Monitor className="w-3.5 h-3.5 text-[#43D9F5]" /> Switch to 2D Portfolio
                </button>

                {import.meta.env.DEV && (
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
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile / Tablet Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 rounded-xl bg-[#0B1420]/96 border border-white/10 shadow-2xl p-3 space-y-2 z-40">
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'about' as ZoneId, label: 'About Me' },
              { id: 'projects' as ZoneId, label: 'Projects' },
              { id: 'experience' as ZoneId, label: 'Experience' },
              { id: 'contact' as ZoneId, label: 'Contact' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateToZone(item.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                  currentZone === item.id
                    ? 'bg-[#1B3045] text-[#43D9F5] border border-[#43D9F5]/30'
                    : 'bg-[#14263A]/60 text-[#F4F7FA] border border-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#9AAFC2] mb-1.5">
              Tech Stack Zones
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {TECH_SUBMENU.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateToZone(item.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                    currentZone === item.id
                      ? 'bg-[#1B3045] text-[#43D9F5] border border-[#43D9F5]/30'
                      : 'bg-[#14263A]/40 text-[#9AAFC2] hover:text-[#F4F7FA] border border-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
});
