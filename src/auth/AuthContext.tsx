import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthSession, getSession, isAuthenticated, needsMfa, logout as clearLocalSession } from './auth';
import { apiLogin, apiVerifyMfa } from '../api/client';

const SESSION_KEY = 'taskpro_session';

function saveSession(session: AuthSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

interface AuthContextValue {
  session: AuthSession | null;
  isLoggedIn: boolean;
  requiresMfa: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  verifyMfa: (code: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => getSession());

  useEffect(() => {
    setSession(getSession());
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await apiLogin(email, password);
      saveSession(result.session);
      setSession(result.session);
      return { ok: true as const };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : 'Login failed.' };
    }
  }, []);

  const verifyMfa = useCallback(async (code: string) => {
    try {
      const current = getSession();
      if (!current) {
        return { ok: false as const, error: 'No active session. Please log in again.' };
      }
      const result = await apiVerifyMfa(current.email, code);
      saveSession(result.session);
      setSession(result.session);
      return { ok: true as const };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : 'Verification failed.' };
    }
  }, []);

  const logout = useCallback(() => {
    clearLocalSession();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
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
