import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../auth/AuthContext';
import { apiGetAttendanceToday } from '../api/client';
import { PageHeader, Panel } from '../components/ui/Panel';
import { PageLoading } from '../components/ui/Skeleton';
import { AttendanceScene } from '../components/scene/AttendanceScene';
import { nowTimestamp } from '../utils/time';

export default function AttendancePage() {
  const { session } = useAuth();
  const isAdmin = session?.role === 'admin';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [day, setDay] = useState('');
  const [sundayOff, setSundayOff] = useState(false);
  const [rows, setRows] = useState<
    Array<{
      email: string;
      name: string;
      enterAt: string;
      exitAt: string | null;
      enterLocation: { lat: number; lng: number; label?: string } | null;
      locationStatus: string;
      insideOffice: boolean;
      officeDistanceM: number | null;
      liveTask: { id: string; title: string } | null;
    }>
  >([]);
  const [events, setEvents] = useState<
    Array<{
      id: string;
      kind: 'office_enter' | 'office_leave';
      email: string;
      name: string;
      at: string;
      location: { label?: string } | null;
      officeLabel: string;
    }>
  >([]);

  useEffect(() => {
    apiGetAttendanceToday()
      .then((r) => {
        setDay(r.day);
        setSundayOff(r.sundayOff);
        setRows(r.rows);
        setEvents(r.events);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load attendance'))
      .finally(() => setLoading(false));
  }, [session?.userId]);

  const mine = useMemo(
    () => rows.find((r) => r.email === session?.email.toLowerCase()) || rows[0],
    [rows, session?.email]
  );

  const tone = mine?.insideOffice ? 'office' : mine?.liveTask ? 'live' : mine ? 'idle' : 'idle';

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        subtitle={`Today ${day} · Mon–Sat work days · Sunday weekly off`}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      {sundayOff && (
        <p className="text-sm rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-ink">
          Sunday is a weekly off — no credited work hours today.
        </p>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel p-0 overflow-hidden lg:col-span-1 min-h-[220px] relative"
        >
          <AttendanceScene tone={tone} className="absolute inset-0 h-full w-full" />
          <div className="relative z-10 p-5 bg-gradient-to-t from-surface-raised via-surface-raised/80 to-transparent mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Status</p>
            <p className="text-lg font-semibold text-ink mt-1">
              {mine?.insideOffice ? 'At office' : mine ? 'Signed in' : 'No punch yet'}
            </p>
            <p className="text-xs text-ink-faint mt-1">
              {mine?.enterLocation?.label ||
                (mine?.locationStatus === 'unavailable' ? 'Location not recorded' : '—')}
            </p>
          </div>
        </motion.div>

        <Panel className="lg:col-span-2">
          <h2 className="text-sm font-semibold mb-3">{isAdmin ? 'Team today' : 'Your punch'}</h2>
          {rows.length === 0 ? (
            <p className="text-sm text-ink-muted">No login records for today yet.</p>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-ink-muted border-b border-border">
                    <th className="pb-2 pr-3">Name</th>
                    <th className="pb-2 pr-3">Login</th>
                    <th className="pb-2 pr-3">Place</th>
                    <th className="pb-2 pr-3">Office</th>
                    <th className="pb-2">Live task</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.email} className="border-b border-border last:border-0">
                      <td className="py-2.5 pr-3">
                        <p className="font-medium">{r.name}</p>
                        <p className="text-xs text-ink-faint">{r.email}</p>
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums">
                        {r.enterAt ? nowTimestamp(new Date(r.enterAt)) : '—'}
                      </td>
                      <td className="py-2.5 pr-3 text-xs text-ink-muted max-w-[12rem]">
                        {r.enterLocation?.label ||
                          (r.locationStatus === 'unavailable' ? 'Unavailable' : '—')}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            r.insideOffice ? 'bg-accent-soft text-accent' : 'bg-surface-sunken text-ink-muted'
                          }`}
                        >
                          {r.insideOffice ? 'Inside' : 'Outside'}
                        </span>
                      </td>
                      <td className="py-2.5">
                        {r.liveTask ? (
                          <Link to={`/tasks/${r.liveTask.id}`} className="text-accent hover:underline text-xs">
                            {r.liveTask.title}
                          </Link>
                        ) : (
                          <span className="text-xs text-ink-faint">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      <Panel>
        <h2 className="text-sm font-semibold mb-3">Office enter / leave today</h2>
        {events.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No fence crossings yet. Set the office pin in Settings to track arrivals.
          </p>
        ) : (
          <ul className="space-y-2">
            {events.map((ev) => (
              <li key={ev.id} className="flex items-start gap-3 text-sm border-b border-border last:border-0 py-2">
                <span
                  className={`mt-0.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                    ev.kind === 'office_enter' ? 'bg-accent-soft text-accent' : 'bg-surface-sunken text-ink-muted'
                  }`}
                >
                  {ev.kind === 'office_enter' ? 'Enter' : 'Leave'}
                </span>
                <div className="min-w-0">
                  <p className="font-medium">
                    {ev.name} · {ev.location?.label || ev.officeLabel}
                  </p>
                  <p className="text-xs text-ink-faint">{ev.at ? nowTimestamp(new Date(ev.at)) : ''}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
