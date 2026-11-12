import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { soundManager } from '../utils/audio';

const isTypingTarget = (target: EventTarget | null): boolean => {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
};

export const useKeyboard = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      const {
        approachedZone,
        activeModal,
        isMinimapOpen,
        setActiveModal,
        closeModal,
        toggleMinimap,
        togglePerfPanel,
      } = useStore.getState();

      const code = e.code;
      const key = e.key ? e.key.toLowerCase() : '';

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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
