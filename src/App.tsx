import React from 'react';
import { useKeyboard } from './hooks/useKeyboard';
import { Scene } from './world/Scene';
import { LoadingScreen } from './components/LoadingScreen';
import { MainUI } from './components/MainUI';
import { MobileControls } from './components/MobileControls';
import { AchievementToast } from './components/AchievementToast';
import { ProjectModal } from './components/Modals/ProjectModal';
import { AboutModal } from './components/Modals/AboutModal';
import { SkillsModal } from './components/Modals/SkillsModal';
import { ExperienceModal } from './components/Modals/ExperienceModal';
import { EducationModal } from './components/Modals/EducationModal';
import { ContactModal } from './components/Modals/ContactModal';
import { AchievementsModal } from './components/Modals/AchievementsModal';
import { MinimapModal } from './components/Modals/MinimapModal';
import { Fallback2D } from './components/Fallback2D';

export const App: React.FC = () => {
  // Listen to keyboard controls (WASD, R, H, M, E, Shift, Space)
  useKeyboard();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#67e8f9] font-sans select-none">
      {/* 3D WebGL Canvas */}
      <Scene />

      {/* Primary User Interface & HUD */}
      <MainUI />

      {/* On-Screen Mobile Joystick & Buttons */}
      <MobileControls />

      {/* Gamification Notification Toasts */}
      <AchievementToast />

      {/* Modals & Dialogs */}
      <ProjectModal />
      <AboutModal />
      <SkillsModal />
      <ExperienceModal />
      <EducationModal />
      <ContactModal />
      <AchievementsModal />
      <MinimapModal />

      {/* Initial Loading Screen */}
      <LoadingScreen />

      {/* Accessible 2D Fallback View */}
      <Fallback2D />
    </div>
  );
};

export default App;

