import { useEffect, useCallback } from 'react';

interface KeyboardShortcutHandlers {
  onFetchTranscript?: () => void;
  onProcessTranscript?: () => void;
  onCopyOriginal?: () => void;
  onCopyFormatted?: () => void;
  onSwitchTab?: (tab: 'original' | 'formatted') => void;
}

export function useKeyboardShortcuts({
  onFetchTranscript,
  onProcessTranscript,
  onCopyOriginal,
  onCopyFormatted,
  onSwitchTab,
}: KeyboardShortcutHandlers) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifierKey = isMac ? event.metaKey : event.ctrlKey;

    // Fetch transcript: Ctrl/Cmd + Enter
    if (modifierKey && event.key === 'Enter' && onFetchTranscript) {
      event.preventDefault();
      onFetchTranscript();
    }

    // Process transcript: Ctrl/Cmd + P
    if (modifierKey && event.key === 'p' && onProcessTranscript) {
      event.preventDefault();
      onProcessTranscript();
    }

    // Switch tabs: Alt + 1 (Original) or Alt + 2 (Formatted)
    if (event.altKey && onSwitchTab) {
      if (event.key === '1') {
        event.preventDefault();
        onSwitchTab('original');
      } else if (event.key === '2') {
        event.preventDefault();
        onSwitchTab('formatted');
      }
    }
  }, [onFetchTranscript, onProcessTranscript, onCopyOriginal, onCopyFormatted, onSwitchTab]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
