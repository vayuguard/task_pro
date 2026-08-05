import { randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import { getDb } from '../db.ts';

export const SESSION_COOKIE = 'taskpro_sid';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface ServerSession {
  id: string;
  userId: string;
  email: string;
  role: 'admin' | 'employee';
  profile: { name: string; email?: string; avatar: string; role?: string };
  mfaVerified: boolean;
  createdAt: Date;
  expiresAt: Date;
}

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    out[key] = decodeURIComponent(val);
  }
  return out;
}

export function getSessionIdFromRequest(req: Request): string | null {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[SESSION_COOKIE] || null;
}

export async function createSession(
  res: Response,
  data: Omit<ServerSession, 'id' | 'createdAt' | 'expiresAt'>
): Promise<ServerSession> {
  const id = randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  const session: ServerSession = { ...data, id, createdAt: now, expiresAt };
  await getDb().collection('sessions').insertOne(session);
  const secure = process.env.NODE_ENV === 'production';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}${secure ? '; Secure' : ''}`
  );
  return session;
}

export async function destroySession(req: Request, res: Response): Promise<void> {
  const sid = getSessionIdFromRequest(req);
  if (sid) {
    await getDb().collection('sessions').deleteOne({ id: sid });
  }
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`);
}

export async function getSession(req: Request): Promise<ServerSession | null> {
  const sid = getSessionIdFromRequest(req);
  if (!sid) return null;
  const doc = await getDb().collection('sessions').findOne({ id: sid });
  if (!doc) return null;
  if (new Date(doc.expiresAt as Date) < new Date()) {
    await getDb().collection('sessions').deleteOne({ id: sid });
    return null;
  }
  return doc as unknown as ServerSession;
}

export async function touchSession(id: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await getDb().collection('sessions').updateOne({ id }, { $set: { expiresAt } });
}
