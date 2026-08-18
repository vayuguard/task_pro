import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthSession, isAuthenticated, needsMfa } from './auth';
import { apiLogin, apiVerifyMfa, apiLogout, apiMe, type GeoPoint } from '../api/client';

interface AuthContextValue {
  session: AuthSession | null;
  isLoggedIn: boolean;
  requiresMfa: boolean;
  loading: boolean;
  login: (
    email: string,
    password: string,
    location?: GeoPoint
  ) => Promise<{ ok: true; mfaRequired: boolean } | { ok: false; error: string }>;
  verifyMfa: (code: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiMe()
      .then((res) => setSession(res.session))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string, location?: GeoPoint) => {
    try {
      const result = await apiLogin(email, password, location);
      setSession(result.session);
      return { ok: true as const, mfaRequired: Boolean(result.mfaRequired) };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : 'Login failed.' };
    }
  }, []);

  const verifyMfa = useCallback(async (code: string) => {
    try {
      if (!session?.email) return { ok: false as const, error: 'No active session.' };
      const result = await apiVerifyMfa(session.email, code);
      setSession(result.session);
      return { ok: true as const };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : 'Verification failed.' };
    }
  }, [session?.email]);

  const logout = useCallback(() => {
    const readLocation = (): Promise<GeoPoint | undefined> =>
      new Promise((resolve) => {
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
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 60_000 }
        );
      });

    void readLocation()
      .then((location) => apiLogout(location))
      .catch(() => {});
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        isLoggedIn: isAuthenticated(session),
        requiresMfa: needsMfa(session),
        login,
        verifyMfa,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
