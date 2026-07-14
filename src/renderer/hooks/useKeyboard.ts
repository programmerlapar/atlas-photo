import { useEffect, useCallback } from 'react';

export interface KeyboardShortcuts {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onSpace?: () => void;
  onKeyF?: () => void;
  onSlash?: () => void;
  onCtrlA?: (e: KeyboardEvent) => void;
}

/**
 * Hook for handling keyboard navigation
 */
export const useKeyboard = (
  shortcuts: KeyboardShortcuts,
  enabled: boolean = true
) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement).isContentEditable
      ) {
        // Allow / to focus search even when typing
        if (event.key === '/' && shortcuts.onSlash) {
          event.preventDefault();
          shortcuts.onSlash();
        }
        return;
      }

      switch (event.key) {
        case 'ArrowUp':
          if (shortcuts.onArrowUp) {
            event.preventDefault();
            shortcuts.onArrowUp();
          }
          break;
        case 'ArrowDown':
          if (shortcuts.onArrowDown) {
            event.preventDefault();
            shortcuts.onArrowDown();
          }
          break;
        case 'ArrowLeft':
          if (shortcuts.onArrowLeft) {
            event.preventDefault();
            shortcuts.onArrowLeft();
          }
          break;
        case 'ArrowRight':
          if (shortcuts.onArrowRight) {
            event.preventDefault();
            shortcuts.onArrowRight();
          }
          break;
        case 'Enter':
          if (shortcuts.onEnter) {
            event.preventDefault();
            shortcuts.onEnter();
          }
          break;
        case 'Escape':
          if (shortcuts.onEscape) {
            event.preventDefault();
            shortcuts.onEscape();
          }
          break;
        case ' ':
          if (shortcuts.onSpace) {
            event.preventDefault();
            shortcuts.onSpace();
          }
          break;
        case 'f':
        case 'F':
          if (shortcuts.onKeyF) {
            event.preventDefault();
            shortcuts.onKeyF();
          }
          break;
        case '/':
          if (shortcuts.onSlash) {
            event.preventDefault();
            shortcuts.onSlash();
          }
          break;
        case 'a':
        case 'A':
          if ((event.ctrlKey || event.metaKey) && shortcuts.onCtrlA) {
            shortcuts.onCtrlA(event);
          }
          break;
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, enabled]);
};
