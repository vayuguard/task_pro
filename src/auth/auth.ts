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

/** Demo MFA code for admin accounts */
export const DEMO_MFA_CODE = '123456';

/** Only admin is seeded. Employees are created by admin and notified by email. */
export const ADMIN_SEED: AuthAccount = {
  id: 'admin-1',
  email: 'ritesh.prajapati@vayuguard.com',
  password: 'rudr123',
  role: 'admin',
  mfaRequired: true,
  profile: {
    name: 'Ritesh Prajapati',
    email: 'ritesh.prajapati@vayuguard.com',
    role: 'Admin',
    avatar: 'https://ui-avatars.com/api/?name=Ritesh+Prajapati&background=6366f1&color=fff'
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

  if (code.trim() !== DEMO_MFA_CODE) {
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

const ADMIN_SCREENS: ActiveScreen[] = ['admin-dashboard', 'performance'];
const SHARED_SCREENS: ActiveScreen[] = [
  'employee-dashboard',
  'kanban-board',
  'task-details',
  'team-chat',
  'settings'
];

export function canAccessScreen(role: UserRole, screen: ActiveScreen): boolean {
  if (SHARED_SCREENS.includes(screen)) return true;
  if (ADMIN_SCREENS.includes(screen)) return role === 'admin';
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
