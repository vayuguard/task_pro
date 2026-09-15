import type { ServerSession } from './auth/session.ts';
import { getDb } from './db.ts';
import { haversineMeters, withPlaceName } from './geo.ts';

export type OfficeFence = {
  lat: number;
  lng: number;
  radiusM: number;
  label: string;
};

export type OfficeEventKind = 'office_enter' | 'office_leave';

const DEFAULT_RADIUS_M = 150;
const MIN_EVENT_GAP_MS = 90_000;

function envNumber(name: string): number | undefined {
  const raw = String(process.env[name] || '').trim();
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function validFence(lat: number, lng: number, radiusM: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    Number.isFinite(radiusM) &&
    radiusM >= 30 &&
    radiusM <= 2000
  );
}

export async function getOfficeFence(): Promise<OfficeFence | null> {
  const doc = await getDb().collection('meta').findOne({ key: 'office' });
  const lat = typeof doc?.lat === 'number' ? doc.lat : envNumber('OFFICE_LAT');
  const lng = typeof doc?.lng === 'number' ? doc.lng : envNumber('OFFICE_LNG');
  const radiusM =
    typeof doc?.radiusM === 'number' ? doc.radiusM : envNumber('OFFICE_RADIUS_M') ?? DEFAULT_RADIUS_M;
  const label =
    (typeof doc?.label === 'string' && doc.label.trim()) ||
    String(process.env.OFFICE_LABEL || '').trim() ||
    'Office';
  if (lat == null || lng == null || !validFence(lat, lng, radiusM)) return null;
  return { lat, lng, radiusM, label };
}

export async function saveOfficeFence(fence: OfficeFence): Promise<OfficeFence> {
  if (!validFence(fence.lat, fence.lng, fence.radiusM)) {
    throw new Error('Office location must include valid coordinates and a radius between 30m and 2000m.');
  }
  const next: OfficeFence = {
    lat: fence.lat,
    lng: fence.lng,
    radiusM: Math.round(fence.radiusM),
    label: fence.label.trim() || 'Office'
  };
  await getDb().collection('meta').updateOne(
    { key: 'office' },
    { $set: { key: 'office', ...next, updatedAt: new Date() } },
    { upsert: true }
  );
  return next;
}

function sideOfFence(distanceM: number, radiusM: number): 'in' | 'out' | 'edge' {
  const buffer = Math.max(40, radiusM * 0.25);
  if (distanceM <= radiusM) return 'in';
  if (distanceM >= radiusM + buffer) return 'out';
  return 'edge';
}

export async function applyPresenceSample(opts: {
  session: ServerSession;
  location: { lat?: number; lng?: number; accuracy?: number; label?: string; source?: string } | null;
  ip: string;
  emit: boolean;
}): Promise<{ tracked: boolean; inside: boolean | null; event: OfficeEventKind | null }> {
  const fence = await getOfficeFence();
  if (!fence) return { tracked: false, inside: null, event: null };

  const point = await withPlaceName(opts.location);
  if (!point) return { tracked: true, inside: null, event: null };

  const distanceM = Math.round(haversineMeters(point, fence));
  const side = sideOfFence(distanceM, fence.radiusM);
  const col = getDb().collection('presence_state');
  const prev = await col.findOne({ userId: opts.session.userId });
  const previous: 'in' | 'out' | null = prev?.inside === true ? 'in' : prev?.inside === false ? 'out' : null;
  const confirmed: 'in' | 'out' | null = side === 'edge' ? previous : side;

  await col.updateOne(
    { userId: opts.session.userId },
    {
      $set: {
        userId: opts.session.userId,
        email: opts.session.email.toLowerCase(),
        name: opts.session.profile.name,
        sessionId: opts.session.id,
        inside: confirmed === 'in' ? true : confirmed === 'out' ? false : prev?.inside ?? null,
        lastAt: new Date(),
        lastDistanceM: distanceM,
        lastLocation: point,
        lastIp: opts.ip
      }
    },
    { upsert: true }
  );

  if (!opts.emit || confirmed == null || previous == null || confirmed === previous) {
    return { tracked: true, inside: confirmed === 'in', event: null };
  }

  const lastEventAt = prev?.lastEventAt ? new Date(prev.lastEventAt).getTime() : 0;
  if (Date.now() - lastEventAt < MIN_EVENT_GAP_MS) {
    return { tracked: true, inside: confirmed === 'in', event: null };
  }

  const kind: OfficeEventKind = confirmed === 'in' ? 'office_enter' : 'office_leave';
  const at = new Date();
  await getDb().collection('location_events').insertOne({
    id: `loc-${opts.session.userId}-${at.getTime()}`,
    kind,
    email: opts.session.email.toLowerCase(),
    name: opts.session.profile.name,
    sessionId: opts.session.id,
    at,
    ip: opts.ip,
    location: point,
    distanceM,
    officeLabel: fence.label
  });
  await col.updateOne({ userId: opts.session.userId }, { $set: { lastEventAt: at, lastEventKind: kind } });
  return { tracked: true, inside: confirmed === 'in', event: kind };
}
