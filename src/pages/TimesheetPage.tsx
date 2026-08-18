import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiGetTimesheet } from '../api/client';
import { PageHeader, Panel } from '../components/ui/Panel';
import { PageLoading } from '../components/ui/Skeleton';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { formatIsoDateIST } from '../utils/time';

export default function TimesheetPage() {
  const { session } = useAuth();
  const isAdmin = session?.role === 'admin';
  const today = formatIsoDateIST();
  const defaultFrom = formatIsoDateIST(new Date(Date.now() - 13 * 86_400_000));
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(today);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<
    Array<{
      date: string;
      email: string;
      name: string;
      hours: number;
      tasks: Array<{ id: string; title: string; hours: number }>;
    }>
  >([]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiGetTimesheet(from, to, isAdmin ? email || undefined : undefined);
      setRows(res.rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timesheet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const totals = useMemo(() => {
    const byPerson = new Map<string, number>();
    let hours = 0;
    for (const row of rows) {
      hours += row.hours;
      const key = row.email || row.name;
      byPerson.set(key, (byPerson.get(key) || 0) + row.hours);
    }
    return { hours, people: byPerson.size };
  }, [rows]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timesheet"
        subtitle="Certified In Progress hours (Mon–Sat 10:00–18:00 IST, holidays excluded)"
      />
      <Panel>
        <form
          className="grid sm:grid-cols-4 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void load();
          }}
        >
          <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          {isAdmin && (
            <Input
              label="Email (optional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Filter one person"
            />
          )}
          <div className="flex items-end">
            <Button type="submit">Load</Button>
          </div>
        </form>
        <p className="text-xs text-ink-faint mt-3">
          {totals.people} {totals.people === 1 ? 'person' : 'people'} · {totals.hours.toFixed(1)}h credited
        </p>
      </Panel>
      {loading ? (
        <PageLoading />
      ) : error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-ink-muted">No credited hours in this range.</p>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-muted border-b border-border">
                <th className="p-3">Date</th>
                <th className="p-3">Person</th>
                <th className="p-3">Hours</th>
                <th className="p-3">Tasks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.date}-${row.email}`} className="border-b border-border last:border-0">
                  <td className="p-3 whitespace-nowrap tabular-nums">{row.date}</td>
                  <td className="p-3">
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs text-ink-faint">{row.email}</p>
                  </td>
                  <td className="p-3 font-semibold tabular-nums">{row.hours.toFixed(1)}h</td>
                  <td className="p-3">
                    <ul className="space-y-1">
                      {row.tasks.map((t) => (
                        <li key={t.id}>
                          <Link to={`/tasks/${t.id}`} className="text-accent hover:underline">
                            {t.title}
                          </Link>
                          <span className="text-ink-faint ml-1 tabular-nums">{t.hours.toFixed(1)}h</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
