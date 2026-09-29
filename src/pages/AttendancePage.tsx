import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiGetAttendance } from '../api/client';
import { PageHeader, Panel } from '../components/ui/Panel';
import { PageLoading } from '../components/ui/Skeleton';
import { formatTimeIST, nowTimestamp } from '../utils/time';

type AttendanceRow = {
  id: string;
  date: string;
  email: string;
  name: string;
  loginAt: string | null;
  loginLocation: { lat: number; lng: number; label?: string } | null;
  locationStatus: string;
  officeEnterAt: string | null;
  logoutAt: string | null;
  officeLeaveAt: string | null;
};

function fmtWhen(value: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return nowTimestamp(d);
}

function fmtClock(value: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return formatTimeIST(d);
}

export default function AttendancePage() {
  const { session } = useAuth();
  const isAdmin = session?.role === 'admin';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [dayFilter, setDayFilter] = useState('all');

  useEffect(() => {
    apiGetAttendance(45)
      .then((r) => setRows(r.rows))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load attendance'))
      .finally(() => setLoading(false));
  }, [session?.userId]);

  const employees = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rows) map.set(r.email, r.name);
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [rows]);

  const days = useMemo(() => [...new Set(rows.map((r) => r.date))].sort((a, b) => b.localeCompare(a)), [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (employeeFilter !== 'all' && r.email !== employeeFilter) return false;
      if (dayFilter !== 'all' && r.date !== dayFilter) return false;
      return true;
    });
  }, [rows, employeeFilter, dayFilter]);

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        subtitle={
          isAdmin
            ? 'Employee-wise daily attendance · login place · office enter/leave · logout'
            : 'Your daily attendance · login place · office enter/leave · logout'
        }
      />
      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex flex-wrap gap-3">
        {isAdmin && (
          <label className="text-xs font-semibold text-ink-muted flex items-center gap-2">
            Employee
            <select
              className="input w-auto py-1.5 px-3"
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
            >
              <option value="all">All</option>
              {employees.map(([email, name]) => (
                <option key={email} value={email}>
                  {name} ({email})
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="text-xs font-semibold text-ink-muted flex items-center gap-2">
          Date
          <select className="input w-auto py-1.5 px-3" value={dayFilter} onChange={(e) => setDayFilter(e.target.value)}>
            <option value="all">All days</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Panel padded={false}>
        {filtered.length === 0 ? (
          <p className="p-4 text-sm text-ink-muted">No attendance records yet.</p>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm min-w-[960px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-muted border-b border-border">
                  <th className="p-3">Date</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Login time</th>
                  <th className="p-3">Login location</th>
                  <th className="p-3">Office enter</th>
                  <th className="p-3">Logout / auto-logout</th>
                  <th className="p-3">Office leave</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 align-top">
                    <td className="p-3 tabular-nums whitespace-nowrap">{r.date}</td>
                    <td className="p-3 font-medium whitespace-nowrap">{r.name}</td>
                    <td className="p-3 text-ink-muted text-xs">{r.email}</td>
                    <td className="p-3 tabular-nums whitespace-nowrap">
                      <div>{fmtWhen(r.loginAt)}</div>
                      <div className="text-[11px] text-ink-faint">{fmtClock(r.loginAt)}</div>
                    </td>
                    <td className="p-3 text-xs text-ink-muted max-w-[16rem]">
                      {r.loginLocation?.label ||
                        (r.locationStatus === 'unavailable' ? 'Not recorded' : '—')}
                    </td>
                    <td className="p-3 tabular-nums whitespace-nowrap">{fmtWhen(r.officeEnterAt)}</td>
                    <td className="p-3 tabular-nums whitespace-nowrap">{fmtWhen(r.logoutAt)}</td>
                    <td className="p-3 tabular-nums whitespace-nowrap">{fmtWhen(r.officeLeaveAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
