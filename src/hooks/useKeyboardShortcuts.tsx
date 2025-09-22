import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onSeekForward?: () => void;
  onSeekBackward?: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onPlayPause,
  onNext,
  onPrevious,
  onVolumeUp,
  onVolumeDown,
  onSeekForward,
  onSeekBackward,
  enabled = true,
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }

      // Prevent default behavior for our shortcuts
      const shortcuts = [
        'Space',
        'ArrowRight',
        'ArrowLeft',
        'ArrowUp',
        'ArrowDown',
        'KeyJ',
        'KeyK',
        'KeyL',
        'KeyF',
      ];

      if (shortcuts.includes(event.code)) {
        event.preventDefault();
      }

      switch (event.code) {
        case 'Space': // Play/Pause
          onPlayPause?.();
          break;
        case 'ArrowRight': // Next track
          if (event.shiftKey) {
            onSeekForward?.(); // Seek forward 10s with Shift+Right
          } else {
            onNext?.();
          }
          break;
        case 'ArrowLeft': // Previous track
          if (event.shiftKey) {
            onSeekBackward?.(); // Seek backward 10s with Shift+Left
          } else {
            onPrevious?.();
          }
          break;
        case 'ArrowUp': // Volume up
          onVolumeUp?.();
          break;
        case 'ArrowDown': // Volume down
          onVolumeDown?.();
          break;
        case 'KeyJ': // Seek backward 10s
          onSeekBackward?.();
          break;
        case 'KeyL': // Seek forward 10s
          onSeekForward?.();
          break;
        case 'KeyK': // Play/Pause (alternative)
          onPlayPause?.();
          break;
        case 'KeyF': // Toggle fullscreen player (could be implemented later)
          // onToggleFullscreen?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    onPlayPause,
    onNext,
    onPrevious,
    onVolumeUp,
    onVolumeDown,
    onSeekForward,
    onSeekBackward,
  ]);

  // Return the shortcuts for display in UI
  const shortcuts = {
    playPause: ['Space', 'K'],
    next: ['→'],
    previous: ['←'],
    volumeUp: ['↑'],
    volumeDown: ['↓'],
    seekForward: ['L', 'Shift + →'],
    seekBackward: ['J', 'Shift + ←'],
  };

  return { shortcuts };
};