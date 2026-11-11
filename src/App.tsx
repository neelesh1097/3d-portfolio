import React, { Suspense, lazy } from 'react';
import { useKeyboard } from './hooks/useKeyboard';
import { Scene } from './world/Scene';
import { LoadingScreen } from './components/LoadingScreen';
import { MainUI } from './components/MainUI';
import { MobileControls } from './components/MobileControls';
import { AchievementToast } from './components/AchievementToast';
import { PerfMonitor } from './components/PerfMonitor';

const ProjectModal = lazy(() =>
  import('./components/Modals/ProjectModal').then((m) => ({ default: m.ProjectModal }))
);
const AboutModal = lazy(() =>
  import('./components/Modals/AboutModal').then((m) => ({ default: m.AboutModal }))
);
const TechModal = lazy(() =>
  import('./components/Modals/TechModal').then((m) => ({ default: m.TechModal }))
);
const ExperienceModal = lazy(() =>
  import('./components/Modals/ExperienceModal').then((m) => ({ default: m.ExperienceModal }))
);
const ContactModal = lazy(() =>
  import('./components/Modals/ContactModal').then((m) => ({ default: m.ContactModal }))
);
const AchievementsModal = lazy(() =>
  import('./components/Modals/AchievementsModal').then((m) => ({ default: m.AchievementsModal }))
);
const MinimapModal = lazy(() =>
  import('./components/Modals/MinimapModal').then((m) => ({ default: m.MinimapModal }))
);
const Fallback2D = lazy(() =>
  import('./components/Fallback2D').then((m) => ({ default: m.Fallback2D }))
);

export const App: React.FC = () => {
  useKeyboard();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#67e8f9] font-sans select-none">
      {/* 3D WebGL Canvas */}
      <Scene />

      {/* Primary UI HUD */}
      <MainUI />

      {/* Mobile Touch Controls */}
      <MobileControls />

      {/* Achievement Popups */}
      <AchievementToast />

      {/* Lazy-Loaded Modals & 2D Portfolio */}
      <Suspense fallback={null}>
        <ProjectModal />
        <AboutModal />
        <TechModal />
        <ExperienceModal />
        <ContactModal />
        <AchievementsModal />
        <MinimapModal />
        <Fallback2D />
      </Suspense>

      {/* Developer Performance Monitor (dev mode / [P]) */}
      <PerfMonitor />

      {/* Loading Experience */}
      <LoadingScreen />
    </div>
  );
};

export default App;
