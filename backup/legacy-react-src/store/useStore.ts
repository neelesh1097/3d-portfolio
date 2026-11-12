import { create } from 'zustand';
import { ACHIEVEMENTS_DATA, ZONES, DEVELOPER_TOKENS } from '../data/portfolio';
import { Achievement, Project, ZoneId } from '../types';
import { engineBridge } from '../engine/engineBridge';
import type { PaintName } from '../engine/World/VisualVehicle';
import type { DayMode } from '../engine/DayCycles';

interface ControlsState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  boost: boolean;
  jump: boolean;
  handbrake: boolean;
}

export type QualityLevel = 'high' | 'medium' | 'low';

export type ModalType =
  | 'about'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'projects'
  | 'experience'
  | 'contact'
  | 'map'
  | 'achievements'
  | null;

interface AppStore {
  isLoading: boolean;
  loadingProgress: number;
  hasStarted: boolean;
  is2DView: boolean;

  isSoundMuted: boolean;
  qualityLevel: QualityLevel;
  vehiclePaint: PaintName;
  dayMode: DayMode;
  showPerfPanel: boolean;

  carSpeed: number;
  isBoosting: boolean;
  nearestSpot: string;
  controlsOpen: boolean;
  controls: ControlsState;

  activeZone: ZoneId | null;
  approachedZone: ZoneId | null;
  guidedZone: ZoneId | null;
  visitedZones: string[];

  activeModal: ModalType;
  selectedProject: Project | null;
  isMinimapOpen: boolean;

  achievements: Achievement[];
  recentAchievement: Achievement | null;
  collectedTokens: Record<string, boolean>;
  score: number;

  setLoadingProgress: (progress: number) => void;
  startExperience: () => void;
  toggleSound: () => void;
  toggle2DView: () => void;
  setQualityLevel: (quality: QualityLevel) => void;
  setVehiclePaint: (paint: PaintName) => void;
  setDayMode: (mode: DayMode) => void;
  togglePerfPanel: () => void;
  setControlsOpen: (open: boolean) => void;
  setHudTelemetry: (speed: number, boosting: boolean, nearestSpot?: string) => void;
  setControls: (controls: Partial<ControlsState>) => void;
  resetCar: () => void;
  teleportTo: (pos: [number, number, number], zoneId?: ZoneId) => void;
  teleportToSpot: (spotName: string) => void;
  setApproachedZone: (zoneId: ZoneId | null) => void;
  setGuidedZone: (zoneId: ZoneId | null) => void;
  setActiveModal: (modal: ModalType) => void;
  closeModal: () => void;
  openProjectModal: (project: Project) => void;
  toggleMinimap: () => void;
  unlockAchievement: (id: string) => void;
  collectToken: (id: string) => void;
  resetProgress: () => void;
}

const loadAchievements = (): Achievement[] => {
  try {
    const saved = localStorage.getItem('fullstack_island_achievements');
    if (saved) {
      const parsed = JSON.parse(saved);
      return ACHIEVEMENTS_DATA.map((a) => ({
        ...a,
        unlocked: parsed[a.id]?.unlocked ?? false,
        unlockedAt: parsed[a.id]?.unlockedAt,
      }));
    }
  } catch {
    // ignore
  }
  return ACHIEVEMENTS_DATA;
};

const loadTokens = (): Record<string, boolean> => {
  try {
    const saved = localStorage.getItem('fullstack_island_tokens');
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return {};
};

const detectInitialQuality = (): QualityLevel => {
  if (typeof window === 'undefined') return 'high';
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency || 8;
  if (cores <= 2) return 'low';
  if (isMobile || cores <= 4) return 'medium';
  return 'high';
};

const initialAchievements = loadAchievements();
const initialTokens = loadTokens();

const computeInitialScore = (achs: Achievement[], tokens: Record<string, boolean>): number => {
  const achXp = achs.reduce((acc, a) => acc + (a.unlocked ? a.xp : 0), 0);
  const tokenXp = DEVELOPER_TOKENS.reduce((acc, t) => acc + (tokens[t.id] ? t.points : 0), 0);
  return achXp + tokenXp;
};

export const useStore = create<AppStore>((set, get) => ({
  isLoading: true,
  loadingProgress: 0,
  hasStarted: false,
  is2DView: false,

  isSoundMuted: true,
  qualityLevel: detectInitialQuality(),
  vehiclePaint: 'cyan',
  dayMode: 'day',
  showPerfPanel: false,

  carSpeed: 0,
  isBoosting: false,
  nearestSpot: 'Spawn Hub (Neelesh)',
  controlsOpen: false,
  controls: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    boost: false,
    jump: false,
    handbrake: false,
  },

  activeZone: 'spawn',
  approachedZone: null,
  guidedZone: null,
  visitedZones: ['spawn'],

  activeModal: null,
  selectedProject: null,
  isMinimapOpen: false,

  achievements: initialAchievements,
  recentAchievement: null,
  collectedTokens: initialTokens,
  score: computeInitialScore(initialAchievements, initialTokens),

  setLoadingProgress: (progress) =>
    set({
      loadingProgress: Math.min(100, Math.round(progress)),
      isLoading: progress < 100,
    }),

  startExperience: () => set({ hasStarted: true, isLoading: false }),

  toggleSound: () => set((state) => ({ isSoundMuted: !state.isSoundMuted })),

  toggle2DView: () => set((state) => ({ is2DView: !state.is2DView })),

  setQualityLevel: (qualityLevel) => {
    engineBridge.getGame()?.setQuality(qualityLevel);
    set({ qualityLevel });
  },

  setVehiclePaint: (vehiclePaint) => {
    engineBridge.getGame()?.setPaint(vehiclePaint);
    set({ vehiclePaint });
  },

  setDayMode: (dayMode) => {
    engineBridge.getGame()?.setDayMode(dayMode);
    set({ dayMode });
  },

  togglePerfPanel: () => set((state) => ({ showPerfPanel: !state.showPerfPanel })),

  setControlsOpen: (controlsOpen) => set({ controlsOpen }),

  setHudTelemetry: (speed, boosting, nearestSpot) => {
    const state = get();
    if (
      state.carSpeed !== speed ||
      state.isBoosting !== boosting ||
      (nearestSpot && state.nearestSpot !== nearestSpot)
    ) {
      set({
        carSpeed: speed,
        isBoosting: boosting,
        ...(nearestSpot ? { nearestSpot } : {}),
      });
    }
  },

  setControls: (newControls) => {
    engineBridge.getGame()?.inputs.setVirtualControls(newControls as Record<string, boolean>);
    set((state) => ({ controls: { ...state.controls, ...newControls } }));
  },

  resetCar: () => {
    engineBridge.getGame()?.resetVehicle();
  },

  teleportTo: (pos, zoneId) => {
    engineBridge.getGame()?.teleportTo(pos[0], pos[2]);
    const visited = get().visitedZones;
    const newVisited = zoneId && !visited.includes(zoneId) ? [...visited, zoneId] : visited;
    set({
      activeZone: zoneId || get().activeZone,
      visitedZones: newVisited,
    });
  },

  teleportToSpot: (spotName) => {
    engineBridge.getGame()?.teleportToName(spotName);
  },

  setApproachedZone: (zoneId) => {
    const current = get().approachedZone;
    if (current !== zoneId) {
      const clearGuide = zoneId && get().guidedZone === zoneId ? { guidedZone: null } : {};
      set({ approachedZone: zoneId, ...clearGuide });
      if (zoneId && zoneId !== 'spawn') {
        const visited = get().visitedZones;
        if (!visited.includes(zoneId)) {
          const nextVisited = [...visited, zoneId];
          set({ visitedZones: nextVisited });
          if (nextVisited.length >= ZONES.length - 1) {
            get().unlockAchievement('island_explorer');
          }
        }
      }
    }
  },

  setGuidedZone: (guidedZone) => set({ guidedZone }),

  setActiveModal: (modal) => {
    engineBridge.getGame()?.inputs.setModalPaused(Boolean(modal || get().isMinimapOpen));
    set({ activeModal: modal });
  },

  closeModal: () => {
    engineBridge.getGame()?.inputs.setModalPaused(get().isMinimapOpen);
    set({ activeModal: null, selectedProject: null });
  },

  openProjectModal: (project) => {
    engineBridge.getGame()?.inputs.setModalPaused(true);
    set({ selectedProject: project, activeModal: 'projects' });
    get().unlockAchievement('project_collector');
  },

  toggleMinimap: () =>
    set((state) => {
      const next = !state.isMinimapOpen;
      engineBridge.getGame()?.inputs.setModalPaused(Boolean(next || state.activeModal));
      return { isMinimapOpen: next };
    }),

  unlockAchievement: (id: string) => {
    const list = get().achievements;
    const item = list.find((a) => a.id === id);
    if (!item || item.unlocked) return;

    const updated = list.map((a) =>
      a.id === id ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
    );
    const newlyUnlocked = updated.find((a) => a.id === id) || null;

    try {
      const saveObj: Record<string, { unlocked: boolean; unlockedAt: number }> = {};
      updated.forEach((a) => {
        if (a.unlocked) saveObj[a.id] = { unlocked: true, unlockedAt: a.unlockedAt || Date.now() };
      });
      localStorage.setItem('fullstack_island_achievements', JSON.stringify(saveObj));
    } catch {
      // ignore
    }

    set((state) => ({
      achievements: updated,
      recentAchievement: newlyUnlocked,
      score: state.score + (newlyUnlocked?.xp || 50),
    }));

    setTimeout(() => {
      set((state) => (state.recentAchievement?.id === id ? { recentAchievement: null } : {}));
    }, 4500);
  },

  collectToken: (id: string) => {
    const items = get().collectedTokens;
    if (items[id]) return;

    const updated = { ...items, [id]: true };
    try {
      localStorage.setItem('fullstack_island_tokens', JSON.stringify(updated));
    } catch {
      // ignore
    }

    const tokenData = DEVELOPER_TOKENS.find((t) => t.id === id);
    set((state) => ({
      collectedTokens: updated,
      score: state.score + (tokenData?.points || 100),
    }));

    if (Object.keys(updated).length >= DEVELOPER_TOKENS.length) {
      get().unlockAchievement('token_hunter');
    }
  },

  resetProgress: () => {
    try {
      localStorage.removeItem('fullstack_island_achievements');
      localStorage.removeItem('fullstack_island_tokens');
    } catch {
      // ignore
    }
    set({
      achievements: ACHIEVEMENTS_DATA.map((a) => ({ ...a, unlocked: false, unlockedAt: undefined })),
      collectedTokens: {},
      visitedZones: ['spawn'],
      recentAchievement: null,
      score: 0,
    });
  },
}));
