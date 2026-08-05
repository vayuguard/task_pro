import { useEffect, useState } from 'react';

/**
 * Re-renders on an interval so running timers stay current.
 * Pauses while the tab is hidden to avoid pointless work.
 */
export function useLiveTick(intervalMs = 1000, enabled = true): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;

    let id: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      stop();
      id = setInterval(() => setNow(Date.now()), intervalMs);
    };
    const stop = () => {
      if (id) clearInterval(id);
      id = undefined;
    };
    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        setNow(Date.now());
        start();
      }
    };

    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [intervalMs, enabled]);

  return now;
}
