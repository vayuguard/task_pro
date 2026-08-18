export type GeoPoint = {
  lat: number;
  lng: number;
  accuracy?: number;
  label?: string;
  source?: string;
};

const cache = new Map<string, string>();

function cacheKey(lat: number, lng: number) {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

function fromAddress(address: Record<string, string> | undefined, displayName?: string): string {
  if (address) {
    const parts = [
      address.neighbourhood || address.suburb || address.village || address.hamlet,
      address.city || address.town || address.county,
      address.state,
      address.country
    ].filter((p, i, arr) => Boolean(p) && arr.indexOf(p) === i);
    if (parts.length) return parts.join(', ');
  }
  if (displayName) {
    return displayName.split(',').slice(0, 3).map((s) => s.trim()).join(', ');
  }
  return '';
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const key = cacheKey(lat, lng);
  const cached = cache.get(key);
  if (cached) return cached;

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}&format=jsonv2&zoom=16&addressdetails=1`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'TaskPro/1.0 (attendance reverse geocode)'
      }
    });
    if (!res.ok) return '';
    const data = (await res.json()) as { display_name?: string; address?: Record<string, string> };
    const label = fromAddress(data.address, data.display_name);
    if (label) cache.set(key, label);
    return label;
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

export async function withPlaceName(
  point: { lat?: number; lng?: number; accuracy?: number; label?: string; source?: string } | null | undefined
): Promise<GeoPoint | null> {
  if (
    !point ||
    typeof point.lat !== 'number' ||
    typeof point.lng !== 'number' ||
    !Number.isFinite(point.lat) ||
    !Number.isFinite(point.lng)
  ) {
    return null;
  }
  const label = point.label || (await reverseGeocode(point.lat, point.lng));
  return {
    lat: point.lat,
    lng: point.lng,
    accuracy: typeof point.accuracy === 'number' && Number.isFinite(point.accuracy) ? point.accuracy : undefined,
    source: point.source,
    label: label || undefined
  };
}
