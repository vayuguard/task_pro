import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiGetActivity } from '../api/client';
import { PageHeader } from '../components/ui/Panel';
import { PageLoading } from '../components/ui/Skeleton';
import { nowTimestamp } from '../utils/time';

export default function ActivityPage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  useEffect(() => {
    if (session?.role !== 'admin') return;
    apiGetActivity(100)
      .then((r) => setEvents(r.events))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load activity'))
      .finally(() => setLoading(false));
  }, [session?.role]);

  if (session?.role !== 'admin') return <Navigate to="/" replace />;
  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader title="Activity" subtitle="Audit log and task events" />
      {error && <p className="text-sm text-danger mb-4">{error}</p>}

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
    </div>
  );
}
