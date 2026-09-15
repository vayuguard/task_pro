import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiGetActivity, apiGetLoginLog, apiGetOfficeLog } from '../api/client';
import { PageHeader, Panel } from '../components/ui/Panel';
import { PageLoading } from '../components/ui/Skeleton';
import { Tabs } from '../components/ui/Tabs';
import { nowTimestamp } from '../utils/time';

export default function ActivityPage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'events' | 'logins' | 'office'>('events');
  const [events, setEvents] = useState<
    Array<{
      id: string;
      kind: 'audit' | 'task';
      action: string;
      actor: string;
      target: string;
      detail: Record<string, unknown>;
      createdAt: string;
    }>
  >([]);
  const [officeLog, setOfficeLog] = useState<
    Array<{
      id: string;
      kind: 'office_enter' | 'office_leave';
      email: string;
      name: string;
      at: string;
      ip: string;
      location: { lat: number; lng: number; accuracy?: number; label?: string } | null;
      distanceM: number | null;
      officeLabel: string;
    }>
  >([]);
  const [loginLog, setLoginLog] = useState<
    Array<{
      email: string;
      name: string;
      ip: string;
      enterAt: string;
      enterIp: string;
      enterLocation: { lat: number; lng: number; accuracy?: number; label?: string } | null;
      exitAt: string | null;
      exitIp: string;
      exitLocation: { lat: number; lng: number; accuracy?: number; label?: string } | null;
    }>
  >([]);

  useEffect(() => {
    if (session?.role !== 'admin') return;
    Promise.all([
      apiGetActivity(100).then((r) => setEvents(r.events)),
      apiGetLoginLog(100).then((r) => setLoginLog(r.entries)),
      apiGetOfficeLog(100).then((r) => setOfficeLog(r.entries))
    ])
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load activity'))
      .finally(() => setLoading(false));
  }, [session?.role]);

  if (session?.role !== 'admin') return <Navigate to="/" replace />;
  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader title="Activity" subtitle="Audit log, login sessions, and office arrivals" />
      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      <Tabs
        active={tab}
        onChange={(id) => setTab(id as typeof tab)}
        tabs={[
          { id: 'events', label: `Events (${events.length})`, icon: 'history' },
          { id: 'logins', label: `Login log (${loginLog.length})`, icon: 'login' },
          { id: 'office', label: `Office (${officeLog.length})`, icon: 'location_on' }
        ]}
      />

      {tab === 'events' && (
        <div className="panel divide-y divide-border">
          {events.length === 0 ? (
            <p className="p-4 text-sm text-ink-muted">No events yet.</p>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="p-4 flex gap-3">
                <span
                  className={`mt-0.5 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md h-fit ${
                    ev.kind === 'audit' ? 'bg-accent-soft text-accent' : 'bg-surface-sunken text-ink-muted'
                  }`}
                >
                  {ev.kind}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">
                    {ev.action}
                    {ev.target ? (
                      <>
                        {' · '}
                        {ev.target.startsWith('Task') || ev.target.includes('-') ? (
                          <Link to={`/tasks/${ev.target}`} className="text-accent hover:underline">
                            {ev.target}
                          </Link>
                        ) : (
                          <span className="text-ink-muted">{ev.target}</span>
                        )}
                      </>
                    ) : null}
                  </p>
                  <p className="text-xs text-ink-faint mt-0.5">
                    {ev.actor} · {ev.createdAt ? nowTimestamp(new Date(ev.createdAt)) : ''}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'logins' && (
        <Panel padded={false}>
          {loginLog.length === 0 ? (
            <p className="p-4 text-sm text-ink-muted">No login records yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-muted border-b border-border">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">IP address</th>
                  <th className="p-3">Login location</th>
                  <th className="p-3">Login (IST)</th>
                  <th className="p-3">Logout location</th>
                  <th className="p-3">Logout (IST)</th>
                </tr>
              </thead>
              <tbody>
                {loginLog.map((entry, i) => (
                  <tr key={`${entry.email}-${i}`} className="border-b border-border last:border-0">
                    <td className="p-3 font-medium">{entry.name}</td>
                    <td className="p-3 text-ink-muted">{entry.email}</td>
                    <td className="p-3 font-mono text-ink-faint">
                      {entry.enterIp || entry.ip || '—'}
                    </td>
                    <td className="p-3 text-ink-muted text-xs max-w-[14rem]">
                      {entry.enterLocation?.label || '—'}
                    </td>
                    <td className="p-3 tabular-nums">
                      {entry.enterAt ? nowTimestamp(new Date(entry.enterAt)) : '—'}
                    </td>
                    <td className="p-3 text-ink-muted text-xs max-w-[14rem]">
                      {entry.exitLocation?.label || '—'}
                    </td>
                    <td className="p-3 tabular-nums">
                      {entry.exitAt ? nowTimestamp(new Date(entry.exitAt)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      )}

      {tab === 'office' && (
        <Panel padded={false}>
          {officeLog.length === 0 ? (
            <p className="p-4 text-sm text-ink-muted">
              No office enter/leave records yet. Set the office pin in Settings, then keep the app open during the day.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-muted border-b border-border">
                  <th className="p-3">Name</th>
                  <th className="p-3">Event</th>
                  <th className="p-3">Place</th>
                  <th className="p-3">Distance</th>
                  <th className="p-3">Time (IST)</th>
                </tr>
              </thead>
              <tbody>
                {officeLog.map((entry) => (
                  <tr key={entry.id} className="border-b border-border last:border-0">
                    <td className="p-3">
                      <p className="font-medium">{entry.name}</p>
                      <p className="text-xs text-ink-faint">{entry.email}</p>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${
                          entry.kind === 'office_enter'
                            ? 'bg-accent-soft text-accent'
                            : 'bg-surface-sunken text-ink-muted'
                        }`}
                      >
                        {entry.kind === 'office_enter' ? 'Entered office' : 'Left office'}
                      </span>
                    </td>
                    <td className="p-3 text-ink-muted text-xs max-w-[16rem]">
                      {entry.location?.label || entry.officeLabel}
                    </td>
                    <td className="p-3 tabular-nums text-ink-muted">
                      {entry.distanceM != null ? `${entry.distanceM}m` : '—'}
                    </td>
                    <td className="p-3 tabular-nums">
                      {entry.at ? nowTimestamp(new Date(entry.at)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      )}
    </div>
  );
}
