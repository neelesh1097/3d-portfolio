import { create } from 'zustand';
import { ACHIEVEMENTS, ZONES, PROJECTS, COLLECTIBLES } from '../data/portfolio';
import { Achievement, Project, ZoneId } from '../types';

interface ControlsState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  boost: boolean;
  jump: boolean;
  handbrake: boolean;
}

interface AppStore {
  // Loading & Onboarding
  isLoading: boolean;
  loadingProgress: number;
  hasStarted: boolean;
  is2DView: boolean;

  // Audio
  isSoundMuted: boolean;

  // Car & Camera State
  carPosition: [number, number, number];
  carRotation: number;
  carSpeed: number;
  isBoosting: boolean;
  shouldResetCar: boolean;
  teleportTarget: [number, number, number] | null;
  controls: ControlsState;

  // World & Zones
  activeZone: ZoneId | null;
  approachedZone: ZoneId | null;
  visitedZones: string[];
  
  // UI & Modals
  activeModal: 'about' | 'skills' | 'projects' | 'experience' | 'education' | 'contact' | 'map' | 'achievements' | 'help' | null;
  selectedProject: Project | null;
  isMinimapOpen: boolean;

  // Gamification: Achievements & Collectibles
  achievements: Achievement[];
  recentAchievement: Achievement | null;
  collectibles: Record<string, boolean>;
  score: number;

  // Setters & Actions
  setLoadingProgress: (progress: number) => void;
  startExperience: () => void;
  toggleSound: () => void;
  toggle2DView: () => void;
  setCarState: (pos: [number, number, number], rot: number, speed: number, boosting: boolean) => void;
  setControls: (controls: Partial<ControlsState>) => void;
  resetCar: () => void;
  clearResetCar: () => void;
  teleportTo: (pos: [number, number, number], zoneId?: ZoneId) => void;
  clearTeleport: () => void;
  setApproachedZone: (zoneId: ZoneId | null) => void;
  setActiveModal: (modal: AppStore['activeModal']) => void;
  closeModal: () => void;
  openProjectModal: (project: Project) => void;
  toggleMinimap: () => void;
  unlockAchievement: (id: string) => void;
  collectItem: (id: string) => void;
}

// Load persisted achievements and collectibles safely
const loadPersistedAchievements = (): Achievement[] => {
  try {
    const saved = localStorage.getItem('neelesh_portfolio_achievements');
    if (saved) {
      const parsed = JSON.parse(saved);
      return ACHIEVEMENTS.map(a => ({
        ...a,
        unlocked: parsed[a.id]?.unlocked ?? false,
        unlockedAt: parsed[a.id]?.unlockedAt,
      }));
    }
  } catch (e) {
    // ignore
  }
  return ACHIEVEMENTS;
};

const loadPersistedCollectibles = (): Record<string, boolean> => {
  try {
    const saved = localStorage.getItem('neelesh_portfolio_collectibles');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // ignore
  }
  return {};
};

export const useStore = create<AppStore>((set, get) => ({
  isLoading: true,
  loadingProgress: 0,
  hasStarted: false,
  is2DView: false,

  isSoundMuted: true, // Default muted per user instructions

  carPosition: [0, 0.5, 0],
  carRotation: 0,
  carSpeed: 0,
  isBoosting: false,
  shouldResetCar: false,
  teleportTarget: null,
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
  visitedZones: ['spawn'],

  activeModal: null,
  selectedProject: null,
  isMinimapOpen: false,

  achievements: loadPersistedAchievements(),
  recentAchievement: null,
  collectibles: loadPersistedCollectibles(),
  score: 0,

  setLoadingProgress: (progress) => set({ loadingProgress: Math.min(100, Math.round(progress)) }),

  startExperience: () => set({ hasStarted: true, isLoading: false }),

  toggleSound: () => set((state) => ({ isSoundMuted: !state.isSoundMuted })),

  toggle2DView: () => set((state) => ({ is2DView: !state.is2DView })),

  setCarState: (pos, rot, speed, boosting) => set({
    carPosition: pos,
    carRotation: rot,
    carSpeed: speed,
    isBoosting: boosting,
  }),

  setControls: (newControls) => set((state) => ({
    controls: { ...state.controls, ...newControls },
  })),

  resetCar: () => set({ shouldResetCar: true }),

  clearResetCar: () => set({ shouldResetCar: false }),

  teleportTo: (pos, zoneId) => {
    const visited = get().visitedZones;
    const newVisited = zoneId && !visited.includes(zoneId) ? [...visited, zoneId] : visited;
    set({
      teleportTarget: pos,
      activeZone: zoneId || get().activeZone,
      visitedZones: newVisited,
    });

    if (newVisited.length >= ZONES.length) {
      get().unlockAchievement('world_traveler');
    }
  },

  clearTeleport: () => set({ teleportTarget: null }),

  setApproachedZone: (zoneId) => {
    const current = get().approachedZone;
    if (current !== zoneId) {
      set({ approachedZone: zoneId });
      if (zoneId) {
        const visited = get().visitedZones;
        if (!visited.includes(zoneId)) {
          const nextVisited = [...visited, zoneId];
          set({ visitedZones: nextVisited });
          if (nextVisited.length >= ZONES.length) {
            get().unlockAchievement('world_traveler');
          }
        }
      }
    }
  },

  setActiveModal: (modal) => set({ activeModal: modal }),

  closeModal: () => set({ activeModal: null, selectedProject: null }),

  openProjectModal: (project) => {
    set({ selectedProject: project, activeModal: 'projects' });
    get().unlockAchievement('project_curator');
  },

  toggleMinimap: () => set((state) => ({ isMinimapOpen: !state.isMinimapOpen })),

  unlockAchievement: (id: string) => {
    const list = get().achievements;
    const item = list.find((a) => a.id === id);
    if (!item || item.unlocked) return;

    const updated = list.map((a) => (a.id === id ? { ...a, unlocked: true, unlockedAt: Date.now() } : a));
    const newlyUnlocked = updated.find((a) => a.id === id) || null;

    // Persist
    try {
      const saveObj: Record<string, { unlocked: boolean; unlockedAt: number }> = {};
      updated.forEach((a) => {
        if (a.unlocked) saveObj[a.id] = { unlocked: true, unlockedAt: a.unlockedAt || Date.now() };
      });
      localStorage.setItem('neelesh_portfolio_achievements', JSON.stringify(saveObj));
    } catch (e) {
      // ignore
    }

    set((state) => ({
      achievements: updated,
      recentAchievement: newlyUnlocked,
      score: state.score + (newlyUnlocked?.xp || 50),
    }));

    // Auto clear toast after 4s
    setTimeout(() => {
      set((state) => (state.recentAchievement?.id === id ? { recentAchievement: null } : {}));
    }, 4500);
  },

  collectItem: (id: string) => {
    const items = get().collectibles;
    if (items[id]) return;

    const updated = { ...items, [id]: true };
    try {
      localStorage.setItem('neelesh_portfolio_collectibles', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }

    const itemData = COLLECTIBLES.find((c) => c.id === id);
    set((state) => ({
      collectibles: updated,
      score: state.score + (itemData?.points || 100),
    }));

    // If collected all
    if (Object.keys(updated).length >= COLLECTIBLES.length) {
      get().unlockAchievement('gem_collector');
    }
  },
}));
