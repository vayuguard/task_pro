import { User, UserRole, ActiveScreen } from '../types';

export interface AuthAccount {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  mfaRequired: boolean;
  profile: User;
}

export interface AuthSession {
  userId: string;
  email: string;
  role: UserRole;
  profile: User;
  mfaVerified: boolean;
  loginAt: string;
}

const SESSION_KEY = 'taskpro_session';

function envString(name: string, fallback: string): string {
  try {
    const value = typeof process !== 'undefined' ? process.env?.[name] : undefined;
    const trimmed = String(value || '').trim();
    return trimmed || fallback;
  } catch {
    return fallback;
  }
}

const DEFAULT_ADMIN_EMAIL = 'reachus@vayuguard.com';
const DEFAULT_ADMIN_PASSWORD = 'vgctpl_ad@2022';
const DEFAULT_ADMIN_MFA = '202208';

/** Admin MFA — override with ADMIN_MFA_CODE in .env */
export const DEMO_MFA_CODE = envString('ADMIN_MFA_CODE', DEFAULT_ADMIN_MFA);

/** Only admin is seeded. Employees are created by admin and notified by email. */
export const ADMIN_SEED: AuthAccount = {
  id: 'admin-1',
  email: envString('ADMIN_EMAIL', DEFAULT_ADMIN_EMAIL).toLowerCase(),
  password: envString('ADMIN_PASSWORD', DEFAULT_ADMIN_PASSWORD),
  role: 'admin',
  mfaRequired: true,
  profile: {
    name: envString('ADMIN_NAME', 'Vayuguard Admin'),
    email: envString('ADMIN_EMAIL', DEFAULT_ADMIN_EMAIL).toLowerCase(),
    role: 'Admin',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(envString('ADMIN_NAME', 'Vayuguard Admin'))}&background=6366f1&color=fff`
  }
};

/** @deprecated Use ADMIN_SEED — kept for login demo button */
export const AUTH_ACCOUNTS: AuthAccount[] = [ADMIN_SEED];

export function login(email: string, password: string): { ok: true; session: AuthSession } | { ok: false; error: string } {
  const account = AUTH_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
  );

  if (!account) {
    return { ok: false as const, error: 'Invalid email or password.' };
  }

  const session: AuthSession = {
    userId: account.id,
    email: account.email,
    role: account.role,
    profile: account.profile,
    mfaVerified: !account.mfaRequired,
    loginAt: new Date().toISOString()
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true as const, session };
}

export function verifyMfa(code: string): { ok: true; session: AuthSession } | { ok: false; error: string } {
  const session = getSession();
  if (!session) {
    return { ok: false as const, error: 'No active session. Please log in again.' };
  }

  const submitted = String(code ?? '').trim().replace(/\s+/g, '');
  if (submitted !== DEMO_MFA_CODE) {
    return { ok: false as const, error: 'Invalid verification code.' };
  }

  const updated: AuthSession = { ...session, mfaVerified: true };
  localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  return { ok: true as const, session: updated };
}

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated(session: AuthSession | null): session is AuthSession {
  return session !== null && session.mfaVerified;
}

export function needsMfa(session: AuthSession | null): boolean {
  return session !== null && !session.mfaVerified;
}

const SHARED_SCREENS: ActiveScreen[] = [
  'employee-dashboard',
  'kanban-board',
  'task-details',
  'performance',
  'team-chat',
  'settings'
];

export function canAccessScreen(role: UserRole, screen: ActiveScreen): boolean {
  if (screen === 'admin-dashboard') return role === 'admin';
  if (SHARED_SCREENS.includes(screen)) return true;
  return false;
}

export function defaultScreenForRole(role: UserRole): ActiveScreen {
  return role === 'admin' ? 'admin-dashboard' : 'employee-dashboard';
}

export function canCreateTasks(_role: UserRole): boolean {
  return true;
}

export function canAssignToOthers(role: UserRole): boolean {
  return role === 'admin';
}

export function canViewAllTasks(role: UserRole): boolean {
  return role === 'admin';
}

export function canManageEmployees(role: UserRole): boolean {
  return role === 'admin';
}
