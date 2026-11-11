import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { soundManager } from '../utils/audio';

export const useKeyboard = () => {
  const {
    setControls,
    resetCar,
    approachedZone,
    activeModal,
    setActiveModal,
    closeModal,
    toggleMinimap,
    unlockAchievement,
  } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if typing in form input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setControls({ forward: true });
          unlockAchievement('first_drive');
          break;
        case 'KeyS':
        case 'ArrowDown':
          setControls({ backward: true });
          unlockAchievement('first_drive');
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setControls({ left: true });
          break;
        case 'KeyD':
        case 'ArrowRight':
          setControls({ right: true });
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setControls({ boost: true });
          soundManager.playBoost();
          unlockAchievement('nitro_boost');
          break;
        case 'Space':
          e.preventDefault();
          setControls({ jump: true });
          soundManager.playJump();
          break;
        case 'KeyR':
          resetCar();
          soundManager.playClick();
          break;
        case 'KeyH':
          soundManager.playHorn();
          break;
        case 'KeyM':
          toggleMinimap();
          soundManager.playClick();
          break;
        case 'KeyE':
        case 'Enter':
          if (activeModal) {
            closeModal();
            soundManager.playClick();
          } else if (approachedZone) {
            setActiveModal(approachedZone as any);
            soundManager.playClick();
          }
          break;
        case 'Escape':
          if (activeModal) {
            closeModal();
            soundManager.playClick();
          }
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setControls({ forward: false });
          break;
        case 'KeyS':
        case 'ArrowDown':
          setControls({ backward: false });
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setControls({ left: false });
          break;
        case 'KeyD':
        case 'ArrowRight':
          setControls({ right: false });
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setControls({ boost: false });
          break;
        case 'Space':
          setControls({ jump: false });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setControls, resetCar, approachedZone, activeModal, setActiveModal, closeModal, toggleMinimap, unlockAchievement]);
};

