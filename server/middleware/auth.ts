import type { Request, Response, NextFunction } from 'express';
import { getSession, destroySession, touchSession, type ServerSession } from '../auth/session.ts';
import { getDb } from '../db.ts';
import { getIstHour } from '../istTime.ts';
import { withPlaceName } from '../geo.ts';

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
  // Employees are auto-logged-out at 18:00 IST (6 PM).
  if (session.role === 'employee') {
    const { hour } = getIstHour();
    if (hour >= 18) {
      const loginIp =
        String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
      const exitLocation = await withPlaceName(
        typeof session.loginLat === 'number' && typeof session.loginLng === 'number'
          ? { lat: session.loginLat, lng: session.loginLng, source: 'last-known-login' }
          : null
      );
      void getDb().collection('login_log').updateOne(
        { sessionId: session.id },
        {
          $set: {
            exitAt: new Date(),
            exitIp: loginIp,
            exitLocation
          }
        }
      );
      await destroySession(req, res);
      res.status(401).json({ ok: false, error: 'Work hours ended at 6:00 PM IST. You have been logged out.' });
      return;
    }
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
