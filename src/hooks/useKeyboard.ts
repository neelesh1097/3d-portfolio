import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { soundManager } from '../utils/audio';

const blurFocusedControl = () => {
  const active = document.activeElement as HTMLElement | null;
  if (active && active.tagName === 'BUTTON') {
    active.blur();
  }
};

const isTypingTarget = (target: EventTarget | null): boolean => {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
};

export const useKeyboard = () => {
  useEffect(() => {
    const clearMovementControls = () => {
      useStore.getState().setControls({
        forward: false,
        backward: false,
        left: false,
        right: false,
        boost: false,
        jump: false,
        handbrake: false,
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      const {
        setControls,
        resetCar,
        approachedZone,
        activeModal,
        isMinimapOpen,
        setActiveModal,
        closeModal,
        toggleMinimap,
        togglePerfPanel,
        unlockAchievement,
      } = useStore.getState();

      const code = e.code;
      const key = e.key ? e.key.toLowerCase() : '';

      if (code === 'KeyW' || code === 'ArrowUp' || key === 'w' || key === 'arrowup') {
        if (code === 'ArrowUp' || key === 'arrowup') e.preventDefault();
        blurFocusedControl();
        setControls({ forward: true });
        if (!e.repeat) unlockAchievement('first_drive');
        return;
      }

      if (code === 'KeyS' || code === 'ArrowDown' || key === 's' || key === 'arrowdown') {
        if (code === 'ArrowDown' || key === 'arrowdown') e.preventDefault();
        blurFocusedControl();
        setControls({ backward: true });
        if (!e.repeat) unlockAchievement('first_drive');
        return;
      }

      if (code === 'KeyA' || code === 'ArrowLeft' || key === 'a' || key === 'arrowleft') {
        if (code === 'ArrowLeft' || key === 'arrowleft') e.preventDefault();
        blurFocusedControl();
        setControls({ left: true });
        return;
      }

      if (code === 'KeyD' || code === 'ArrowRight' || key === 'd' || key === 'arrowright') {
        if (code === 'ArrowRight' || key === 'arrowright') e.preventDefault();
        blurFocusedControl();
        setControls({ right: true });
        return;
      }

      if (code === 'ShiftLeft' || code === 'ShiftRight' || key === 'shift') {
        setControls({ boost: true });
        if (!e.repeat) {
          soundManager.playBoost();
          unlockAchievement('nitro_boost');
        }
        return;
      }

      if (code === 'Space' || key === ' ') {
        e.preventDefault();
        blurFocusedControl();
        setControls({ jump: true });
        if (!e.repeat) soundManager.playJump();
        return;
      }

      if ((code === 'KeyR' || key === 'r') && !e.repeat) {
        resetCar();
        soundManager.playClick();
        return;
      }

      if ((code === 'KeyH' || key === 'h') && !e.repeat) {
        soundManager.playHorn();
        return;
      }

      if ((code === 'KeyM' || key === 'm') && !e.repeat) {
        toggleMinimap();
        soundManager.playClick();
        return;
      }

      if ((code === 'KeyP' || key === 'p') && !e.repeat && import.meta.env.DEV) {
        togglePerfPanel();
        return;
      }

      if ((code === 'KeyE' || code === 'Enter' || key === 'e') && !e.repeat) {
        if (isMinimapOpen) {
          toggleMinimap();
          soundManager.playClick();
        } else if (activeModal) {
          closeModal();
          soundManager.playClick();
        } else if (approachedZone && approachedZone !== 'spawn') {
          setActiveModal(approachedZone as any);
          soundManager.playClick();
        }
        return;
      }

      if (code === 'Escape' || key === 'escape') {
        if (isMinimapOpen) {
          toggleMinimap();
          soundManager.playClick();
        } else if (activeModal) {
          closeModal();
          soundManager.playClick();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      const { setControls } = useStore.getState();
      const code = e.code;
      const key = e.key ? e.key.toLowerCase() : '';

      if (code === 'KeyW' || code === 'ArrowUp' || key === 'w' || key === 'arrowup') {
        setControls({ forward: false });
      } else if (code === 'KeyS' || code === 'ArrowDown' || key === 's' || key === 'arrowdown') {
        setControls({ backward: false });
      } else if (code === 'KeyA' || code === 'ArrowLeft' || key === 'a' || key === 'arrowleft') {
        setControls({ left: false });
      } else if (code === 'KeyD' || code === 'ArrowRight' || key === 'd' || key === 'arrowright') {
        setControls({ right: false });
      } else if (code === 'ShiftLeft' || code === 'ShiftRight' || key === 'shift') {
        setControls({ boost: false });
      } else if (code === 'Space' || key === ' ') {
        setControls({ jump: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    window.addEventListener('blur', clearMovementControls);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
      window.removeEventListener('blur', clearMovementControls);
    };
  }, []);
};
