import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiGetAttendance } from '../api/client';
import { PageHeader, Panel } from '../components/ui/Panel';
import { PageLoading } from '../components/ui/Skeleton';
import { DateCalendar } from '../components/ui/DateCalendar';
import { formatTimeIST } from '../utils/time';

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
  const [calendarOpen, setCalendarOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAdmin) return;
    apiGetAttendance(45)
      .then((r) => setRows(r.rows))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load attendance'))
      .finally(() => setLoading(false));
  }, [session?.userId, isAdmin]);

  useEffect(() => {
    if (!calendarOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setCalendarOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCalendarOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [calendarOpen]);

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

  const dateLabel = dayFilter === 'all' ? 'All dates' : dayFilter;

  if (!isAdmin) return <Navigate to="/" replace />;
  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        subtitle="Employee-wise daily attendance · login place · office enter/leave · logout"
      />
      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex flex-wrap gap-3 items-end">
        <label className="block text-xs font-semibold text-ink-muted w-full sm:w-64">
          Employee
          <select
            className="input mt-1.5"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="all">All employees</option>
            {employees.map(([email, name]) => (
              <option key={email} value={email}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <div className="relative" ref={popRef}>
          <p className="text-xs font-semibold text-ink-muted mb-1.5">Date</p>
          <button
            type="button"
            className="btn btn-secondary min-w-[12rem] justify-between gap-3"
            onClick={() => setCalendarOpen((v) => !v)}
            aria-expanded={calendarOpen}
          >
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            <span className="flex-1 text-left">{dateLabel}</span>
            <span className="material-symbols-outlined text-[18px]">
              {calendarOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {calendarOpen && (
            <div className="absolute left-0 top-full mt-2 z-50">
              <DateCalendar
                value={dayFilter}
                markedDays={markedDays}
                onChange={(next) => {
                  setDayFilter(next);
                  setCalendarOpen(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

      <Panel padded={false} className="panel-3d overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-4 text-sm text-ink-muted">No attendance records for this filter.</p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full table-fixed text-sm table-3d">
              <colgroup>
                <col className="w-[9%]" />
                <col className="w-[12%]" />
                <col className="w-[16%]" />
                <col className="w-[10%]" />
                <col className="w-[21%]" />
                <col className="w-[10%]" />
                <col className="w-[11%]" />
                <col className="w-[11%]" />
              </colgroup>
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-ink-muted">
                  <th className="p-2.5 sm:p-3">Date</th>
                  <th className="p-2.5 sm:p-3">Name</th>
                  <th className="p-2.5 sm:p-3">Email</th>
                  <th className="p-2.5 sm:p-3">Login</th>
                  <th className="p-2.5 sm:p-3">Login location</th>
                  <th className="p-2.5 sm:p-3">Office enter</th>
                  <th className="p-2.5 sm:p-3">Logout</th>
                  <th className="p-2.5 sm:p-3">Office leave</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="row-3d align-top">
                    <td className="p-2.5 sm:p-3 tabular-nums text-xs cell-3d">{r.date}</td>
                    <td className="p-2.5 sm:p-3 font-medium text-xs cell-3d break-words">{r.name}</td>
                    <td className="p-2.5 sm:p-3 text-ink-muted text-xs cell-3d break-all">{r.email}</td>
                    <td className="p-2.5 sm:p-3 tabular-nums text-xs cell-3d">{fmtClock(r.loginAt)}</td>
                    <td className="p-2.5 sm:p-3 text-xs text-ink-muted cell-3d break-words leading-snug">
                      {r.loginLocation?.label ||
                        (r.locationStatus === 'unavailable' ? 'Not recorded' : '—')}
                    </td>
                    <td className="p-2.5 sm:p-3 tabular-nums text-xs cell-3d">{fmtClock(r.officeEnterAt)}</td>
                    <td className="p-2.5 sm:p-3 tabular-nums text-xs cell-3d">{fmtClock(r.logoutAt)}</td>
                    <td className="p-2.5 sm:p-3 tabular-nums text-xs cell-3d">{fmtClock(r.officeLeaveAt)}</td>
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
