import { useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { apiPresencePing, type GeoPoint } from '../../api/client';

function readPoint(): Promise<GeoPoint | undefined> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(undefined);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
      },
      () => resolve(undefined),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 30_000 }
    );
  });
}

/** Quiet GPS pings while logged in. Office enter/leave is decided on the server. */
export function OfficePresence() {
  const { isLoggedIn, session } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || !session) return;
    let cancelled = false;
    let lastSent = 0;

    const ping = () => {
      const now = Date.now();
      if (now - lastSent < 60_000) return;
      lastSent = now;
      void readPoint().then((point) => {
        if (cancelled || !point) return;
        void apiPresencePing(point).catch(() => {});
      });
    };

    ping();
    const intervalId = window.setInterval(ping, 90_000);
    const onVis = () => {
      if (document.visibilityState === 'visible') ping();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [isLoggedIn, session?.userId]);

  return null;
}
