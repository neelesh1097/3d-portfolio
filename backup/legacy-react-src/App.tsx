import React, { Suspense, lazy } from 'react';
import { useKeyboard } from './hooks/useKeyboard';
import { Scene } from './world/Scene';
import { LoadingScreen } from './components/LoadingScreen';
import { MainUI } from './components/MainUI';
import { MobileControls } from './components/MobileControls';
import { AchievementToast } from './components/AchievementToast';
import { PerfMonitor } from './components/PerfMonitor';

const AchievementsModal = lazy(() =>
  import('./components/Modals/AchievementsModal').then((m) => ({ default: m.AchievementsModal }))
);
const MinimapModal = lazy(() =>
  import('./components/Modals/MinimapModal').then((m) => ({ default: m.MinimapModal }))
);

export const App: React.FC = () => {
  useKeyboard();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#67e8f9] font-sans select-none">
      <Scene />
      <MainUI />
      <MobileControls />
      <AchievementToast />

      <Suspense fallback={null}>
        <AchievementsModal />
        <MinimapModal />
      </Suspense>

      <PerfMonitor />
      <LoadingScreen />
    </div>
  );
};

export default App;
