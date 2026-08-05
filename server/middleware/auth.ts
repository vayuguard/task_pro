import type { Request, Response, NextFunction } from 'express';
import { getSession, touchSession, type ServerSession } from '../auth/session.ts';

export type AuthedRequest = Request & { session?: ServerSession };

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const session = await getSession(req);
  if (!session) {
    res.status(401).json({ ok: false, error: 'Authentication required.' });
    return;
  }
  if (!session.mfaVerified && session.role === 'admin') {
    res.status(401).json({ ok: false, error: 'MFA verification required.' });
    return;
  }
  req.session = session;
  touchSession(session.id).catch(() => {});
  next();
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.session || req.session.role !== 'admin') {
    res.status(403).json({ ok: false, error: 'Admin access required.' });
    return;
  }
  next();
}

export function sessionToClient(session: ServerSession) {
  return {
    userId: session.userId,
    email: session.email,
    role: session.role,
    profile: session.profile,
    mfaVerified: session.mfaVerified,
    loginAt: session.createdAt.toISOString()
  };
}
