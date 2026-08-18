import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiGetActivity, apiGetLoginLog } from '../api/client';
import { PageHeader, Panel } from '../components/ui/Panel';
import { PageLoading } from '../components/ui/Skeleton';
import { Tabs } from '../components/ui/Tabs';
import { nowTimestamp } from '../utils/time';

export default function ActivityPage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'events' | 'logins'>('events');
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
  const [loginLog, setLoginLog] = useState<
    Array<{
      email: string;
      name: string;
      ip: string;
      enterAt: string;
      enterIp: string;
      exitAt: string | null;
      exitIp: string;
    }>
  >([]);

  useEffect(() => {
    if (session?.role !== 'admin') return;
    Promise.all([
      apiGetActivity(100).then((r) => setEvents(r.events)),
      apiGetLoginLog(100).then((r) => setLoginLog(r.entries))
    ])
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load activity'))
      .finally(() => setLoading(false));
  }, [session?.role]);

  if (session?.role !== 'admin') return <Navigate to="/" replace />;
  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader title="Activity" subtitle="Audit log, task events, and login history" />
      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      <Tabs
        active={tab}
        onChange={(id) => setTab(id as typeof tab)}
        tabs={[
          { id: 'events', label: `Events (${events.length})`, icon: 'history' },
          { id: 'logins', label: `Login log (${loginLog.length})`, icon: 'login' }
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
                  <th className="p-3">Enter (IST)</th>
                  <th className="p-3">Exit (IST)</th>
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
                    <td className="p-3 tabular-nums">
                      {entry.enterAt ? nowTimestamp(new Date(entry.enterAt)) : '—'}
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
    </div>
  );
}
