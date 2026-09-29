import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiGetAttendance } from '../api/client';
import { PageHeader, Panel } from '../components/ui/Panel';
import { PageLoading } from '../components/ui/Skeleton';
import { DateCalendar } from '../components/ui/DateCalendar';
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

  const markedDays = useMemo(() => new Set(rows.map((r) => r.date)), [rows]);

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

      <div className="grid lg:grid-cols-[280px_1fr] gap-4 items-start">
        <div className="space-y-3">
          {isAdmin && (
            <label className="block text-xs font-semibold text-ink-muted">
              Employee
              <select
                className="input mt-1.5"
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
              >
                <option value="all">All employees</option>
                {employees.map(([email, name]) => (
                  <option key={email} value={email}>
                    {name} ({email})
                  </option>
                ))}
              </select>
            </label>
          )}
          <div>
            <p className="text-xs font-semibold text-ink-muted mb-1.5">
              Date {dayFilter !== 'all' ? `· ${dayFilter}` : '· all'}
            </p>
            <DateCalendar value={dayFilter} onChange={setDayFilter} markedDays={markedDays} />
          </div>
        </div>

        <Panel padded={false} className="panel-3d overflow-hidden">
          {filtered.length === 0 ? (
            <p className="p-4 text-sm text-ink-muted">No attendance records for this filter.</p>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm min-w-[960px] table-3d">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-ink-muted">
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
                    <tr key={r.id} className="row-3d">
                      <td className="p-3 tabular-nums whitespace-nowrap cell-3d">{r.date}</td>
                      <td className="p-3 font-medium whitespace-nowrap cell-3d">{r.name}</td>
                      <td className="p-3 text-ink-muted text-xs cell-3d">{r.email}</td>
                      <td className="p-3 tabular-nums whitespace-nowrap cell-3d">
                        <div>{fmtWhen(r.loginAt)}</div>
                        <div className="text-[11px] text-ink-faint">{fmtClock(r.loginAt)}</div>
                      </td>
                      <td className="p-3 text-xs text-ink-muted max-w-[16rem] cell-3d">
                        {r.loginLocation?.label ||
                          (r.locationStatus === 'unavailable' ? 'Not recorded' : '—')}
                      </td>
                      <td className="p-3 tabular-nums whitespace-nowrap cell-3d">{fmtWhen(r.officeEnterAt)}</td>
                      <td className="p-3 tabular-nums whitespace-nowrap cell-3d">{fmtWhen(r.logoutAt)}</td>
                      <td className="p-3 tabular-nums whitespace-nowrap cell-3d">{fmtWhen(r.officeLeaveAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
